import os
import threading
import uvicorn
import time
import subprocess
from main import app

def start_tunnel():
    print("Starting localtunnel...")
    time.sleep(3)
    # Start localtunnel
    process = subprocess.Popen(["npx", "localtunnel", "--port", "8000"], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, shell=True)
    
    print("\n" + "="*50)
    print("SALAFIYAH IS LIVE VIA LOCALTUNNEL!")
    print("="*50 + "\n")
    
    for line in process.stdout:
        if "your url is:" in line:
            print("\n" + "="*50)
            print(f"?? PUBLIC URL: {line.strip().split('is: ')[-1]}")
            print("="*50 + "\n")
        print(line.strip())

if __name__ == "__main__":
    # Start the tunnel in a separate thread
    threading.Thread(target=start_tunnel, daemon=True).start()
    
    # Run the FastAPI server
    print("Starting FastAPI server...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
