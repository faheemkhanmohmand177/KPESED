#!/usr/bin/env python3
"""Try fetching the KPESE HRMIS site through each working SOCKS5 proxy."""
import subprocess
import os
import sys
import time

PROXY_FILE = "/home/z/my-project/tools/working_proxies.txt"
OUTPUT_DIR = "/home/z/my-project/screenshots/hrmis_capture"
os.makedirs(OUTPUT_DIR, exist_ok=True)

TARGET_URL = "https://iemis.kpese.gov.pk/ords/r/emis/human-resource-management-information-system-hrmis/login"

with open(PROXY_FILE) as f:
    proxies = [line.strip() for line in f if line.strip()]

print(f"Testing {len(proxies)} proxies against actual HTTPS fetch...")

# Try first 20 working proxies
success_count = 0
failed = []
for i, proxy in enumerate(proxies[:20]):
    print(f"[{i+1}/20] Trying {proxy}...", end=" ", flush=True)
    output_file = f"{OUTPUT_DIR}/login_page_{i}.html"
    try:
        result = subprocess.run(
            ["curl", "--socks5-hostname", proxy, "-sL",
             "--max-time", "30", "--connect-timeout", "10",
             "-A", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
             "-o", output_file, "-w", "%{http_code}|%{size_download}|%{time_total}",
             TARGET_URL],
            capture_output=True, text=True, timeout=45
        )
        if os.path.exists(output_file) and os.path.getsize(output_file) > 1000:
            stats = result.stdout.strip()
            print(f"OK! stats={stats}")
            success_count += 1
            if success_count >= 3:
                print(f"\nGot {success_count} successful captures, stopping early.")
                break
        else:
            print(f"FAIL (empty or too small)")
            failed.append(proxy)
    except subprocess.TimeoutExpired:
        print("TIMEOUT")
        failed.append(proxy)
    except Exception as e:
        print(f"ERROR: {e}")
        failed.append(proxy)

print(f"\nSuccess: {success_count}, Failed: {len(failed)}")
if success_count > 0:
    print(f"\nCaptured files in {OUTPUT_DIR}:")
    for f in sorted(os.listdir(OUTPUT_DIR)):
        path = os.path.join(OUTPUT_DIR, f)
        print(f"  {f}: {os.path.getsize(path)} bytes")
