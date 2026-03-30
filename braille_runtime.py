#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import queue
import shutil
import socket
import subprocess
import threading
import time
import urllib.parse
from dataclasses import dataclass
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any


def env_flag(name: str, default: str = "0") -> bool:
    return os.environ.get(name, default).lower() in {"1", "true", "yes", "on"}


@dataclass
class RuntimeConfig:
    state_dir: Path
    web_dir: Path
    channel: str
    dialect: str
    part: str
    chain: str
    orbit_mod: int
    window_size: int
    mqtt_enable: bool
    mqtt_host: str
    mqtt_port: int
    memcached_enable: bool
    memcached_host: str
    memcached_port: int
    http_host: str
    http_port: int

    @property
    def rel_log(self) -> Path:
        return self.state_dir / "rel.log"

    @property
    def raw_log(self) -> Path:
        return self.state_dir / "raw.log"

    @property
    def latest_json(self) -> Path:
        return self.state_dir / "cache" / "latest.json"

    @property
    def tip_json(self) -> Path:
        return self.state_dir / "cache" / "tip.json"

    @property
    def presence_json(self) -> Path:
        return self.state_dir / "signals" / "presence.json"

    @property
    def signals_dir(self) -> Path:
        return self.state_dir / "signals" / "queues"


def load_config(args: argparse.Namespace) -> RuntimeConfig:
    state_dir = Path(args.state_dir or os.environ.get("STATE_DIR", "./runtime")).resolve()
    web_dir = Path(args.web_dir or os.environ.get("WEB_DIR", "./web")).resolve()
    channel = args.channel or os.environ.get("CHANNEL", "default")
    dialect = args.dialect or os.environ.get("DIALECT", "default")
    part = str(args.part if args.part is not None else os.environ.get("PART", "0"))
    chain = str(args.chain if args.chain is not None else os.environ.get("CHAIN", "0"))
    orbit_mod = int(args.orbit_mod or os.environ.get("ORBIT_MOD", "5040"))
    window_size = int(args.window_size or os.environ.get("WINDOW_SIZE", "64"))
    mqtt_enable = env_flag("MQTT_ENABLE", "0")
    memcached_enable = env_flag("MEMCACHED_ENABLE", "0")
    return RuntimeConfig(
        state_dir=state_dir,
        web_dir=web_dir,
        channel=channel,
        dialect=dialect,
        part=part,
        chain=chain,
        orbit_mod=orbit_mod,
        window_size=window_size,
        mqtt_enable=mqtt_enable,
        mqtt_host=os.environ.get("MQTT_HOST", "127.0.0.1"),
        mqtt_port=int(os.environ.get("MQTT_PORT", "1883")),
        memcached_enable=memcached_enable,
        memcached_host=os.environ.get("MEMCACHED_HOST", "127.0.0.1"),
        memcached_port=int(os.environ.get("MEMCACHED_PORT", "11211")),
        http_host=os.environ.get("HTTP_HOST", "127.0.0.1"),
        http_port=int(os.environ.get("HTTP_PORT", "8008")),
    )


def ensure_dirs(config: RuntimeConfig) -> None:
    (config.state_dir / "cache" / "windows").mkdir(parents=True, exist_ok=True)
    (config.state_dir / "cache" / "coords").mkdir(parents=True, exist_ok=True)
    (config.state_dir / "signals" / "queues").mkdir(parents=True, exist_ok=True)
    config.rel_log.parent.mkdir(parents=True, exist_ok=True)
    config.rel_log.touch(exist_ok=True)
    config.raw_log.touch(exist_ok=True)
    if not config.presence_json.exists():
        config.presence_json.write_text("[]", encoding="utf-8")


def safe_segment(value: Any) -> str:
    return "".join(ch if ch.isalnum() or ch in {"-", "_", "."} else "_" for ch in str(value))


