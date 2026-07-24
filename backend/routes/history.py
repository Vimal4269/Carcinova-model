from flask import Blueprint, jsonify
from database.models import Case

history_bp = Blueprint('history', __name__)

@history_bp.route('/cases', methods=['GET'])
def get_cases():
    try:
        # Get all cases, ordered by newest first
        cases = Case.query.order_by(Case.created_at.desc()).all()
        
        results = []
        for c in cases:
            results.append({
                "id": c.id,
                "case_id": c.case_id,
                "patient_name": c.patient_name,
                "classification": c.classification,
                "confidence": c.confidence,
                "max_doi_mm": c.max_doi_mm,
                "t_stage": c.t_stage,
                "risk_classification": c.risk_classification,
                "slide_count": len(c.slides),
                "created_at": c.created_at.isoformat()
            })
            
        return jsonify({"success": True, "cases": results}), 200
        
    except Exception as e:
        print(f"Error fetching cases: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
