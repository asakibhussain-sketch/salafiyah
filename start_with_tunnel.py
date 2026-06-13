import os
import threading
import uvicorn
import time
import sys
import subprocess
from pyngrok import ngrok, conf
from main import app
from dotenv import load_dotenv

# Load environment variables from .env file
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
                    subprocess.run(f"taskkill /f /pid {pid}", shell=True)
        except:
            pass

def start_tunnel():
    print("Starting ngrok tunnel...")
    token = os.getenv("NGROK_AUTH_TOKEN")
    if token:
        ngrok.set_auth_token(token)
    else:
        print("Warning: NGROK_AUTH_TOKEN not found in environment variables.")

    
    # Try to kill existing ngrok processes
    os.system("taskkill /f /im ngrok.exe >nul 2>&1")
    time.sleep(3)

    for attempt in range(5):
        try:
            public_url = ngrok.connect(8000).public_url
            print("\n" + "="*50)
            print("SALAFIYAH IS LIVE!")
            print(f"Public URL: {public_url}")
            print("Click the link to access the app.")
            print("="*50 + "\n")
            return
        except Exception as e:
            print(f"Tunnel Attempt {attempt+1} failed: {e}")
            if "already online" in str(e):
                print("Trying to disconnect all tunnels...")
                try:
                    for t in ngrok.get_tunnels():
                        ngrok.disconnect(t.public_url)
                except:
                    pass
            time.sleep(10)
    print("Failed to start tunnel after multiple attempts.")

if __name__ == "__main__":
    # Kill anything on 8000
    kill_port(8000)
    
    # Start the tunnel in a separate thread
    threading.Thread(target=start_tunnel, daemon=True).start()
    
    # Run the FastAPI server
    print("Starting FastAPI server...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
