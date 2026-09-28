import os
import sys

try:
    ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if ROOT_DIR not in sys.path:
        sys.path.insert(0, ROOT_DIR)

    BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
    if BACKEND_DIR not in sys.path:
        sys.path.insert(0, BACKEND_DIR)

    from backend.api.main import app
    handler = app
except Exception as e:
    import traceback
    err = traceback.format_exc()
    async def app(scope, receive, send):
        assert scope['type'] == 'http'
        await send({
            'type': 'http.response.start',
            'status': 500,
            'headers': [[b'content-type', b'text/plain']],
        })
        await send({
            'type': 'http.response.body',
            'body': f"Startup Error: {err}".encode('utf-8'),
        })
    handler = app
