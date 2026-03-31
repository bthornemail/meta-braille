#!/usr/bin/env -S gawk -f

BEGIN {
    OFS = ""
    step = 0
    orbit_mod = (orbit_mod == "" ? 5040 : orbit_mod)
    dialect = (dialect == "" ? "default" : dialect)
    part = (part == "" ? 0 : part)
    chain = (chain == "" ? 0 : chain)

    init_braille()

    prev6 = 0
    prev8 = 0
    prev_d1_6 = 0
    prev_d1_8 = 0
}

{
    for (i = 1; i <= length($0); i++) {
        ch = substr($0, i, 1)
        if (!(ch in BRAILLE_TO_BYTE)) {
            if (ch ~ /[[:space:]]/) {
                continue
            }
            printf("warning: skipping non-braille character %s\n", ch) > "/dev/stderr"
            continue
        }

        curr8 = BRAILLE_TO_BYTE[ch]
        curr6 = project6(curr8)

        d1_6 = xor_byte(prev6, curr6)
        d2_6 = xor_byte(prev_d1_6, d1_6)

        d1_8 = xor_byte(prev8, curr8)
        d2_8 = xor_byte(prev_d1_8, d1_8)

        rel16 = and_byte(xor_byte(rotl8(d2_8, 1), d2_6), 15)

        rows_from_byte(curr8, ROW)

        step += 1
        orbit = (step - 1) % orbit_mod
        path = "m/orbit/" orbit "/part/" part "/dialect/" dialect "/chain/" chain

        print_event(ch, curr8, curr6, d1_6, d2_6, d1_8, d2_8, rel16, ROW, orbit, part, dialect, chain, step, path)

        prev6 = curr6
        prev8 = curr8
        prev_d1_6 = d1_6
        prev_d1_8 = d1_8
    }
}

function print_event(ch, curr8, curr6, d1_6, d2_6, d1_8, d2_8, rel16, ROW, orbit, part, dialect, chain, step, path,    rows_json, selectors_json, rows_hex, fs_json, gs_json, us_json, rs_json, axis7_json, axis240_json, axis256_json, hex_projection, hexagram, hexagram_cp, hexagram_index, hexagram_order, header8, pattern16, transcript, axis7_tick, axis240_slot, frame32) {
    rows_json = "[" ROW[1] "," ROW[2] "," ROW[3] "," ROW[4] "]"
    selectors_json = "{\"FS\":" ROW[1] ",\"GS\":" ROW[2] ",\"US\":" ROW[3] ",\"RS\":" ROW[4] "}"
    rows_hex = "0x" ROW[1] ",0x" ROW[2] ",0x" ROW[3] ",0x" ROW[4]
    axis7_tick = (step - 1) % 7
    axis240_slot = orbit % 240
    frame32 = hex2(curr8) hex2(curr6)
    split(hexagram_projection_json(curr6, d2_6), hex_projection, "\034")
    hexagram = hex_projection[1]
    hexagram_cp = hex_projection[2]
    hexagram_index = hex_projection[3]
    hexagram_order = hex_projection[4]
    header8 = hex_projection[5]
    pattern16 = hex_projection[6]
    transcript = hexagram " | " ch " | " header8 "/" pattern16 " | " path
    fs_json = "{\"scope128\":\"" json_escape(path) "\",\"partition_layer\":\"" json_escape(part) "\",\"scene_step\":" step ",\"orbit_step\":" orbit "}"
    gs_json = "{\"tree64\":\"" json_escape(dialect ":" part ":" chain) "\",\"group_id\":\"" json_escape(part) "\",\"dialect_set\":[\"" json_escape(dialect) "\"],\"transport_history\":\"fifo/mqtt\"}"
    us_json = "{\"frame32\":\"" frame32 "\",\"selected_unit\":\"" json_escape(ch) "\",\"toggle_set\":{\"lazy\":0,\"greedy\":1},\"local_eval_mode\":\"greedy\"}"
    rs_json = "{\"frame16\":\"" sprintf("%X", rel16) hex2(d2_6) "\",\"braille_reduce\":\"" json_escape(ch) "\",\"rel16\":\"" sprintf("%X", rel16) "\",\"result_trace\":\"" hex2(d1_8) ":" hex2(d2_8) "\",\"header8\":\"" header8 "\",\"pattern16\":\"" pattern16 "\"}"
    axis7_json = "{\"family\":7,\"tick\":" axis7_tick ",\"step\":" step ",\"rel16\":\"" sprintf("%X", rel16) "\"}"
    axis240_json = "{\"family\":240,\"slot\":" axis240_slot ",\"orbit\":" orbit ",\"path\":\"" json_escape(path) "\",\"part\":\"" json_escape(part) "\",\"dialect\":\"" json_escape(dialect) "\",\"chain\":\"" json_escape(chain) "\"}"
    axis256_json = "{\"family\":256,\"curr8\":\"" hex2(curr8) "\",\"curr6\":\"" hex2(curr6) "\",\"frame32\":\"" frame32 "\",\"projection_window\":\"curr6\",\"projection_bits\":6}"

    printf("{")
    printf("\"braille\":\"%s\",", json_escape(ch))
    printf("\"curr8\":\"%s\",", hex2(curr8))
    printf("\"curr6\":\"%s\",", hex2(curr6))
    printf("\"d1_6\":\"%s\",", hex2(d1_6))
    printf("\"d2_6\":\"%s\",", hex2(d2_6))
    printf("\"d1_8\":\"%s\",", hex2(d1_8))
    printf("\"d2_8\":\"%s\",", hex2(d2_8))
    printf("\"rel16\":\"%X\",", rel16)
    printf("\"hexagram\":\"%s\",", json_escape(hexagram))
    printf("\"hexagram_codepoint\":\"%s\",", hexagram_cp)
    printf("\"hexagram_index\":%d,", hexagram_index)
    printf("\"hexagram_order\":%d,", hexagram_order)
    printf("\"header8\":\"%s\",", header8)
    printf("\"pattern16\":\"%s\",", pattern16)
    printf("\"projection_window\":\"curr6\",")
    printf("\"projection_bits\":6,")
    printf("\"transcript\":\"%s\",", json_escape(transcript))
    printf("\"axis7\":%s,", axis7_json)
    printf("\"axis240\":%s,", axis240_json)
    printf("\"axis256\":%s,", axis256_json)
    printf("\"rows\":%s,", rows_json)
    printf("\"selectors\":%s,", selectors_json)
    printf("\"rows_hex\":\"%s\",", rows_hex)
    printf("\"fs\":%s,", fs_json)
    printf("\"gs\":%s,", gs_json)
    printf("\"us\":%s,", us_json)
    printf("\"rs\":%s,", rs_json)
    printf("\"orbit\":%d,", orbit)
    printf("\"orbit_step\":%d,", orbit)
    printf("\"part\":\"%s\",", json_escape(part))
    printf("\"dialect\":\"%s\",", json_escape(dialect))
    printf("\"chain\":\"%s\",", json_escape(chain))
    printf("\"step\":%d,", step)
    printf("\"path\":\"%s\"", json_escape(path))
    printf("}\n")
}

