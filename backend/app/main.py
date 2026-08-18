from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import analyze, trend, simulate

app = FastAPI(title="TrackSense API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router)
app.include_router(trend.router)
app.include_router(simulate.router)

@app.get("/health")
def health():
    return {"status": "ok"}
