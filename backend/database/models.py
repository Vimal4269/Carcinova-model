from datetime import datetime
from database.db import db

class Case(db.Model):
    __tablename__ = 'cases'
    id = db.Column(db.Integer, primary_key=True)
    patient_name = db.Column(db.String(100), nullable=True)
    case_id = db.Column(db.String(50), unique=True, nullable=False)
    classification = db.Column(db.String(50), nullable=True)   # Normal, OSCC, OSCC induced OSMF
    confidence = db.Column(db.Float, nullable=True)             # 0-100 percentage
    max_doi_mm = db.Column(db.Float, nullable=True)
    t_stage = db.Column(db.String(10), nullable=True)
    risk_classification = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship to slides
    slides = db.relationship('Slide', backref='case', lazy=True, cascade="all, delete-orphan")

class Slide(db.Model):
    __tablename__ = 'slides'
    id = db.Column(db.Integer, primary_key=True)
    case_id = db.Column(db.Integer, db.ForeignKey('cases.id'), nullable=False)
    image_path = db.Column(db.String(255), nullable=False)
    
    # AI Classification per slide
    classification = db.Column(db.String(50), nullable=True)   # Normal, OSCC, OSCC induced OSMF
    confidence = db.Column(db.Float, nullable=True)             # 0-100 percentage
    
    # Calibration
    magnification_selected = db.Column(db.String(10), nullable=True)
    pixel_to_mm_calibration_factor = db.Column(db.Float, nullable=True)
    
    # Annotation results
    surface_y = db.Column(db.Float, nullable=True)
    deepest_y = db.Column(db.Float, nullable=True)
    doi_pixels = db.Column(db.Float, nullable=True)
    doi_mm = db.Column(db.Float, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
