import os
import jwt
import bcrypt
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Request, HTTPException, Depends
from database import db
from models import RegisterInput, LoginInput, UserPublic, new_id, now_iso

JWT_ALGORITHM = "HS256"
MAX_ATTEMPTS = 5
LOCKOUT_MINUTES = 15

auth_router = APIRouter(prefix="/api/auth", tags=["auth"])


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def _public(user: dict) -> dict:
    return {
        "id": user["id"],
        "name": user.get("name", ""),
        "email": user["email"],
        "avatar": user.get("avatar"),
        "plan": user.get("plan", "Free"),
        "role": user.get("role", "user"),
        "created_at": user.get("created_at", now_iso()),
    }


async def get_current_user(request: Request) -> dict:
    token = None
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
    if not token:
        token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


@auth_router.post("/register")
async def register(body: RegisterInput):
    email = body.email.lower().strip()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    user = {
        "id": new_id(),
        "name": body.name.strip() or "Creator",
        "email": email,
        "password_hash": hash_password(body.password),
        "avatar": None,
        "plan": "Free",
        "role": "user",
        "created_at": now_iso(),
    }
    await db.users.insert_one(user)
    token = create_access_token(user["id"], email)
    return {"token": token, "user": _public(user)}


@auth_router.post("/login")
async def login(body: LoginInput, request: Request):
    email = body.email.lower().strip()
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{email}"

    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt and attempt.get("count", 0) >= MAX_ATTEMPTS:
        locked_until = attempt.get("locked_until")
        if locked_until and datetime.now(timezone.utc) < datetime.fromisoformat(locked_until):
            raise HTTPException(status_code=429, detail="Too many attempts. Please try again in a few minutes.")

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        count = (attempt.get("count", 0) if attempt else 0) + 1
        update = {"count": count}
        if count >= MAX_ATTEMPTS:
            update["locked_until"] = (datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_MINUTES)).isoformat()
        await db.login_attempts.update_one({"identifier": identifier}, {"$set": update}, upsert=True)
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    await db.login_attempts.delete_one({"identifier": identifier})
    token = create_access_token(user["id"], email)
    return {"token": token, "user": _public(user)}


@auth_router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    return _public(user)


async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "demo@clapclip.ai").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "ClapClip2026!")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "id": new_id(),
            "name": "Demo Creator",
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "avatar": None,
            "plan": "Pro Studio",
            "role": "admin",
            "created_at": now_iso(),
        })
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
