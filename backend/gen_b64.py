import base64
import os

# Put the name of a real image you have in this folder
IMAGE_NAME = "my_face.jpg" 

if os.path.exists(IMAGE_NAME):
    with open(IMAGE_NAME, "rb") as f:
        b64_str = base64.b64encode(f.read()).decode('utf-8')
        # This adds the header your backend expects
        print(f"data:image/jpeg;base64,{b64_str}")
else:
    print(f"Error: Could not find {IMAGE_NAME} in this folder!")
