import subprocess
import os

def run(cmd, cwd=None):
    print(f"Running: {cmd} in {cwd}")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=cwd)
        print(f"Exit code: {result.returncode}")
        print(f"STDOUT: {result.stdout}")
        print(f"STDERR: {result.stderr}")
        with open("py_output.log", "a") as f:
            f.write(f"Cmd: {cmd}\nExit: {result.returncode}\nOut: {result.stdout}\nErr: {result.stderr}\n\n")
    except Exception as e:
        print(f"Exception: {e}")

run("npm install")
run("npm install", cwd="frontend")
run("dir")
