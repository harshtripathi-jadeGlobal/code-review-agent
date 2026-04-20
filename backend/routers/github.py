from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from models.database import get_db
from models.models import User
from routers.auth import get_current_user, get_optional_current_user
from typing import Optional
import httpx
import os
from dotenv import load_dotenv

load_dotenv(override=True)

router = APIRouter()

class GithubLinkRequest(BaseModel):
    code: str

@router.post("/link")
async def link_github(data: GithubLinkRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Exchange the code for an access token
    client_id = os.getenv("GITHUB_CLIENT_ID", "")
    client_secret = os.getenv("GITHUB_CLIENT_SECRET", "")
    redirect_uri = os.getenv("GITHUB_REDIRECT_URI", "http://localhost:5173/auth/github/callback")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": client_id,
                "client_secret": client_secret,
                "code": data.code,
                "redirect_uri": redirect_uri
            }
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to exchange code with GitHub")
            
        token_data = response.json()
        if "error" in token_data:
            raise HTTPException(status_code=400, detail=token_data.get("error_description", "Invalid GitHub code"))
            
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="No access token returned")
            
        # Update user record
        current_user.github_access_token = access_token
        await db.commit()
        
        return {"detail": "GitHub account linked successfully"}

@router.delete("/unlink")
async def unlink_github(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    current_user.github_access_token = None
    await db.commit()
    return {"detail": "GitHub account unlinked"}

@router.get("/repos")
async def get_github_repos(current_user: User = Depends(get_current_user)):
    if not current_user.github_access_token:
        raise HTTPException(status_code=400, detail="GitHub account not linked")
        
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.github.com/user/repos",
            headers={
                "Authorization": f"Bearer {current_user.github_access_token}",
                "Accept": "application/vnd.github.v3+json"
            },
            params={"sort": "updated", "per_page": 100}
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch repositories")
            
        return response.json()

@router.get("/repos/{owner}/{repo}/contents")
async def get_github_file_content(owner: str, repo: str, path: str = "", ref: Optional[str] = None, current_user: Optional[User] = Depends(get_optional_current_user)):
    # If user is logged in and has a token, use it for higher rate limits
    headers = {
        "Accept": "application/vnd.github.v3+json"
    }
    
    if current_user and current_user.github_access_token:
        headers["Authorization"] = f"Bearer {current_user.github_access_token}"
    else:
        # Fallback to system token if available (optional)
        system_token = os.getenv("GITHUB_TOKEN")
        if system_token:
            headers["Authorization"] = f"Bearer {system_token}"
            
    url = f"https://api.github.com/repos/{owner}/{repo}/contents"
    if path:
        url += f"/{path}"
        
    params = {}
    if ref:
        params["ref"] = ref
        
    # GitHub API to get file contents
    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            headers=headers,
            params=params
        )
        
        if response.status_code == 404:
            raise HTTPException(status_code=404, detail="File or directory not found in GitHub repository")
            
        if response.status_code == 403 and "rate limit" in response.text.lower():
             raise HTTPException(status_code=403, detail="GitHub API rate limit exceeded. Please link your GitHub account or try again later.")
             
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"Failed to fetch from GitHub: {response.text}")
            
        data = response.json()
        
        # If it's a directory, return it as type dir
        if isinstance(data, list):
            return {
                "type": "dir",
                "items": data
            }
            
        if data.get("type") != "file":
            raise HTTPException(status_code=400, detail="Path is not a file or directory")
            
        import base64
        content = data.get("content", "")
        # GitHub returns base64 encoded content
        if data.get("encoding") == "base64":
            content = base64.b64decode(content).decode("utf-8")
            
        return {
            "type": "file",
            "name": data.get("name"),
            "path": data.get("path"),
            "content": content
        }
