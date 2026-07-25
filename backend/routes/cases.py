import os
import uuid
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from database.models import Case, Slide, db
from services.classifier import classify_image

cases_bp = Blueprint('cases', __name__)

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


CLASSIFICATION_SEVERITY = {
    "OSCC": 3,
    "OSCC induced OSMF": 2,
    "Normal": 1,
    "Unknown": 0
}

# ── NEW: Classification-first endpoint ──────────────────────────────────────
@cases_bp.route('/classify', methods=['POST'])
def classify_case():
    """
    Primary endpoint: upload multiple images, run classification on each, create case + slides.
    Aggregates overall case classification using the worst-case method.
    """
    data = request.form
    patient_name = data.get('patient_name', 'Unknown')
    case_id_str = data.get('case_id')
    images = request.files.getlist('image')

    if not case_id_str:
        return jsonify({"success": False, "message": "Case ID is required."}), 400
    if not images or (len(images) == 1 and images[0].filename == ''):
        return jsonify({"success": False, "message": "At least one slide image file is required."}), 400

    # Prevent duplicate case IDs
    existing = Case.query.filter_by(case_id=case_id_str).first()
    if existing:
        return jsonify({"success": False, "message": "Case ID already exists."}), 400

    # Create the case record first
    new_case = Case(patient_name=patient_name, case_id=case_id_str)
    db.session.add(new_case)
    db.session.commit()

    slide_records = []
    
    # Process each uploaded image
    for image in images:
        if not image or image.filename == '':
            continue
        
        filename = secure_filename(f"{uuid.uuid4().hex}_{image.filename}")
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        image.save(filepath)

        # Run classification per slide
        result = classify_image(filepath)
        
        # Create linked slide
        base_url = request.host_url.rstrip('/')
        new_slide = Slide(
            case_id=new_case.id, 
            image_path=f"{base_url}/uploads/{filename}",
            classification=result["classification"],
            confidence=result["confidence"]
        )
        db.session.add(new_slide)
        slide_records.append(new_slide)

    if not slide_records:
        # Rollback case if no valid images processed
        db.session.delete(new_case)
        db.session.commit()
        return jsonify({"success": False, "message": "No valid slide images could be processed."}), 400

    db.session.commit()

    # Worst-case aggregation: find slide with highest classification severity
    # If severities are equal, pick the one with highest confidence
    worst_slide = max(
        slide_records, 
        key=lambda s: (CLASSIFICATION_SEVERITY.get(s.classification, 0), s.confidence or 0)
    )

    new_case.classification = worst_slide.classification
    new_case.confidence = worst_slide.confidence
    db.session.commit()

    return jsonify({
        "success": True,
        "case_id": new_case.id,
        "case_number": new_case.case_id,
        "classification": new_case.classification,
        "confidence": new_case.confidence,
        "message": f"Case created with {len(slide_records)} slides. Overall classification: {new_case.classification}."
    }), 201


# ── Add slides to an existing Case ──────────────────────────────────────────
@cases_bp.route('/<int:case_id>/add_slides', methods=['POST'])
def add_slides(case_id):
    case = Case.query.get_or_404(case_id)
    images = request.files.getlist('image')

    if not images or (len(images) == 1 and images[0].filename == ''):
        return jsonify({"success": False, "message": "At least one slide image file is required."}), 400

    slide_records = []
    for image in images:
        if not image or image.filename == '':
            continue
        
        filename = secure_filename(f"{uuid.uuid4().hex}_{image.filename}")
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        image.save(filepath)

        # Run classification per slide
        result = classify_image(filepath)
        
        # Create linked slide
        base_url = request.host_url.rstrip('/')
        new_slide = Slide(
            case_id=case.id, 
            image_path=f"{base_url}/uploads/{filename}",
            classification=result["classification"],
            confidence=result["confidence"]
        )
        db.session.add(new_slide)
        slide_records.append(new_slide)

    if not slide_records:
        return jsonify({"success": False, "message": "No valid slide images could be processed."}), 400

    db.session.commit()

    # Recalculate overall Case classification/confidence based on ALL slides (existing + new)
    all_slides = Slide.query.filter_by(case_id=case.id).all()
    worst_slide = max(
        all_slides, 
        key=lambda s: (CLASSIFICATION_SEVERITY.get(s.classification, 0), s.confidence or 0)
    )

    case.classification = worst_slide.classification
    case.confidence = worst_slide.confidence

    # Recalculate overall Case max DOI/Risk/Staging (if slides have DOI measurements)
    from routes.doi import calculate_ajcc_stage, calculate_risk
    all_slide_dois = [s.doi_mm for s in all_slides if s.doi_mm is not None]
    if all_slide_dois:
        max_doi = max(all_slide_dois)
        case.max_doi_mm = max_doi
        case.t_stage = calculate_ajcc_stage(max_doi)
        case.risk_classification = calculate_risk(max_doi)
    else:
        case.max_doi_mm = None
        case.t_stage = None
        case.risk_classification = None

    db.session.commit()

    return jsonify({
        "success": True,
        "message": f"Added {len(slide_records)} slides successfully.",
        "case_id": case.id,
        "classification": case.classification,
        "confidence": case.confidence
    })


