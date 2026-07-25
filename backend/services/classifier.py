import os
import urllib.request
import torch
import torch.nn.functional as F
import torchvision.transforms as transforms
from PIL import Image
import timm

# Global variables
_model = None
_device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
CLASSES = ["Normal", "OSCC", "OSCC induced OSMF"]

# Setup transformations
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def load_model():
    global _model
    if _model is None:
        # Load the architecture
        _model = timm.create_model('efficientnet_b3', pretrained=False, num_classes=3)
        
        # Load the weights
        model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'doi_ai_model.pth')
        
        # If missing or it's just an LFS pointer (<1MB), auto-download the real 43MB file
        if not os.path.exists(model_path) or os.path.getsize(model_path) < 1000000:
            print(f"Downloading real model file to {model_path}...")
            url = "https://media.githubusercontent.com/media/Vimal4269/Carcinova-model/main/backend/doi_ai_model.pth"
            try:
                urllib.request.urlretrieve(url, model_path)
                print("Model download complete.")
            except Exception as download_err:
                print(f"Failed to download model: {download_err}")

        if os.path.exists(model_path) and os.path.getsize(model_path) >= 1000000:
            checkpoint = torch.load(model_path, map_location=_device)
            if isinstance(checkpoint, dict) and 'model_state_dict' in checkpoint:
                _model.load_state_dict(checkpoint['model_state_dict'])
            elif isinstance(checkpoint, dict):
                _model.load_state_dict(checkpoint)
            else:
                _model = checkpoint
        else:
            print(f"Warning: Model file at {model_path} invalid or missing. Using uninitialized weights.")
            
        _model = _model.to(_device)
        _model.eval()

def classify_image(filepath):
    """
    Classifies a histopathology image using EfficientNetB3.
    """
    load_model()
    
    try:
        image = Image.open(filepath).convert('RGB')
        # Fast, low-RAM resizing in PIL before tensor conversion
        image = image.resize((224, 224))
        input_tensor = transform(image).unsqueeze(0).to(_device)
        
        with torch.no_grad():
            outputs = _model(input_tensor)
            probabilities = F.softmax(outputs, dim=1)[0]
            
            confidence, predicted_idx = torch.max(probabilities, 0)
            
            classification = CLASSES[predicted_idx.item()]
            conf_percent = round(confidence.item() * 100, 1)
            
            return {"classification": classification, "confidence": conf_percent}
    except Exception as e:
        print(f"Error during classification: {e}")
        return {"classification": "Unknown", "confidence": 0.0}
