#!/usr/bin/env python3
"""Fetch the HTML of all visited KPESE HRMIS pages through the SOCKS5 proxy."""
import subprocess
import os
import time

WORKING_PROXY = "147.93.172.241:5555"
CAPTURE_DIR = "/home/z/my-project/screenshots/hrmis_pages"
os.makedirs(CAPTURE_DIR, exist_ok=True)

BASE = "https://iemis.kpese.gov.pk/ords/r/emis/human-resource-management-information-system-hrmis"

# We need the session ID from the browser. Let's login via curl first to get a fresh session.
LOGIN_URL = f"{BASE}/login"
EMPLOYEE_SEARCH_URL = f"{BASE}/employee-search"  # will need session
TEACHER_ATTENDANCE_URL = f"{BASE}/teacher-attendance"

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

# Step 1: Fetch login page (already have it but refetch with all assets inlined)
print("[1] Fetching login page HTML...")
subprocess.run(["curl", "--socks5-hostname", WORKING_PROXY, "-sL",
                "--max-time", "30", "--connect-timeout", "10",
                "-A", UA, "-o", f"{CAPTURE_DIR}/01-login.html", LOGIN_URL],
               timeout=45)
print(f"  Size: {os.path.getsize(f'{CAPTURE_DIR}/01-login.html')} bytes")

print("\n[2] Fetching login.css (the custom styles)...")
subprocess.run(["curl", "--socks5-hostname", WORKING_PROXY, "-sL",
                "--max-time", "30", "--connect-timeout", "10",
                "-A", UA, "-o", f"{CAPTURE_DIR}/custum-emis-styles.min.css",
                f"{BASE}/files/static/v432/custum-emis-styles.min.css".replace(BASE, 'https://iemis.kpese.gov.pk/ords/r/emis/100') if False else "https://iemis.kpese.gov.pk/ords/r/emis/100/files/static/v432/custum-emis-styles.min.css"],
               timeout=45)
print(f"  Size: {os.path.getsize(f'{CAPTURE_DIR}/custum-emis-styles.min.css')} bytes")

print("\nDone! Captured reference files in:", CAPTURE_DIR)
for f in sorted(os.listdir(CAPTURE_DIR)):
    print(f"  {f}: {os.path.getsize(os.path.join(CAPTURE_DIR, f))} bytes")
