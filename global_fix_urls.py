import os

# Define the root of the project
root_dir = os.path.join(os.getcwd(), 'frontend', 'src')

targets = [
    "http://localhost:3000/api/v1",
    "https://instaclone-g9h5.onrender.com/api/v1",
    "http://localhost:3000"
]

replacement = "/api/v1"
socket_target = "io('http://localhost:3000'"
socket_replacement = "io('/'" # Special case for socket.io if needed, though io('/') is usually best

def fix_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    # Order matters: replace longer strings first
    for target in targets:
        new_content = new_content.replace(target, replacement)
    
    # Clean up double slashes like //api/v1
    new_content = new_content.replace("//api/v1", "/api/v1")
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

# Recursively walk through the src directory
for subdir, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith(('.js', '.jsx')):
            file_path = os.path.join(subdir, file)
            if fix_file(file_path):
                print(f"Fixed: {file_path}")

print("Global URL fix completed.")
