import easyocr
import os

def download():
    print("Pre-downloading EasyOCR models...")
    # This will download the detecting and recognizing models
    reader = easyocr.Reader(['en'], gpu=False)
    print("Models downloaded successfully.")

if __name__ == "__main__":
    download()
