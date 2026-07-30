#!/usr/bin/env python3
"""
Dev server for local preview.

Identical to `python -m http.server` except it sends `Cache-Control: no-store`,
because browsers will otherwise hold on to a cached board.css through a forced
reload and you end up testing the previous stylesheet.

    python tools/serve.py [port]
"""

import http.server
import socketserver
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        self.send_header("Pragma", "no-cache")
        super().end_headers()

    def log_message(self, fmt, *args):
        # Quieter: only report anything that is not a 200/304.
        status = args[1] if len(args) > 1 else ""
        if not str(status).startswith(("2", "3")):
            super().log_message(fmt, *args)


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


def main() -> int:
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    with Server(("", port), NoCacheHandler) as httpd:
        print(f"serving http://localhost:{port} with no-store", flush=True)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
