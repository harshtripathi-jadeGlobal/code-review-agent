from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from models.database import get_db
from models.models import User, Submission
from services.auth_service import get_password_hash, verify_password, create_jwe_token, decode_jwe_token
from fastapi.security import OAuth2PasswordBearer
from google.oauth2 import id_token
from google.auth.transport import requests
import os

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "YOUR_GOOGLE_CLIENT_ID_PLACEHOLDER")

class NativeSignup(BaseModel):
    email: str
    password: str
    name: str

class NativeLogin(BaseModel):
    email: str
    password: str

class GoogleLogin(BaseModel):
    token: str

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    claims = decode_jwe_token(token)
    if not claims or "sub" not in claims:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")
    
    user_id = claims["sub"]
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        
    return user

@router.post("/signup")
async def signup(data: NativeSignup, db: Session = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_pwd = get_password_hash(data.password)
    new_user = User(email=data.email, hashed_password=hashed_pwd, name=data.name)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    token = create_jwe_token({"sub": str(new_user.id), "email": new_user.email})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/login")
async def login(data: NativeLogin, db: Session = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalars().first()
    
    if not user or not user.hashed_password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    token = create_jwe_token({"sub": str(user.id), "email": user.email})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/google")
async def google_auth(data: GoogleLogin, db: Session = Depends(get_db)):
    try:
        idinfo = id_token.verify_oauth2_token(data.token, requests.Request(), GOOGLE_CLIENT_ID)
        
        email = idinfo['email']
        name = idinfo.get('name', '')
        google_id = idinfo['sub']
        
        # Find if user exists
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalars().first()
        
        if not user:
            # Create user
            user = User(email=email, name=name, google_id=google_id)
            db.add(user)
            await db.commit()
            await db.refresh(user)
        else:
            # Update google_id if missing
            if not user.google_id:
                user.google_id = google_id
                await db.commit()
                
        token = create_jwe_token({"sub": str(user.id), "email": user.email})
        return {"access_token": token, "token_type": "bearer"}
        
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")

@router.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "github_linked": True if user.github_access_token else False
    }
