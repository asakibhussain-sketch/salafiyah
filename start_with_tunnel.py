import os
import threading
import uvicorn
import time
import subprocess
from main import app
from dotenv import load_dotenv

load_dotenv()

def kill_port(port):
    print(f"Checking port {port}...")
    if os.name == 'nt':
        try:
            output = subprocess.check_output(f"netstat -ano | findstr :{port}", shell=True).decode()
            for line in output.splitlines():
                if "LISTENING" in line:
                    pid = line.strip().split()[-1]
                    print(f"Killing process {pid} on port {port}...")
                    subprocess.run(f"taskkill /f /pid {pid}", shell=True, capture_output=True)
        except:
            pass

def try_ngrok():
    """Try to start ngrok tunnel. Returns True if successful."""
    try:
        from pyngrok import ngrok
        # Support both common key names from .env
        token = os.getenv("NGROK_AUTHTOKEN") or os.getenv("NGROK_AUTH_TOKEN")
        if token:
            ngrok.set_auth_token(token)
        else:
            print("No ngrok auth token found, skipping ngrok...")
            return False

        os.system("taskkill /f /im ngrok.exe >nul 2>&1")
        time.sleep(2)

        public_url = ngrok.connect(8000).public_url
        print("\n" + "="*50)
        print("HIKMAH IS LIVE via ngrok!")
        print(f"Public URL: {public_url}")
        print("="*50 + "\n")
        return True
    except Exception as e:
        print(f"ngrok failed: {e}")
        return False

def try_localtunnel():
    """Fall back to localtunnel."""
    print("Falling back to localtunnel...")
    try:
        process = subprocess.Popen(
            ["npx", "localtunnel", "--port", "8000"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            shell=True
        )
        for line in process.stdout:
            line = line.strip()
            if "your url is:" in line.lower():
                url = line.split("is: ")[-1].strip()
                print("\n" + "="*50)
                print("HIKMAH IS LIVE via localtunnel!")
                print(f"Public URL: {url}")
                print("="*50 + "\n")
            if line:
                print(line)
    except Exception as e:
        print(f"localtunnel also failed: {e}")
        print("Running locally only at: http://localhost:8000")

def start_tunnel():
    time.sleep(3)  # Wait for server to be ready
    if not try_ngrok():
        try_localtunnel()

if __name__ == "__main__":
    kill_port(8000)
    threading.Thread(target=start_tunnel, daemon=True).start()
    print("Starting FastAPI server...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
