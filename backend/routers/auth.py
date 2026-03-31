from fastapi import APIRouter, HTTPException, status
from auth import ADMIN_PASSWORD, create_access_token
from schemas import LoginRequest, TokenResponse

router = APIRouter()


@router.post("/auth/login", response_model=TokenResponse)
def login(request: LoginRequest):
    if request.password != ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password",
        )
    token = create_access_token({"sub": "admin"})
    return TokenResponse(access_token=token)
