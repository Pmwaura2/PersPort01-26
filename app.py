from __future__ import annotations

import base64
import json
import mimetypes
import os
import posixpath
import re
import shutil
import sys
import urllib.parse
import uuid
from io import BytesIO
from email.parser import BytesParser
from email.policy import default
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DATA_ROOT = Path(os.environ.get("DATA_DIR", str(ROOT))).resolve()
CONTENT_PATH = DATA_ROOT / "content" / "site-content.json"
MEDIA_ROOT = DATA_ROOT / "media" / "uploads"
ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "")


def ensure_paths() -> None:
    CONTENT_PATH.parent.mkdir(parents=True, exist_ok=True)
    MEDIA_ROOT.mkdir(parents=True, exist_ok=True)


class PortfolioHandler(BaseHTTPRequestHandler):
    server_version = "PortfolioServer/1.0"

    def do_GET(self) -> None:
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path or "/"

        if path == "/health":
            self.send_json({"ok": True})
            return

        if path == "/api/content":
            self.send_json(self.load_content())
            return

        if path == "/admin.html" and not self.is_authorized():
            self.request_auth()
            return

        self.serve_static(path)

    def do_POST(self) -> None:
        parsed = urllib.parse.urlparse(self.path)

        if not self.is_authorized():
            self.request_auth()
            return

        if parsed.path == "/api/content":
            self.handle_save_content()
            return

        if parsed.path == "/api/upload":
            self.handle_upload()
            return

        self.send_error(HTTPStatus.NOT_FOUND, "Not found")

    def is_authorized(self) -> bool:
        if not ADMIN_USERNAME and not ADMIN_PASSWORD:
            return True

        header = self.headers.get("Authorization", "")
        if not header.startswith("Basic "):
            return False

        try:
            decoded = base64.b64decode(header.split(" ", 1)[1]).decode("utf-8")
        except Exception:
            return False

        username, _, password = decoded.partition(":")
        return username == ADMIN_USERNAME and password == ADMIN_PASSWORD

    def request_auth(self) -> None:
        self.send_response(HTTPStatus.UNAUTHORIZED)
        self.send_header("WWW-Authenticate", 'Basic realm="Portfolio Admin"')
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.end_headers()
        self.wfile.write(b"Authentication required.")

    def handle_save_content(self) -> None:
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length)

        try:
            payload = json.loads(raw.decode("utf-8"))
        except json.JSONDecodeError as exc:
            self.send_json({"error": f"Invalid JSON: {exc}"}, status=HTTPStatus.BAD_REQUEST)
            return

        CONTENT_PATH.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        self.send_json({"ok": True})

    def handle_upload(self) -> None:
        uploaded = self.parse_multipart_file()
        if not uploaded:
            self.send_json({"error": "No file uploaded."}, status=HTTPStatus.BAD_REQUEST)
            return

        original_name, file_bytes = uploaded
        if not file_bytes:
            self.send_json({"error": "Uploaded file was empty."}, status=HTTPStatus.BAD_REQUEST)
            return

        safe_name = re.sub(r"[^A-Za-z0-9._-]", "-", original_name)
        target_name = f"{uuid.uuid4().hex[:8]}-{safe_name}"
        target_path = MEDIA_ROOT / target_name

        with target_path.open("wb") as destination:
            shutil.copyfileobj(BytesIO(file_bytes), destination)

        self.send_json({"ok": True, "path": f"/media/uploads/{target_name}"})

    def parse_multipart_file(self) -> tuple[str, bytes] | None:
        content_type = self.headers.get("Content-Type", "")
        if "multipart/form-data" not in content_type:
            return None

        length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(length)
        pseudo_message = (
            f"Content-Type: {content_type}\r\nMIME-Version: 1.0\r\n\r\n".encode("utf-8")
            + body
        )
        message = BytesParser(policy=default).parsebytes(pseudo_message)

        for part in message.iter_parts():
            if part.get_param("name", header="content-disposition") != "file":
                continue

            filename = Path(part.get_filename() or "upload.bin").name
            payload = part.get_payload(decode=True) or b""
            return filename, payload

        return None

    def serve_static(self, request_path: str) -> None:
        route = request_path
        if route == "/":
            route = "/index.html"

        route = posixpath.normpath(urllib.parse.unquote(route))
        route = route.lstrip("/")
        file_path = (ROOT / route).resolve()

        if not str(file_path).startswith(str(ROOT)):
            self.send_error(HTTPStatus.FORBIDDEN, "Forbidden")
            return

        if not file_path.exists() or not file_path.is_file():
            self.send_error(HTTPStatus.NOT_FOUND, "Not found")
            return

        content_type, _ = mimetypes.guess_type(str(file_path))
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type or "application/octet-stream")
        self.end_headers()
        with file_path.open("rb") as handle:
            shutil.copyfileobj(handle, self.wfile)

    def load_content(self) -> dict:
        if not CONTENT_PATH.exists():
            return {}
        return json.loads(CONTENT_PATH.read_text(encoding="utf-8"))

    def send_json(self, payload: dict, status: HTTPStatus = HTTPStatus.OK) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main() -> None:
    ensure_paths()
    port = int(os.environ.get("PORT", "8000"))
    host = os.environ.get("HOST", "0.0.0.0")
    server = ThreadingHTTPServer((host, port), PortfolioHandler)
    print(f"Portfolio server running at http://{host}:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.")
    finally:
        server.server_close()


if __name__ == "__main__":
    sys.exit(main())
