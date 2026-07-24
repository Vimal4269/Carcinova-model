from flask import Blueprint, request, jsonify, send_file, redirect
import os
from database.models import Case, Slide, db

doi_bp = Blueprint('doi', __name__)

CALIBRATION_FACTORS = {
    '4x': 0.0025,   # 1 px = 2.5 um
    '10x': 0.0010,  # 1 px = 1.0 um
    '20x': 0.0005,  # 1 px = 0.5 um
    '40x': 0.00025  # 1 px = 0.25 um
}

def calculate_ajcc_stage(doi):
    if doi <= 2: return 'T1'
    if doi <= 4: return 'T2'
    if doi <= 10: return 'T3'
    return 'T4'

def calculate_risk(doi):
    if doi < 5: return 'Low'
    if doi <= 10: return 'Moderate'
    return 'High'

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')

@doi_bp.route('/slide_image/<int:slide_id>', methods=['GET'])
def get_slide_image(slide_id):
    slide = Slide.query.get_or_404(slide_id)
    
    # Try to serve file directly from uploads folder to prevent CORS redirect issues
    if slide.image_path.startswith('http'):
        filename = slide.image_path.split('/')[-1]
        local_path = os.path.join(UPLOAD_FOLDER, filename)
    else:
        local_path = slide.image_path

    if os.path.exists(local_path):
        return send_file(local_path)
        
    # Fallback to redirect if local file is missing but URL is remote
    if slide.image_path.startswith('http'):
        return redirect(slide.image_path)
        
    return jsonify({"success": False, "message": "Image file not found"}), 404

@doi_bp.route('/calculate', methods=['POST'])
def calculate_doi():
    data = request.json
    slide_id = data.get('slide_id')
    surface_points = data.get('surface_points') # [x1, y1, x2, y2, ...]
    tumour_points = data.get('tumour_points') # [x1, y1, x2, y2, ...]
    magnification = data.get('magnification')

    if not all([slide_id, surface_points, tumour_points, magnification]):
        return jsonify({"success": False, "message": "Missing parameters"}), 400

    # Guard: DOI only applicable for OSCC slides (do not measure normal slides)
    guard_slide = Slide.query.get_or_404(slide_id)
    if guard_slide.classification not in ["OSCC", "OSCC induced OSMF"]:
        return jsonify({
            "success": False,
            "message": "DOI measurement is only applicable for OSCC or OSCC induced OSMF slides."
        }), 400


    import math
    surface_x = surface_points[0]
    surface_y = surface_points[1]
    tumour_x = tumour_points[0]
    tumour_y = tumour_points[1]

    # Calculate absolute Euclidean (straight-line) distance
    doi_pixels = math.sqrt((tumour_x - surface_x)**2 + (tumour_y - surface_y)**2)
        
    calibration = CALIBRATION_FACTORS.get(magnification, 0.001)
    doi_mm = doi_pixels * calibration

    # 4. Save to slide
    slide = Slide.query.get_or_404(slide_id)
    slide.magnification_selected = magnification
    slide.pixel_to_mm_calibration_factor = calibration
    slide.surface_y = surface_y
    slide.deepest_y = tumour_y
    slide.doi_pixels = doi_pixels
    slide.doi_mm = doi_mm
    db.session.commit()

    # 5. Aggregate Case
    case = slide.case
    all_slide_dois = [s.doi_mm for s in case.slides if s.doi_mm is not None]
    
    if all_slide_dois:
        max_doi = max(all_slide_dois)
        case.max_doi_mm = max_doi
        case.t_stage = calculate_ajcc_stage(max_doi)
        case.risk_classification = calculate_risk(max_doi)
        db.session.commit()

    return jsonify({
        "success": True,
        "doi_pixels": doi_pixels,
        "doi_mm": doi_mm,
        "max_case_doi_mm": case.max_doi_mm,
        "t_stage": case.t_stage,
        "risk": case.risk_classification
    })
