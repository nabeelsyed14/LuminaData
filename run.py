import subprocess
import os
import sys
import time
import signal

def run_app():
    print("🚀 Starting LuminaData...")
    
    # Paths
    root_dir = os.path.dirname(os.path.abspath(__file__))
    server_dir = os.path.join(root_dir, "server")
    client_dir = os.path.join(root_dir, "client")

    # Start Backend
    print("📦 Starting Backend (FastAPI)...")
    backend_proc = subprocess.Popen(
        [sys.executable, "main.py"],
        cwd=server_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True
    )

    # Start Frontend
    print("🎨 Starting Frontend (Vite)...")
    # On Windows, we need to use npm.cmd
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=client_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True
    )

    print("\n✅ Both processes are running!")
    print("🔗 Frontend: http://localhost:5173")
    print("🔗 Backend:  http://localhost:8000")
    print("\nPress Ctrl+C to stop both processes.")

    try:
        while True:
            # Optionally print some output
            line = backend_proc.stdout.readline()
            if line:
                print(f"[Backend] {line.strip()}")
            
            line_f = frontend_proc.stdout.readline()
            if line_f:
                # We don't want to flood the console with vite output, maybe just keep it quiet
                pass
            
            time.sleep(0.1)
    except KeyboardInterrupt:
        print("\n🛑 Stopping LuminaData...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Bye!")

if __name__ == "__main__":
    run_app()
