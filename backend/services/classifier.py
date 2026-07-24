import os
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
    transforms.Resize((224, 224)),
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
        if os.path.exists(model_path):
            checkpoint = torch.load(model_path, map_location=_device)
            # The saved .pth contains a dict with 'model_state_dict', 'classes', 'accuracy'
            if 'model_state_dict' in checkpoint:
                _model.load_state_dict(checkpoint['model_state_dict'])
            else:
                _model.load_state_dict(checkpoint)
        else:
            print(f"Warning: Model file not found at {model_path}. Using uninitialized weights.")
            
        _model = _model.to(_device)
        _model.eval()

def classify_image(filepath):
    """
    Classifies a histopathology image using EfficientNetB3.
    """
    load_model()
    
    try:
        image = Image.open(filepath).convert('RGB')
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
        # Fallback or indicate error
        return {"classification": "Unknown", "confidence": 0.0}
