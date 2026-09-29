import os
import sys
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

try:
    ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if ROOT_DIR not in sys.path:
        sys.path.insert(0, ROOT_DIR)
    BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
    if BACKEND_DIR not in sys.path:
        sys.path.insert(0, BACKEND_DIR)
    
    from backend.api.main import app as main_app
    app.mount("/", main_app)
except Exception as e:
    import traceback
    err = traceback.format_exc()
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
    async def catch_all(path: str):
        return JSONResponse(status_code=500, content={"error": "Vercel Startup Crash", "traceback": err})

handler = app