def parse_event(line: str) -> dict[str, Any] | None:
    try:
        event = json.loads(line)
    except json.JSONDecodeError:
        return None
    required = {"braille", "curr8", "curr6", "d1_6", "d2_6", "d1_8", "d2_8", "rel16", "rows", "orbit", "part", "dialect", "chain", "step", "path"}
    if not required.issubset(event.keys()):
        return None
    if "selectors" not in event and isinstance(event.get("rows"), list) and len(event["rows"]) == 4:
        event["selectors"] = {
            "FS": event["rows"][0],
            "GS": event["rows"][1],
            "US": event["rows"][2],
            "RS": event["rows"][3],
        }
    if "rows_hex" not in event and isinstance(event.get("rows"), list) and len(event["rows"]) == 4:
        event["rows_hex"] = ",".join(f"0x{value}" for value in event["rows"])
    event.setdefault("orbit_step", event.get("orbit", 0))
    if "hexagram_index" not in event:
        try:
            hexagram_index = int(str(event.get("curr6", "0")), 16) & 63
        except ValueError:
            hexagram_index = 0
        codepoint = 0x4DC0 + hexagram_index
        event["hexagram_index"] = hexagram_index
        event["hexagram_order"] = hexagram_index + 1
        event["hexagram"] = chr(codepoint)
        event["hexagram_codepoint"] = f"U+{codepoint:04X}"
        event["header8"] = f"{hexagram_index:02X}"
    event.setdefault("projection_window", "curr6")
    event.setdefault("projection_bits", 6)
    event.setdefault("pattern16", f"{event.get('header8', '00')}{event.get('d2_6', '00')}")
    event.setdefault("transcript", format_signal_transcript_line(event))
    event.setdefault(
        "fs",
        {
            "scope128": event.get("path", ""),
            "partition_layer": event.get("part", ""),
            "scene_step": event.get("step", 0),
            "orbit_step": event.get("orbit", 0),
        },
    )
    event.setdefault(
        "gs",
        {
            "tree64": f"{event.get('dialect', '')}:{event.get('part', '')}:{event.get('chain', '')}",
            "group_id": event.get("part", ""),
            "dialect_set": [event.get("dialect", "")],
            "transport_history": "fifo/mqtt",
        },
    )
    event.setdefault(
        "us",
        {
            "frame32": f"{event.get('curr8', '')}{event.get('curr6', '')}",
            "selected_unit": event.get("braille", ""),
            "toggle_set": {"lazy": 0, "greedy": 1},
            "local_eval_mode": "greedy",
        },
    )
    event.setdefault(
        "rs",
        {
            "frame16": f"{event.get('rel16', '')}{event.get('d2_6', '')}",
            "braille_reduce": event.get("braille", ""),
            "rel16": event.get("rel16", ""),
            "result_trace": f"{event.get('d1_8', '')}:{event.get('d2_8', '')}",
            "header8": event.get("header8", ""),
            "pattern16": event.get("pattern16", ""),
        },
    )
    return event


def format_signal_transcript_line(event: dict[str, Any]) -> str:
    return f"{event.get('hexagram', '')} | {event.get('braille', '')} | {event.get('header8', '')}/{event.get('pattern16', '')} | {event.get('path', '')}"


def bucket_for_event(event: dict[str, Any], window_size: int) -> int:
    return int(event["step"]) // window_size


def coord_dir(config: RuntimeConfig, event: dict[str, Any]) -> Path:
    return config.state_dir / "cache" / "coords" / safe_segment(event["dialect"]) / safe_segment(event["part"]) / safe_segment(event["chain"])


def window_path(config: RuntimeConfig, event: dict[str, Any]) -> Path:
    bucket = bucket_for_event(event, config.window_size)
    return config.state_dir / "cache" / "windows" / safe_segment(event["dialect"]) / safe_segment(event["part"]) / safe_segment(event["chain"]) / f"{bucket}.ndjson"


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def append_ndjson(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(payload, ensure_ascii=False) + "\n")


def memcached_set(config: RuntimeConfig, key: str, value: str, ttl: int = 300) -> None:
    if not config.memcached_enable:
        return
    try:
        with socket.create_connection((config.memcached_host, config.memcached_port), timeout=1.0) as sock:
            payload = value.encode("utf-8")
            header = f"set {key} 0 {ttl} {len(payload)} noreply\r\n".encode("ascii")
            sock.sendall(header + payload + b"\r\n")
    except OSError:
        return


