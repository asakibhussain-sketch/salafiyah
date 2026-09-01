from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn
import os
import ssl

# ── Permanent fix for Windows SSLKEYLOGFILE PermissionError ──────────────────
# Python's ssl module reads the SSLKEYLOGFILE env-var at context creation time.
# On this machine that var points to a *directory* (C:\AppData\Local\Temp),
# which causes a PermissionError. We pre-build a shared SSL context that never
# touches that path and re-use it for every httpx call.
os.environ.pop("SSLKEYLOGFILE", None)   # clear before ssl module reads it

def _make_ssl_ctx() -> ssl.SSLContext:
    import certifi
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    ctx.load_verify_locations(certifi.where())
    ctx.check_hostname = True
    ctx.verify_mode = ssl.CERT_REQUIRED
    # Explicitly do NOT set keylog_filename
    return ctx

SSL_CTX = _make_ssl_ctx()
# ─────────────────────────────────────────────────────────────────────────────

import sqlite3
import json
from datetime import datetime, timedelta
import secrets
import hashlib
import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
os.environ.pop("SSLKEYLOGFILE", None)  # clear again in case dotenv re-set it

# --- Database Setup ---
# Vercel (and most serverless) has a read-only filesystem — only /tmp is writable.
IS_SERVERLESS = not os.path.exists(".env")
DB_PATH = "/tmp/salafiyah.db" if IS_SERVERLESS else "salafiyah.db"

# Vercel Postgres (Neon) sets one of these env vars
POSTGRES_URL = (
    os.getenv("POSTGRES_URL_NON_POOLING") or  # direct connection, most reliable
    os.getenv("POSTGRES_URL") or
    os.getenv("DATABASE_URL")
)
USE_POSTGRES = False
_pg_params = None  # Will hold parsed connection params

def _parse_postgres_url(url):
    """Parse a postgres:// or postgresql:// URL into psycopg2 kwargs.
    Avoids passing the raw URI to psycopg2 which can fail on SSL/SNI with Neon."""
    import urllib.parse
    parsed = urllib.parse.urlparse(url)
    params = {
        "host":    parsed.hostname,
        "port":    parsed.port or 5432,
        "dbname":  (parsed.path or "/").lstrip("/"),
        "user":    parsed.username,
        "password": urllib.parse.unquote(parsed.password or ""),
        "sslmode": "require",          # Neon always requires SSL
        "connect_timeout": 8,
    }
    # Override sslmode if provided in query string
    qs = urllib.parse.parse_qs(parsed.query)
    if "sslmode" in qs:
        params["sslmode"] = qs["sslmode"][0]
    return params

if POSTGRES_URL:
    try:
        import psycopg2
        _pg_params = _parse_postgres_url(POSTGRES_URL)
        _test = psycopg2.connect(**_pg_params)
        _test.close()
        USE_POSTGRES = True
        print(f"Postgres connected OK (host={_pg_params['host']})")
    except ImportError:
        print("psycopg2-binary not installed. Using SQLite.")
    except Exception as e:
        print(f"Postgres connection failed: {type(e).__name__}: {e}. Using SQLite.")

def get_db_connection():
    if USE_POSTGRES and _pg_params:
        try:
            conn = psycopg2.connect(**_pg_params)
            return conn, "postgres"
        except Exception as e:
            print(f"Postgres runtime error: {e}. Falling back to SQLite.")
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
    
    conn.commit()
    conn.close()

try:
    init_db()
except Exception as e:
    print(f"WARNING: init_db() failed: {e}")

# --- Models ---
class AskRequest(BaseModel):
    messages: list


