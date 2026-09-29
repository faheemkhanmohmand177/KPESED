#!/usr/bin/env python3
"""Try to find a working SOCKS5 proxy to access the KPESE HRMIS site."""
import socket
import struct
import concurrent.futures
import urllib.request
import urllib.error
import ssl
import time

TARGET_HOST = "iemis.kpese.gov.pk"
TARGET_PORT = 443

# Load proxies from file
def load_proxies(path):
    proxies = []
    with open(path) as f:
        for line in f:
            line = line.strip()
            if line and ":" in line and not line.startswith("#"):
                proxies.append(line)
    return proxies

def test_socks5_connectivity(proxy_str, timeout=8):
    """Test if a SOCKS5 proxy works and can connect to the target."""
    try:
        host, port = proxy_str.split(":")
        port = int(port)
    except (ValueError, AttributeError):
        return None

    # Create socket and connect to proxy
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        sock.connect((host, port))

        # SOCKS5 greeting: version 5, 1 auth method (no auth)
        sock.sendall(b'\x05\x01\x00')
        resp = sock.recv(2)
        if len(resp) < 2 or resp[0] != 5 or resp[1] != 0:
            sock.close()
            return None

        # SOCKS5 connect to target (domain name)
        sock.sendall(b'\x05\x01\x00\x03' + bytes([len(TARGET_HOST)]) +
                     TARGET_HOST.encode() + struct.pack(">H", TARGET_PORT))
        resp = sock.recv(10)
        if len(resp) < 2 or resp[1] != 0:
            sock.close()
            return None
        sock.close()
        return proxy_str
    except (socket.timeout, ConnectionRefusedError, OSError, Exception):
        return None

def main():
    print(f"Loading proxies from proxies_all.txt...")
    proxies = load_proxies("proxies_all.txt")
    print(f"Loaded {len(proxies)} proxies. Testing in parallel...")

    working = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=100) as executor:
        futures = {executor.submit(test_socks5_connectivity, p): p for p in proxies[:500]}
        for i, future in enumerate(concurrent.futures.as_completed(futures), 1):
            result = future.result()
            if result:
                working.append(result)
                print(f"  [WORKING] {result}")
            if i % 50 == 0:
                print(f"  Tested {i}/{len(proxies[:500])}, found {len(working)} working so far")

    print(f"\nFound {len(working)} working proxies that can reach {TARGET_HOST}")
    with open("working_proxies.txt", "w") as f:
        for p in working:
            f.write(p + "\n")

    if working:
        print("\nWorking proxies saved to working_proxies.txt")

if __name__ == "__main__":
    main()
