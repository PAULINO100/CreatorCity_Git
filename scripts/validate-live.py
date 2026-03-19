import http.client
import ssl
import time
import socket
import urllib.parse

def check_live_site(domain):
    print(f"=== Validating {domain} ===")
    
    # 1. HTTPS/SSL Check
    try:
        context = ssl.create_default_context()
        with socket.create_connection((domain, 443)) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                print("[OK] SSL Certificate is valid.")
    except Exception as e:
        print(f"[ERROR] SSL Check failed: {e}")

    # 2. Security Headers & Accessibility
    try:
        conn = http.client.HTTPSConnection(domain)
        conn.request("GET", "/")
        res = conn.getresponse()
        headers = dict(res.getheaders())
        
        print(f"[INFO] Status: {res.status}")
        
        security_headers = [
            "Strict-Transport-Security",
            "Content-Security-Policy",
            "X-Frame-Options",
            "X-Content-Type-Options"
        ]
        
        for header in security_headers:
            if header in headers:
                print(f"[OK] {header}: Found")
            else:
                print(f"[WARNING] {header}: NOT FOUND")
                
    except Exception as e:
        print(f"[ERROR] HTTP Request failed: {e}")

    # 3. Environment Exposure Check
    paths_to_check = ["/.env", "/.env.local", "/.git/config"]
    for path in paths_to_check:
        try:
            conn = http.client.HTTPSConnection(domain)
            conn.request("GET", path)
            res = conn.getresponse()
            if res.status == 404:
                print(f"[OK] {path}: Protected (404)")
            else:
                print(f"[CRITICAL] {path}: EXPOSED ({res.status})")
        except:
            pass

    # 4. Performance Check
    start = time.time()
    try:
        conn = http.client.HTTPSConnection(domain)
        conn.request("GET", "/")
        conn.getresponse().read()
        end = time.time()
        print(f"[PERF] Response time: {(end - start) * 1000:.2f}ms")
    except:
        print("[ERROR] Performance test failed.")

if __name__ == "__main__":
    import sys
    target = sys.argv[1] if len(sys.argv) > 1 else "atlas.city"
    check_live_site(target)
