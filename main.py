from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn
import os
import sqlite3
import json
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# --- Database Setup ---
DB_PATH = "salafiyah.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    # User data/sync table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_data (
            user_id INTEGER PRIMARY KEY,
            data_json TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# --- Models ---
class AuthRequest(BaseModel):
    email: str
    password: Optional[str] = None
    otp: Optional[str] = None
    new_password: Optional[str] = None

# Temporary OTP storage
# In a real app, use Redis or a DB table with expiry
otps = {}

class SyncRequest(BaseModel):
    email: str
    data: dict

class AskRequest(BaseModel):
    messages: list


app = FastAPI(title="Salafiyah API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routes ---

@app.post("/api/auth/request-otp")
async def request_otp(req: AuthRequest):
    import random
    # Generate 6-digit OTP
    code = str(random.randint(100000, 999999))
    otps[req.email] = code
    
    # MOCK: Send OTP to user
    print("\n" + "="*40)
    print(f"MOCK EMAIL SENT TO: {req.email}")
    print(f"SUBJECT: Your Salafiyah Verification Code")
    print(f"MESSAGE: Your One-Time Password is: {code}")
    print("="*40 + "\n")
    
    return {"status": "success", "message": "OTP sent to your email (Mocked in console)"}

@app.post("/api/auth/signup")
async def signup(req: AuthRequest):
    if not req.password:
        raise HTTPException(status_code=400, detail="Password is required")
    # Verify OTP first
    if req.email not in otps or otps[req.email] != req.otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (email, password) VALUES (?, ?)", (req.email, req.password))
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        # Clear OTP after use
        del otps[req.email]
        return {"status": "success", "user_id": user_id, "email": req.email}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Email already registered")

@app.post("/api/auth/forgot-password")
async def forgot_password(req: AuthRequest):
    # Step 1: User requests OTP (handled by /request-otp)
    # Step 2: User submits OTP and New Password
    if req.email not in otps or otps[req.email] != req.otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET password = ? WHERE email = ?", (req.new_password, req.email))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    
    if affected == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    del otps[req.email]
    return {"status": "success", "message": "Password updated successfully"}

@app.post("/api/auth/login")
async def login(req: AuthRequest):
    if not req.password:
        raise HTTPException(status_code=400, detail="Password is required")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, email FROM users WHERE email = ? AND password = ?", (req.email, req.password))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        # Load sync data
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT data_json FROM user_data WHERE user_id = ?", (user[0],))
        data = cursor.fetchone()
        conn.close()
        return {
            "status": "success", 
            "user": {"id": user[0], "email": user[1]},
            "data": json.loads(data[0]) if data else None
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/api/user/sync")
async def sync_data(req: SyncRequest):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Get user id
    cursor.execute("SELECT id FROM users WHERE email = ?", (req.email,))
    user = cursor.fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = user[0]
    data_str = json.dumps(req.data)
    
    cursor.execute('''
        INSERT INTO user_data (user_id, data_json, updated_at) 
        VALUES (?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET data_json=excluded.data_json, updated_at=excluded.updated_at
    ''', (user_id, data_str, datetime.now()))
    
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.post("/api/ask")
async def ask_imam(req: AskRequest):
    import httpx
    api_key = os.getenv("GROQ_API_KEY", "")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": "You are a knowledgeable and compassionate Imam assistant for the Salafiyah app. Answer questions about Islam, Salah, Duas, and general religious guidance with wisdom and according to authentic sources. Keep responses concise and helpful for a mobile app user."},
                        *req.messages
                    ],
                    "temperature": 0.7,
                    "max_tokens": 1024
                },
                timeout=30.0
            )
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


class TasbihRequest(BaseModel):
    context: str = "general remembrance"

@app.post("/api/ai/tasbih")
async def generate_tasbih(req: TasbihRequest):
    import httpx
    api_key = os.getenv("GROQ_API_KEY", "")
    
    system_prompt = """You are an Islamic scholar assistant. When given a user's spiritual state or context, 
    suggest ONE appropriate Dhikr (remembrance of Allah) phrase. Respond ONLY with a valid JSON object in this exact format:
    {"phrase": "transliterated phrase", "arabic": "Arabic text", "meaning": "English meaning and when to use it"}
    
    Choose from authentic Dhikr phrases like SubhanAllah, Alhamdulillah, Allahu Akbar, Astaghfirullah, 
    or longer phrases. Be specific to the context provided."""
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": f"My current state/intention: {req.context}"}
                    ],
                    "temperature": 0.6,
                    "max_tokens": 200,
                    "response_format": {"type": "json_object"}
                },
                timeout=15.0
            )
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            return json.loads(content)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))



# --- Static Files & SPA Support ---

# Helper to serve static files from the root
@app.get("/{path:path}")
async def serve_static(path: str):
    # Strip query string for file checking
    clean_path = path.split('?')[0]
    
    # If it's an API route, let it fall through
    if clean_path.startswith("api/"):
        raise HTTPException(status_code=404)
        
    # Default to index.html for root
    if not clean_path or clean_path == "/":
        return FileResponse("index.html")
        
    # Check if file exists in current directory
    file_path = os.path.join(".", clean_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        # Security check: only allow safe extensions
        allowed_extensions = [".js", ".css", ".png", ".jpg", ".svg", ".ico", ".json", ".mp3", ".html", ".webmanifest", ".txt"]
        if any(clean_path.lower().endswith(ext) for ext in allowed_extensions):
            return FileResponse(file_path)
            
    # Fallback to index.html for SPA routing (if the file doesn't exist)
    if os.path.exists("index.html"):
        return FileResponse("index.html")
        
    return JSONResponse(status_code=404, content={"detail": "Not found"})

if __name__ == "__main__":
    print("Salafiyah Companion Backend is active.")
    print("Local URL: http://localhost:8000")
    print("External Access: http://[YOUR-IP-ADDRESS]:8000")
    # Using 0.0.0.0 to allow mobile devices on the same network to connect
    uvicorn.run(app, host="0.0.0.0", port=8000)

