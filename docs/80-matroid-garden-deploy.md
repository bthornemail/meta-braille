# matroid-garden.com Deployment

This document is the concrete server-side plan for attaching the public demo to:

- `matroid-garden.com`
- `www.matroid-garden.com`

## Current Status

From an external check on 2026-03-31:

- `matroid-garden.com` resolves to `74.208.190.29`
- `www.matroid-garden.com` resolves to `74.208.190.29`
- `http://matroid-garden.com` returns `404 Not Found` from `nginx/1.24.0`
- `https://matroid-garden.com` currently presents the wrong certificate

So DNS is already pointing at the server. The remaining work is web-server routing and TLS.

## Recommended Shape

Use:

- `systemd` to keep the Python demo running on `127.0.0.1:8008`
- `nginx` to reverse-proxy the public hostname to that local app
- `certbot` to issue a valid certificate for `matroid-garden.com`

## Files Included In The Deployment Bundle

The deployment bundle includes:

- a `systemd` service for the public demo
- an `nginx` site configuration for `matroid-garden.com`

## Server Layout

Suggested checkout path:

```text
/var/www/meta-braille
```

Suggested runtime path:

```text
/var/www/meta-braille/runtime
```

## Install Steps On The Server

### 1. Clone or update the repo

```sh
cd /var/www
git clone git@github.com:bthornemail/meta-braille.git
cd meta-braille
git checkout v0.1.0
```

### 2. Install runtime dependencies

```sh
sudo apt-get update
sudo apt-get install -y python3 gawk nginx certbot python3-certbot-nginx
```

### 3. Install the systemd service

```sh
sudo cp deploy/meta-braille.service /etc/systemd/system/meta-braille.service
sudo systemctl daemon-reload
sudo systemctl enable meta-braille.service
sudo systemctl start meta-braille.service
sudo systemctl status meta-braille.service
```

This service seeds the deterministic demo stream and starts the Python server on `127.0.0.1:8008`.

### 4. Install the nginx site

```sh
sudo cp deploy/matroid-garden.nginx.conf /etc/nginx/sites-available/matroid-garden.com
sudo ln -sf /etc/nginx/sites-available/matroid-garden.com /etc/nginx/sites-enabled/matroid-garden.com
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Issue TLS certificates

```sh
sudo certbot --nginx -d matroid-garden.com -d www.matroid-garden.com
```

After certbot runs, recheck:

```sh
curl -I http://matroid-garden.com
curl -I https://matroid-garden.com
```

## Expected Result

- `http://www.matroid-garden.com` redirects to `http://matroid-garden.com`
- `http://matroid-garden.com` proxies to the local Python app
- `https://matroid-garden.com` serves the same app with a valid certificate

## Notes

- This uses the seeded public demo, not the full live FIFO fanout path.
- That is intentional for the first public domain attach because it is simpler and more stable.
- Once the domain is stable, the service can be switched from the seeded public demo to a fuller live backend topology if desired.
