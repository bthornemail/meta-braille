FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends gawk && rm -rf /var/lib/apt/lists/*

COPY . /app

RUN chmod +x /app/scripts/seed_demo_stream.sh /app/scripts/public_demo.sh /app/braille_fifo_backend.sh

ENV STATE_DIR=/app/runtime
ENV HTTP_HOST=0.0.0.0
ENV HTTP_PORT=8008

EXPOSE 8008

CMD ["/app/scripts/public_demo.sh"]