function init_braille(    i, ch) {
    for (i = 0; i < 256; i++) {
        ch = braille_from_byte(i)
        BRAILLE_TO_BYTE[ch] = i
    }
}

function braille_from_byte(v,    cp) {
    cp = 0x2800 + v
    return sprintf("%c", cp)
}

function project6(v) {
    return and_byte(v, 63)
}

function hexagram_projection_json(curr6, d2_6,    idx, codepoint, glyph, header8, pattern16) {
    idx = and_byte(curr6, 63)
    codepoint = 0x4DC0 + idx
    glyph = sprintf("%c", codepoint)
    header8 = hex2(idx)
    pattern16 = header8 hex2(d2_6)
    return glyph "\034" sprintf("U+%04X", codepoint) "\034" idx "\034" (idx + 1) "\034" header8 "\034" pattern16
}

function rows_from_byte(byte, ROW,    d1, d2, d3, d4, d5, d6, d7, d8) {
    d1 = bit(byte, 0); d2 = bit(byte, 1); d3 = bit(byte, 2); d4 = bit(byte, 3)
    d5 = bit(byte, 4); d6 = bit(byte, 5); d7 = bit(byte, 6); d8 = bit(byte, 7)

    ROW[1] = pair_state(d1, d4)
    ROW[2] = pair_state(d2, d5)
    ROW[3] = pair_state(d3, d6)
    ROW[4] = pair_state(d7, d8)
}

function pair_state(left, right) {
    return left + (right * 2)
}

function bit(v, n) {
    return rshift(and_byte(v, lshift(1, n)), n)
}

function rotl8(v, n,    mask, left, right) {
    mask = 255
    n = n % 8
    left = and_byte(lshift(v, n), mask)
    right = rshift(v, 8 - n)
    return and_byte(or_byte(left, right), mask)
}

function xor_byte(a, b) {
    return xor(a, b)
}

function and_byte(a, b) {
    return and(a, b)
}

function or_byte(a, b) {
    return or(a, b)
}

function hex2(v) {
    return sprintf("%02X", and_byte(v, 255))
}

function json_escape(s,    out) {
    out = s
    gsub(/\\/,"\\\\", out)
    gsub(/"/,"\\\"", out)
    gsub(/\t/,"\\t", out)
    gsub(/\r/,"\\r", out)
    gsub(/\n/,"\\n", out)
    return out
}
