import os

# Test model path
model_path = "gce_ai_tutor/inference_service/data/models/mistral-7b-v0.1.Q2_K.gguf"

if os.path.exists(model_path):
    print(f"✅ Model found: {model_path}")
    file_size = os.path.getsize(model_path)
    print(f"File size: {file_size / (1024 * 1024):.2f} MB")
else:
    print(f"❌ Model not found: {model_path}")
    print("Checking directory contents:")
    dir_path = "gce_ai_tutor/inference_service/data/models"
    if os.path.exists(dir_path):
        print(os.listdir(dir_path))
    else:
        print(f"Directory not found: {dir_path}")
