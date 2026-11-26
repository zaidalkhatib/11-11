"""Loopback-only static preview, with known Expo Router routes falling back to index."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

class PreviewHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if urlsplit(self.path).path in ('/home', '/invitations', '/you'):
            self.path = '/index.html'
        return super().do_GET()

if __name__ == '__main__':
    root = Path(__file__).resolve().parent.parent / 'dist'
    server = ThreadingHTTPServer(('127.0.0.1', 8084), partial(PreviewHandler, directory=str(root)))
    print('11:11 local preview: http://127.0.0.1:8084', flush=True)
    server.serve_forever()
