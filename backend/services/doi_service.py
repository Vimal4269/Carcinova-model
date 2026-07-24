import os
import cv2
import numpy as np
import uuid

def calculate_simple_doi(image_path, surface_y, tumor_points):
    """
    Rapid Prototype Logic:
    - Reads the image
    - Draws the contour from the clicked points
    - Finds the deepest y value in the contour
    - Calculates distance from surface_y
    - Converts to mm
    - Draws visual overlays
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found at {image_path}")

    # Read image
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Could not decode image")

    # Ensure outputs dir exists
    os.makedirs('outputs', exist_ok=True)

    # Calculate deepest point
    # tumor_points is a list of [x, y]
    if not tumor_points:
        raise ValueError("No tumor points provided")

    points_array = np.array(tumor_points, np.int32)
    
    # Find the point with maximum y (deepest in image coordinates)
    deepest_point = max(tumor_points, key=lambda p: p[1])
    deepest_x, deepest_y = deepest_point

    # Calculate DOI
    # Assume scale: 1 pixel = 0.002 mm
    pixel_to_mm = 0.002
    doi_pixels = deepest_y - surface_y
    if doi_pixels < 0:
        doi_pixels = 0 # Tumor is above surface line (invalid medically, but handle gracefully)
    
    doi_mm = round(doi_pixels * pixel_to_mm, 2)

    # --- Draw Overlays ---
    # 1. Draw Surface Line (Blue)
    height, width = img.shape[:2]
    cv2.line(img, (0, int(surface_y)), (width, int(surface_y)), (255, 0, 0), 2)
    cv2.putText(img, "Surface Reference", (10, int(surface_y) - 10), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)

    # 2. Draw Contour (Green)
    points_array = points_array.reshape((-1, 1, 2))
    cv2.polylines(img, [points_array], isClosed=True, color=(0, 255, 0), thickness=2)

    # 3. Draw Deepest Point (Red Circle)
    cv2.circle(img, (deepest_x, deepest_y), 8, (0, 0, 255), -1)
    
    # 4. Draw DOI Measurement Line (Yellow)
    cv2.line(img, (deepest_x, int(surface_y)), (deepest_x, deepest_y), (0, 255, 255), 2)
    cv2.putText(img, f"DOI: {doi_mm} mm", (deepest_x + 15, deepest_y - 20), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)

    # Save output
    out_filename = f"processed_{uuid.uuid4().hex}.jpg"
    out_path = os.path.join('outputs', out_filename)
    cv2.imwrite(out_path, img)

    return {
        "doi_mm": doi_mm,
        "deepest_point": [deepest_x, deepest_y],
        "output_path": out_path
    }
