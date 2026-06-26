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
POSTGRES_URL = os.getenv("POSTGRES_URL")
USE_POSTGRES = bool(POSTGRES_URL)

if USE_POSTGRES:
    try:
        import psycopg2
    except ImportError:
        print("Warning: psycopg2-binary not installed but POSTGRES_URL is set. Falling back to SQLite.")
        USE_POSTGRES = False

def get_db_connection():
    if USE_POSTGRES:
        conn = psycopg2.connect(POSTGRES_URL)
        return conn, "postgres"
    else:
        conn = sqlite3.connect(DB_PATH)
        return conn, "sqlite"

def execute_query(query, params=(), fetch=None, commit=False):
    conn, db_type = get_db_connection()
    cursor = conn.cursor()
    
    try:
        if db_type == "postgres":
            cursor.execute(query, params)
        else:
            # Replace %s with ? for SQLite
            sqlite_query = query.replace("%s", "?")
            cursor.execute(sqlite_query, params)
            
        result = None
        if fetch == "one":
            result = cursor.fetchone()
        elif fetch == "all":
            result = cursor.fetchall()
            
        rowcount = cursor.rowcount
        
        if commit:
            conn.commit()
            
        return {"result": result, "rowcount": rowcount}
    finally:
        conn.close()

def init_db():
    conn, db_type = get_db_connection()
    cursor = conn.cursor()
    
    id_column_def = "id SERIAL PRIMARY KEY" if db_type == "postgres" else "id INTEGER PRIMARY KEY AUTOINCREMENT"
    
    # Users table
    cursor.execute(f'''
        CREATE TABLE IF NOT EXISTS users (
            {id_column_def},
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
        res = execute_query(
            "INSERT INTO users (email, password) VALUES (%s, %s) RETURNING id",
            (req.email, req.password),
            fetch="one",
            commit=True
        )
        user_id = res["result"][0]
        # Clear OTP after use
        del otps[req.email]
        return {"status": "success", "user_id": user_id, "email": req.email}
    except Exception as e:
        if "IntegrityError" in type(e).__name__ or "UNIQUE" in str(e):
            raise HTTPException(status_code=400, detail="Email already registered")
        raise e

@app.post("/api/auth/forgot-password")
async def forgot_password(req: AuthRequest):
    # Step 1: User requests OTP (handled by /request-otp)
    # Step 2: User submits OTP and New Password
    if req.email not in otps or otps[req.email] != req.otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    res = execute_query(
        "UPDATE users SET password = %s WHERE email = %s",
        (req.new_password, req.email),
        commit=True
    )
    affected = res["rowcount"]
    
    if affected == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    del otps[req.email]
    return {"status": "success", "message": "Password updated successfully"}

@app.post("/api/auth/login")
async def login(req: AuthRequest):
    if not req.password:
        raise HTTPException(status_code=400, detail="Password is required")
    res = execute_query(
        "SELECT id, email FROM users WHERE email = %s AND password = %s",
        (req.email, req.password),
        fetch="one"
    )
    user = res["result"]
    
    if user:
        # Load sync data
        data_res = execute_query(
            "SELECT data_json FROM user_data WHERE user_id = %s",
            (user[0],),
            fetch="one"
        )
        data = data_res["result"]
        return {
            "status": "success", 
            "user": {"id": user[0], "email": user[1]},
            "data": json.loads(data[0]) if data else None
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/api/user/sync")
async def sync_data(req: SyncRequest):
    # Get user id
    user_res = execute_query(
        "SELECT id FROM users WHERE email = %s",
        (req.email,),
        fetch="one"
    )
    user = user_res["result"]
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = user[0]
    data_str = json.dumps(req.data)
    
    execute_query('''
        INSERT INTO user_data (user_id, data_json, updated_at) 
        VALUES (%s, %s, %s)
        ON CONFLICT(user_id) DO UPDATE SET data_json=EXCLUDED.data_json, updated_at=EXCLUDED.updated_at
    ''', (user_id, data_str, datetime.now()), commit=True)
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

@app.get("/api/quiz")
async def generate_quiz():
    import httpx
    import json
    api_key = os.getenv("GROQ_API_KEY", "")
    
    prompt = "Generate 5 multiple choice questions about general Islamic knowledge. Make them diverse (history, quran, prophets, fiqh). Return a JSON object with a single key 'questions' containing an array of objects. Each object must have 'q' (the question string), 'a' (an array of exactly 4 answer strings), and 'c' (the integer index 0-3 of the correct answer in 'a')."
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": "You output only valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    "response_format": {"type": "json_object"},
                    "temperature": 0.8
                },
                timeout=30.0
            )
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            parsed = json.loads(content)
            return parsed
        except Exception as e:
            print("Quiz generation error:", e)
            return {"questions": [
                { "q": "What is the first month of the Islamic calendar?", "a": ["Muharram", "Ramadan", "Shawwal", "Safar"], "c": 0 },
                { "q": "How many chapters (Surahs) are in the Quran?", "a": ["110", "114", "120", "100"], "c": 1 },
                { "q": "Which prophet is known as 'Khalilullah' (Friend of Allah)?", "a": ["Musa", "Isa", "Ibrahim", "Nuh"], "c": 2 },
                { "q": "What is the shortest Surah in the Quran?", "a": ["Al-Ikhlas", "Al-Asr", "Al-Kawthar", "An-Nas"], "c": 2 },
                { "q": "Which companion is known as 'The Sword of Allah'?", "a": ["Umar ibn al-Khattab", "Ali ibn Abi Talib", "Khalid ibn al-Walid", "Hamza ibn Abdul-Muttalib"], "c": 2 }
            ]}


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
            media_type = None
            if clean_path.lower().endswith('.css'):
                media_type = 'text/css'
            elif clean_path.lower().endswith('.js'):
                media_type = 'application/javascript'
            elif clean_path.lower().endswith('.svg'):
                media_type = 'image/svg+xml'
            elif clean_path.lower().endswith('.json') or clean_path.lower().endswith('.webmanifest'):
                media_type = 'application/json'
            return FileResponse(file_path, media_type=media_type)
            
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

