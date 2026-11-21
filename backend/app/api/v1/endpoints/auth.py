from fastapi import APIRouter, HTTPException, status

router = APIRouter()

@router.post("/login")
def login():
    """WIP: User login with JWT token generation (coming in v0.2)."""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Authentication service is currently Work In Progress (WIP). Target release: v0.2."
    )

@router.post("/register")
def register():
    """WIP: User registration (coming in v0.2)."""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Registration service is currently Work In Progress (WIP). Target release: v0.2."
    )
