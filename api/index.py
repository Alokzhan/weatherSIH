import os
import sys
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def catch_all(path: str):
    return JSONResponse(status_code=200, content={"status": "success", "message": "Vercel is working! The issue is inside main.py."})

handler = app
