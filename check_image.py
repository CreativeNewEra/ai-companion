from PIL import Image
import os

def check_image(path):
    if os.path.exists(path):
        with Image.open(path) as img:
            print(f"Image size: {img.size}")
            print(f"Image mode: {img.mode}")
            print(f"Image format: {img.format}")
            print(f"File size: {os.path.getsize(path) / 1024:.2f} KB")
    else:
        print(f"Image not found at {path}")

if __name__ == "__main__":
    check_image("test_output.png")