app = FastAPI(title="Hikmah API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routes ---

@app.get("/api/health")
@app.get("/health")
async def health():
    """Diagnostic endpoint to check deployment config."""
    db_writable = False
    try:
        test_path = "/tmp/_health_test.db"
        import sqlite3 as sq
        sq.connect(test_path).close()
        os.remove(test_path)
        db_writable = True
    except Exception as e:
        db_writable = str(e)

    pg_url_raw = os.getenv("POSTGRES_URL") or os.getenv("DATABASE_URL") or ""
    return {
        "status": "ok",
        "db_path": DB_PATH,
        "db_type": "postgres" if USE_POSTGRES else "sqlite",
        "tmp_writable": db_writable,
        "is_serverless": IS_SERVERLESS,
        "has_brevo": bool(os.getenv("BREVO_API_KEY")),
        "has_resend": bool(os.getenv("RESEND_API_KEY")),
        "postgres_url_scheme": pg_url_raw[:20] + "..." if pg_url_raw else "not set",
        "postgres_connected": USE_POSTGRES,
    }


@app.post("/api/ask")
@app.post("/ask")
async def ask_imam(req: AskRequest):
    import httpx

    SYSTEM_PROMPT = "You are a knowledgeable and compassionate Imam assistant for the Hikmah app. Answer questions about Islam, Salah, Duas, and general religious guidance with wisdom and according to authentic sources. Keep responses concise and helpful for a mobile app user."

    # Sanitize messages array to ensure valid role and string content only
    clean_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for m in req.messages:
        if isinstance(m, dict) and m.get("content"):
            role = "assistant" if m.get("role") in ["bot", "assistant"] else "user"
            clean_messages.append({"role": role, "content": str(m["content"])})

    providers = [
        {
            "name": "Groq (groq/compound)",
            "url": "https://api.groq.com/openai/v1/chat/completions",
            "key": os.getenv("GROQ_API_KEY", ""),
            "model": "groq/compound"
        },
        {
            "name": "Groq (allam-2-7b)",
            "url": "https://api.groq.com/openai/v1/chat/completions",
            "key": os.getenv("GROQ_API_KEY", ""),
            "model": "allam-2-7b"
        },
        {
            "name": "Groq (qwen3.6-27b)",
            "url": "https://api.groq.com/openai/v1/chat/completions",
            "key": os.getenv("GROQ_API_KEY", ""),
            "model": "qwen/qwen3.6-27b"
        },
        {
            "name": "Groq (gpt-oss-20b)",
            "url": "https://api.groq.com/openai/v1/chat/completions",
            "key": os.getenv("GROQ_API_KEY", ""),
            "model": "openai/gpt-oss-20b"
        }
    ]

    last_error = None

    async with httpx.AsyncClient(verify=SSL_CTX) as client:
        for provider in providers:
            if not provider["key"]:
                continue

            try:
                print(f"Trying {provider['name']}...")
                response = await client.post(
                    provider["url"],
                    headers={"Authorization": f"Bearer {provider['key']}"},
                    json={
                        "model": provider["model"],
                        "messages": clean_messages,
                        "temperature": 0.7,
                        "max_tokens": 1024
                    },
                    timeout=15.0
                )

                if response.status_code == 200:
                    data = response.json()
                    if data.get("choices") and data["choices"][0].get("message"):
                        print(f"Success with {provider['name']}!")
                        return data
                    else:
                        last_error = f"{provider['name']}: unexpected response shape: {data}"
                else:
                    print(f"{provider['name']} failed ({response.status_code}): {response.text[:200]}")
                    last_error = f"{provider['name']} ({response.status_code}): {response.text[:200]}"

            except Exception as e:
                print(f"{provider['name']} exception: {e}")
                last_error = str(e)

    raise HTTPException(status_code=500, detail=f"All AI providers failed. Details: {last_error}")


@app.get("/api/quiz")
@app.get("/quiz")
async def generate_quiz():
    import httpx
    import json
    api_key = os.getenv("GROQ_API_KEY", "")
    
    prompt = "Generate 5 multiple choice questions about general Islamic knowledge. Make them diverse (history, quran, prophets, fiqh). Return a JSON object with a single key 'questions' containing an array of objects. Each object must have 'q' (the question string), 'a' (an array of exactly 4 answer strings), and 'c' (the integer index 0-3 of the correct answer in 'a')."
    
    async with httpx.AsyncClient(verify=SSL_CTX) as client:
        try:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "model": "groq/compound",
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
@app.post("/ai/tasbih")
@app.post("/tasbih")
async def generate_tasbih(req: TasbihRequest):
    import httpx
    api_key = os.getenv("GROQ_API_KEY", "")
    
    system_prompt = """You are an Islamic scholar assistant. When given a user's spiritual state or context, 
    suggest ONE appropriate Dhikr (remembrance of Allah) phrase. Respond ONLY with a valid JSON object in this exact format:
    {"phrase": "transliterated phrase", "arabic": "Arabic text", "meaning": "English meaning and when to use it"}
    
    Choose from authentic Dhikr phrases like SubhanAllah, Alhamdulillah, Allahu Akbar, Astaghfirullah, 
    or longer phrases. Be specific to the context provided."""
    
    async with httpx.AsyncClient(verify=SSL_CTX) as client:
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
    if clean_path.startswith("api/") or clean_path in ["ask", "health", "quiz", "tasbih", "ai/tasbih"]:
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
    print("Hikmah Companion Backend is active.")
    print("Local URL: http://localhost:8000")
    print("External Access: http://[YOUR-IP-ADDRESS]:8000")
    # Using 0.0.0.0 to allow mobile devices on the same network to connect
    uvicorn.run(app, host="0.0.0.0", port=8000)

