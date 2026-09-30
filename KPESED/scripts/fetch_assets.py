#!/usr/bin/env python3
"""Fetch all referenced static assets (CSS, JS, images, logos) from KPESE HRMIS via SOCKS5 proxy."""
import subprocess
import os
import re
import sys

# Use the working proxy from earlier tests
WORKING_PROXY = "147.93.172.241:5555"

CAPTURE_DIR = "/home/z/my-project/screenshots/hrmis_capture"
ASSETS_DIR = "/home/z/my-project/screenshots/hrmis_assets"
os.makedirs(ASSETS_DIR, exist_ok=True)

BASE_URL = "https://iemis.kpese.gov.pk"

# Read the login page HTML
with open(f"{CAPTURE_DIR}/login_page_0.html") as f:
    html = f.read()

# Extract all asset URLs from the HTML
urls = set()
# CSS files
for m in re.finditer(r'href="([^"]+\.css[^"]*)"', html):
    url = m.group(1)
    if url.startswith("/") or url.startswith("r/"):
        urls.add(url)

# Image files (background-image: url(...))
for m in re.finditer(r'url\(([^)]+)\)', html):
    url = m.group(1).strip().strip('"').strip("'")
    if url.startswith("/") or url.startswith("r/"):
        urls.add(url)

# JS files
for m in re.finditer(r'src="([^"]+\.js[^"]*)"', html):
    url = m.group(1)
    if url.startswith("/") or url.startswith("r/"):
        urls.add(url)

# Link href for icons
for m in re.finditer(r'href="([^"]+\.(?:png|jpg|jpeg|ico|svg)[^"]*)"', html):
    url = m.group(1)
    if url.startswith("/") or url.startswith("r/"):
        urls.add(url)

print(f"Found {len(urls)} unique asset URLs to download")

# Sort and download
downloaded = 0
failed = 0
for url in sorted(urls):
    if url.startswith("/"):
        full_url = BASE_URL + url
        local_path = url.lstrip("/")
    else:
        # relative URL like r/emis/...
        full_url = f"{BASE_URL}/ords/{url}"
        local_path = f"ords/{url}"

    local_full = os.path.join(ASSETS_DIR, local_path)
    os.makedirs(os.path.dirname(local_full), exist_ok=True)

    if os.path.exists(local_full):
        print(f"  SKIP (exists): {url}")
        continue

    print(f"  Downloading: {url}", end=" ", flush=True)
    try:
        result = subprocess.run(
            ["curl", "--socks5-hostname", WORKING_PROXY, "-sL",
             "--max-time", "30", "--connect-timeout", "10",
             "-A", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
             "-o", local_full, "-w", "%{http_code}|%{size_download}",
             full_url],
            capture_output=True, text=True, timeout=45
        )
        stats = result.stdout.strip()
        if os.path.exists(local_full) and os.path.getsize(local_full) > 0:
            print(f"OK ({stats})")
            downloaded += 1
        else:
            print(f"FAIL ({stats})")
            failed += 1
    except Exception as e:
        print(f"ERROR: {e}")
        failed += 1

print(f"\nDone! Downloaded: {downloaded}, Failed: {failed}")
print(f"Assets in: {ASSETS_DIR}")
