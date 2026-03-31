from __future__ import annotations

import json
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
CONTENT_PATH = ROOT / "content" / "site-content.json"


class handler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        if not CONTENT_PATH.exists():
            self._send_json({"error": "Content file not found."}, HTTPStatus.NOT_FOUND)
            return

        payload = json.loads(CONTENT_PATH.read_text(encoding="utf-8"))
        self._send_json(payload)

    def do_POST(self) -> None:
        self._send_json(
            {
                "error": (
                    "Saving from the hosted Vercel admin is not enabled yet. "
                    "Use the local admin server or connect persistent storage first."
                )
            },
            HTTPStatus.NOT_IMPLEMENTED,
        )

    def _send_json(self, payload: dict, status: HTTPStatus = HTTPStatus.OK) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