def memcached_get(config: RuntimeConfig, key: str) -> str | None:
    if not config.memcached_enable:
        return None
    try:
        with socket.create_connection((config.memcached_host, config.memcached_port), timeout=1.0) as sock:
            sock.sendall(f"get {key}\r\nquit\r\n".encode("ascii"))
            data = sock.recv(65536).decode("utf-8", errors="replace")
    except OSError:
        return None
    lines = data.splitlines()
    if len(lines) >= 2 and lines[0].startswith("VALUE "):
        return lines[1]
    return None


def mqtt_publish(config: RuntimeConfig, topic: str, payload: str, retain: bool = False) -> None:
    if not config.mqtt_enable:
        return
    binary = shutil.which("mosquitto_pub")
    if not binary:
        return
    command = [
        binary,
        "-h",
        config.mqtt_host,
        "-p",
        str(config.mqtt_port),
        "-t",
        topic,
        "-m",
        payload,
    ]
    if retain:
        command.append("-r")
    subprocess.run(command, check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def presence_list(config: RuntimeConfig) -> list[dict[str, Any]]:
    try:
        items = json.loads(config.presence_json.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return []
    now = time.time()
    return [item for item in items if now - float(item.get("ts", 0)) < 30]


def update_presence(config: RuntimeConfig, peer_id: str) -> list[dict[str, Any]]:
    peers = [item for item in presence_list(config) if item.get("peer") != peer_id]
    peers.append({"peer": peer_id, "ts": time.time()})
    write_json(config.presence_json, peers)
    mqtt_publish(config, "braille/signaling/presence", json.dumps({"peer": peer_id, "ts": time.time()}))
    return peers


def queue_signal(config: RuntimeConfig, message: dict[str, Any]) -> None:
    target = safe_segment(message.get("target", "broadcast"))
    queue_path = config.signals_dir / f"{target}.jsonl"
    append_ndjson(queue_path, message)


def read_signal_queue(config: RuntimeConfig, peer_id: str, since: int) -> tuple[list[dict[str, Any]], int]:
    queue_path = config.signals_dir / f"{safe_segment(peer_id)}.jsonl"
    if not queue_path.exists():
        return [], since
    messages: list[dict[str, Any]] = []
    next_offset = since
    with queue_path.open("r", encoding="utf-8") as handle:
        for index, line in enumerate(handle):
            if index < since:
                continue
            try:
                messages.append(json.loads(line))
            except json.JSONDecodeError:
                continue
            next_offset = index + 1
    return messages, next_offset


def process_event(config: RuntimeConfig, event: dict[str, Any]) -> None:
    append_ndjson(config.rel_log, event)
    write_json(config.latest_json, event)
    write_json(config.tip_json, event)

    coord = coord_dir(config, event)
    write_json(coord / "latest.json", event)
    write_json(coord / "tip.json", event)
    append_ndjson(window_path(config, event), event)

    key_prefix = f"orbit/{event['orbit']}/part/{event['part']}/dialect/{event['dialect']}/chain/{event['chain']}"
    payload = json.dumps(event, ensure_ascii=False)
    memcached_set(config, "latest", payload)
    memcached_set(config, "tip", payload)
    memcached_set(config, f"{safe_segment(key_prefix)}:latest", payload)
    memcached_set(config, f"{safe_segment(key_prefix)}:tip", payload)
    memcached_set(config, f"{safe_segment(key_prefix)}:bucket:{bucket_for_event(event, config.window_size)}", payload)

    topic_root = f"braille/{safe_segment(event['dialect'])}/{safe_segment(event['part'])}"
    mqtt_publish(config, f"{topic_root}/stream", payload)
    mqtt_publish(config, f"{topic_root}/proof", payload)
    mqtt_publish(config, f"{topic_root}/tip", payload, retain=True)


def recent_events(config: RuntimeConfig, dialect: str | None, part: str | None, chain: str | None, limit: int) -> list[dict[str, Any]]:
    events: list[dict[str, Any]] = []
    if config.rel_log.exists():
        with config.rel_log.open("r", encoding="utf-8") as handle:
            for line in handle:
                event = parse_event(line)
                if not event:
                    continue
                if dialect is not None and str(event["dialect"]) != dialect:
                    continue
                if part is not None and str(event["part"]) != part:
                    continue
                if chain is not None and str(event["chain"]) != chain:
                    continue
                events.append(event)
    return events[-limit:]


class RuntimeHandler(BaseHTTPRequestHandler):
    server: "RuntimeServer"

    def do_GET(self) -> None:  # noqa: N802
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/":
            self.serve_file(self.server.config.web_dir / "index.html", "text/html; charset=utf-8")
            return
        if parsed.path == "/app.js":
            self.serve_file(self.server.config.web_dir / "app.js", "application/javascript; charset=utf-8")
            return
        if parsed.path == "/worker.js":
            self.serve_file(self.server.config.web_dir / "worker.js", "application/javascript; charset=utf-8")
            return
        if parsed.path == "/graph.js":
            self.serve_file(self.server.config.web_dir / "graph.js", "application/javascript; charset=utf-8")
            return
        if parsed.path == "/hexagram-projection.js":
            self.serve_file(self.server.config.web_dir / "hexagram-projection.js", "application/javascript; charset=utf-8")
            return
        if parsed.path == "/service-worker.js":
            self.serve_file(self.server.config.web_dir / "service-worker.js", "application/javascript; charset=utf-8")
            return
        if parsed.path == "/relation-worker.js":
            self.serve_file(self.server.config.web_dir / "relation-worker.js", "application/javascript; charset=utf-8")
            return
        if parsed.path == "/prolog-relations.js":
            self.serve_file(self.server.config.web_dir / "prolog-relations.js", "application/javascript; charset=utf-8")
            return
        if parsed.path == "/relation-store.js":
            self.serve_file(self.server.config.web_dir / "relation-store.js", "application/javascript; charset=utf-8")
            return
        if parsed.path.startswith("/public/"):
            public_root = (self.server.config.web_dir / "public").resolve()
            target = (self.server.config.web_dir / parsed.path.lstrip("/")).resolve()
            if public_root in target.parents or target == public_root:
                self.serve_file(target, content_type_for_path(target))
                return
        if parsed.path == "/api/config":
            self.write_json(
                {
                    "channel": self.server.config.channel,
                    "dialect": self.server.config.dialect,
                    "part": self.server.config.part,
                    "chain": self.server.config.chain,
                    "orbitMod": self.server.config.orbit_mod,
                    "windowSize": self.server.config.window_size,
                }
            )
            return
        if parsed.path == "/api/latest":
            latest = self.load_latest()
            self.write_json({"event": latest})
            return
        if parsed.path == "/api/recovery":
            params = urllib.parse.parse_qs(parsed.query)
            limit = int(params.get("limit", [str(self.server.config.window_size)])[0])
            dialect = params.get("dialect", [None])[0]
            part = params.get("part", [None])[0]
            chain = params.get("chain", [None])[0]
            events = recent_events(self.server.config, dialect, part, chain, limit)
            self.write_json({"events": events})
            return
        if parsed.path == "/api/events":
            self.stream_events()
            return
        if parsed.path == "/api/peers":
            self.write_json({"peers": presence_list(self.server.config)})
            return
        if parsed.path == "/api/signals":
            params = urllib.parse.parse_qs(parsed.query)
            peer = params.get("peer", [""])[0]
            since = int(params.get("since", ["0"])[0])
            messages, next_offset = read_signal_queue(self.server.config, peer, since)
            self.write_json({"messages": messages, "nextOffset": next_offset})
            return
        self.send_error(HTTPStatus.NOT_FOUND, "Not found")

    def do_POST(self) -> None:  # noqa: N802
        parsed = urllib.parse.urlparse(self.path)
        length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(length) if length else b"{}"
        try:
            payload = json.loads(body.decode("utf-8"))
        except json.JSONDecodeError:
            self.send_error(HTTPStatus.BAD_REQUEST, "Invalid JSON")
            return

        if parsed.path == "/api/presence":
            peer_id = payload.get("peer")
            if not peer_id:
                self.send_error(HTTPStatus.BAD_REQUEST, "Missing peer")
                return
            peers = update_presence(self.server.config, str(peer_id))
            self.write_json({"ok": True, "peers": peers})
            return
        if parsed.path == "/api/signals":
            message = {
                "id": payload.get("id") or f"signal-{int(time.time() * 1000)}",
                "from": payload.get("from"),
                "target": payload.get("target"),
                "kind": payload.get("kind"),
                "payload": payload.get("payload"),
                "ts": time.time(),
            }
            if not message["target"] or not message["from"] or not message["kind"]:
                self.send_error(HTTPStatus.BAD_REQUEST, "Missing signal fields")
                return
            queue_signal(self.server.config, message)
            mqtt_publish(
                self.server.config,
                f"braille/signaling/{safe_segment(message['target'])}",
                json.dumps(message, ensure_ascii=False),
            )
            self.write_json({"ok": True, "message": message})
            return
        self.send_error(HTTPStatus.NOT_FOUND, "Not found")

    def serve_file(self, path: Path, content_type: str) -> None:
        if not path.exists():
            self.send_error(HTTPStatus.NOT_FOUND, "Missing file")
            return
        data = path.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def write_json(self, payload: Any, status: HTTPStatus = HTTPStatus.OK) -> None:
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def load_latest(self) -> Any:
        memcached_value = memcached_get(self.server.config, "latest")
        if memcached_value:
            try:
                return json.loads(memcached_value)
            except json.JSONDecodeError:
                pass
        if self.server.config.latest_json.exists():
            try:
                return json.loads(self.server.config.latest_json.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                return None
        return None

    def stream_events(self) -> None:
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "text/event-stream; charset=utf-8")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Connection", "keep-alive")
        self.end_headers()
        rel_log = self.server.config.rel_log
        rel_log.touch(exist_ok=True)
        with rel_log.open("r", encoding="utf-8") as handle:
            handle.seek(0, os.SEEK_END)
            while True:
                line = handle.readline()
                if line:
                    self.wfile.write(b"data: ")
                    self.wfile.write(line.encode("utf-8"))
                    self.wfile.write(b"\n")
                    self.wfile.flush()
                else:
                    time.sleep(0.5)

    def log_message(self, format: str, *args: Any) -> None:  # noqa: A003
        return


class RuntimeServer(ThreadingHTTPServer):
    def __init__(self, server_address: tuple[str, int], handler_class: type[RuntimeHandler], config: RuntimeConfig):
        super().__init__(server_address, handler_class)
        self.config = config


def content_type_for_path(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix == ".js":
        return "application/javascript; charset=utf-8"
    if suffix == ".json":
        return "application/json; charset=utf-8"
    if suffix in {".md", ".pl", ".txt"}:
        return "text/plain; charset=utf-8"
    if suffix == ".html":
        return "text/html; charset=utf-8"
    return "application/octet-stream"


def command_fanout(args: argparse.Namespace) -> int:
    config = load_config(args)
    ensure_dirs(config)
    for raw_line in args.input or []:
        event = parse_event(raw_line)
        if event:
            process_event(config, event)
    for line in args.stdin:
        event = parse_event(line)
        if event:
            process_event(config, event)
    return 0


def command_serve(args: argparse.Namespace) -> int:
    config = load_config(args)
    ensure_dirs(config)
    server = RuntimeServer((config.http_host, config.http_port), RuntimeHandler, config)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Braille runtime helpers")
    parser.add_argument("--state-dir")
    parser.add_argument("--web-dir")
    parser.add_argument("--channel")
    parser.add_argument("--dialect")
    parser.add_argument("--part")
    parser.add_argument("--chain")
    parser.add_argument("--orbit-mod")
    parser.add_argument("--window-size")

    subparsers = parser.add_subparsers(dest="command", required=True)

    fanout = subparsers.add_parser("fanout", help="Read NDJSON from stdin and update logs/cache")
    fanout.set_defaults(func=command_fanout)
    fanout.add_argument("input", nargs="*")
    fanout.add_argument("--stdin", default=os.sys.stdin, type=argparse.FileType("r", encoding="utf-8"))

    serve = subparsers.add_parser("serve", help="Serve browser UI and recovery/signaling endpoints")
    serve.set_defaults(func=command_serve)

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    return int(args.func(args))


if __name__ == "__main__":
    raise SystemExit(main())
