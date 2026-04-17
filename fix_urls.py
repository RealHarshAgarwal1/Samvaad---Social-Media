import os

files_to_fix = [
    "frontend/src/hooks/useGetUserProfile.jsx",
    "frontend/src/components/Explore.jsx",
    "frontend/src/components/SuggestedUsers.jsx",
    "frontend/src/components/Signup.jsx",
    "frontend/src/components/Profile.jsx",
    "frontend/src/components/Post.jsx",
    "frontend/src/components/Login.jsx",
    "frontend/src/components/LeftSidebar.jsx",
    "frontend/src/components/EditProfile.jsx",
    "frontend/src/components/CreatePost.jsx",
    "frontend/src/components/CommentDialog.jsx",
    "frontend/src/hooks/useGetSuggestedUsers.jsx",
    "frontend/src/components/ChatPage.jsx",
    "frontend/src/hooks/useGetAllPost.jsx",
    "frontend/src/hooks/useGetAllMessage.jsx"
]

for file_path in files_to_fix:
    full_path = os.path.join(os.getcwd(), file_path)
    if os.path.exists(full_path):
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace localhost with relative path
        new_content = content.replace("http://localhost:3000/api/v1", "/api/v1")
        # Also replace socket io url
        new_content = new_content.replace("io('http://localhost:3000'", "io(''")
        
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed {file_path}")
    else:
        print(f"File not found: {file_path}")