# ── Existing: Legacy multi-slide create (kept for backward compatibility) ───
@cases_bp.route('/create', methods=['POST'])
def create_case():
    data = request.form
    patient_name = data.get('patient_name', 'Unknown')
    case_id = data.get('case_id')

    if not case_id:
        return jsonify({"success": False, "message": "Case ID is required."}), 400

    existing_case = Case.query.filter_by(case_id=case_id).first()
    if existing_case:
        return jsonify({"success": False, "message": "Case ID already exists."}), 400

    new_case = Case(patient_name=patient_name, case_id=case_id)
    db.session.add(new_case)
    db.session.commit()

    files = request.files.getlist('slides')
    for file in files:
        if file and file.filename:
            filename = secure_filename(f"{uuid.uuid4().hex}_{file.filename}")
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            base_url = request.host_url.rstrip('/')
            new_slide = Slide(case_id=new_case.id, image_path=f"{base_url}/uploads/{filename}")
            db.session.add(new_slide)

    db.session.commit()

    return jsonify({
        "success": True,
        "case_id": new_case.id,
        "case_number": new_case.case_id,
        "message": f"Case created with {len(files)} slides."
    }), 201


# ── List all cases ───────────────────────────────────────────────────────────
@cases_bp.route('/list', methods=['GET'])
def list_cases():
    cases = Case.query.order_by(Case.created_at.desc()).all()
    results = []
    for c in cases:
        results.append({
            "id": c.id,
            "patient_name": c.patient_name,
            "case_id": c.case_id,
            "classification": c.classification,
            "confidence": c.confidence,
            "max_doi_mm": c.max_doi_mm,
            "t_stage": c.t_stage,
            "risk_classification": c.risk_classification,
            "slide_count": len(c.slides),
            "created_at": c.created_at.isoformat()
        })
    return jsonify({"success": True, "cases": results})


# ── Get single case ──────────────────────────────────────────────────────────
@cases_bp.route('/<int:case_id>', methods=['GET'])
def get_case(case_id):
    c = Case.query.get_or_404(case_id)
    slides = [{
        "id": s.id,
        "image_path": s.image_path,
        "doi_mm": s.doi_mm,
        "classification": s.classification,
        "confidence": s.confidence
    } for s in c.slides]

    return jsonify({
        "success": True,
        "case": {
            "id": c.id,
            "patient_name": c.patient_name,
            "case_id": c.case_id,
            "classification": c.classification,
            "confidence": c.confidence,
            "max_doi_mm": c.max_doi_mm,
            "t_stage": c.t_stage,
            "risk_classification": c.risk_classification,
            "slides": slides
        }
    })

# ── Delete single case ───────────────────────────────────────────────────────
@cases_bp.route('/<int:case_id>', methods=['DELETE'])
def delete_case(case_id):
    c = Case.query.get_or_404(case_id)
    # Delete associated slide images from the filesystem
    for slide in c.slides:
        if slide.image_path:
            # Check if it's a local URL e.g., http://localhost:5000/uploads/filename.jpg
            if slide.image_path.startswith('http'):
                filename = slide.image_path.split('/')[-1]
                local_path = os.path.join(UPLOAD_FOLDER, filename)
                if os.path.exists(local_path):
                    try:
                        os.remove(local_path)
                    except Exception as e:
                        print(f"Failed to delete local file {local_path}: {e}")
            elif os.path.exists(slide.image_path):
                try:
                    os.remove(slide.image_path)
                except Exception as e:
                    print(f"Failed to delete local file {slide.image_path}: {e}")
                
    try:
        db.session.delete(c)
        db.session.commit()
        return jsonify({"success": True, "message": "Case deleted successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
