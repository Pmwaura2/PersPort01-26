from __future__ import annotations

import json
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler


class handler(BaseHTTPRequestHandler):
    def do_POST(self) -> None:
        body = json.dumps(
            {
                "error": (
                    "Uploads are not enabled on the hosted Vercel admin yet. "
                    "Use a direct media URL, the local admin server, or wire this to Vercel Blob."
                )
            }
        ).encode("utf-8")
        self.send_response(HTTPStatus.NOT_IMPLEMENTED)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
