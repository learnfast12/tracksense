from fastapi import APIRouter
from app.services.trend import get_all_trends

router = APIRouter()

@router.get("/trend")
def trend():
    return get_all_trends()
