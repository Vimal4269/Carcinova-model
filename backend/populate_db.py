import os
import sys
from datetime import datetime, timedelta

# Ensure backend root is in python path
backend_dir = os.path.abspath(os.path.dirname(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import create_app
from database.models import db, User, Case, Slide

def populate_database():
    app = create_app()
    with app.app_context():
        print("=" * 60)
        print("  CARCINOVA DATABASE POPULATION & SEEDING ENGINE  ")
        print("=" * 60)

        db.create_all()
        uploads_dir = os.path.join(backend_dir, 'uploads')
        os.makedirs(uploads_dir, exist_ok=True)

        # 1. Ensure sample slide image exists in uploads
        available_images = [
            f for f in os.listdir(uploads_dir)
            if f.lower().endswith(('.jpg', '.jpeg', '.png')) and os.path.getsize(os.path.join(uploads_dir, f)) > 1000
        ]

        if not available_images:
            try:
                from PIL import Image, ImageDraw
                fallback_name = "default_clinical_slide.jpg"
                fallback_path = os.path.join(uploads_dir, fallback_name)
                img = Image.new('RGB', (800, 600), color=(220, 160, 190))
                draw = ImageDraw.Draw(img)
                draw.rectangle([(200, 150), (600, 450)], outline=(140, 50, 90), width=4)
                img.save(fallback_path, 'JPEG')
                available_images.append(fallback_name)
                print(f"Created fallback clinical slide image: {fallback_name}")
            except Exception as e:
                print(f"Note: PIL image creation: {e}")
                available_images.append("sample_slide.jpg")

        default_img = available_images[0]
        print(f"Default slide asset: {default_img}")

        # 2. Seed Users
        seed_users = [
            {"username": "Vimalraj", "password": "Vimal@123"},
            {"username": "testuser_demo", "password": "password123"},
            {"username": "testuser_ci", "password": "password123"},
            {"username": "doctor_demo", "password": "Doctor@1234"},
            {"username": "admin", "password": "Admin@1234"},
        ]

        users_added = 0
        for u_data in seed_users:
            existing_user = User.query.filter_by(username=u_data["username"]).first()
            if not existing_user:
                user = User(username=u_data["username"])
                user.set_password(u_data["password"])
                db.session.add(user)
                users_added += 1
            else:
                existing_user.set_password(u_data["password"])

        db.session.commit()
        print(f"Users: {len(seed_users)} configured ({users_added} newly created).")

        # 3. Seed Clinical Cases & Slides
        seed_cases = [
            {
                "case_id": "CAR-2024-001",
                "patient_name": "Ramesh Sharma",
                "classification": "OSCC",
                "confidence": 95.8,
                "max_doi_mm": 6.8,
                "t_stage": "T2",
                "risk_classification": "High",
                "days_ago": 12,
                "slides": [
                    {
                        "image_path": available_images[0 % len(available_images)],
                        "classification": "OSCC",
                        "confidence": 95.8,
                        "magnification_selected": "10x",
                        "pixel_to_mm_calibration_factor": 0.005,
                        "surface_y": 140.0,
                        "deepest_y": 1500.0,
                        "doi_pixels": 1360.0,
                        "doi_mm": 6.8,
                    },
                    {
                        "image_path": available_images[1 % len(available_images)],
                        "classification": "OSCC",
                        "confidence": 93.2,
                        "magnification_selected": "20x",
                        "pixel_to_mm_calibration_factor": 0.0025,
                        "surface_y": 200.0,
                        "deepest_y": 2400.0,
                        "doi_pixels": 2200.0,
                        "doi_mm": 5.5,
                    }
                ]
            },
            {
                "case_id": "CAR-2024-002",
                "patient_name": "Priya Sundaram",
                "classification": "OSCC induced OSMF",
                "confidence": 91.4,
                "max_doi_mm": 3.4,
                "t_stage": "T1",
                "risk_classification": "Moderate",
                "days_ago": 9,
                "slides": [
                    {
                        "image_path": available_images[2 % len(available_images)],
                        "classification": "OSCC induced OSMF",
                        "confidence": 91.4,
                        "magnification_selected": "10x",
                        "pixel_to_mm_calibration_factor": 0.005,
                        "surface_y": 120.0,
                        "deepest_y": 800.0,
                        "doi_pixels": 680.0,
                        "doi_mm": 3.4,
                    }
                ]
            },
            {
                "case_id": "CAR-2024-003",
                "patient_name": "Anita Desai",
                "classification": "Normal",
                "confidence": 98.6,
                "max_doi_mm": 0.0,
                "t_stage": "T0",
                "risk_classification": "Low",
                "days_ago": 7,
                "slides": [
                    {
                        "image_path": available_images[3 % len(available_images)],
                        "classification": "Normal",
                        "confidence": 98.6,
                        "magnification_selected": "10x",
                        "pixel_to_mm_calibration_factor": 0.005,
                        "surface_y": None,
                        "deepest_y": None,
                        "doi_pixels": 0.0,
                        "doi_mm": 0.0,
                    }
                ]
            },
            {
                "case_id": "CAR-2024-004",
                "patient_name": "Vikram Malhotra",
                "classification": "OSCC",
                "confidence": 97.2,
                "max_doi_mm": 11.5,
                "t_stage": "T3",
                "risk_classification": "Critical",
                "days_ago": 5,
                "slides": [
                    {
                        "image_path": available_images[4 % len(available_images)],
                        "classification": "OSCC",
                        "confidence": 97.2,
                        "magnification_selected": "10x",
                        "pixel_to_mm_calibration_factor": 0.005,
                        "surface_y": 110.0,
                        "deepest_y": 2410.0,
                        "doi_pixels": 2300.0,
                        "doi_mm": 11.5,
                    }
                ]
            },
            {
                "case_id": "CAR-2024-005",
                "patient_name": "Suresh Patel",
                "classification": "OSCC induced OSMF",
                "confidence": 88.9,
                "max_doi_mm": 4.6,
                "t_stage": "T1",
                "risk_classification": "Moderate",
                "days_ago": 3,
                "slides": [
                    {
                        "image_path": available_images[5 % len(available_images)],
                        "classification": "OSCC induced OSMF",
                        "confidence": 88.9,
                        "magnification_selected": "20x",
                        "pixel_to_mm_calibration_factor": 0.0025,
                        "surface_y": 150.0,
                        "deepest_y": 1990.0,
                        "doi_pixels": 1840.0,
                        "doi_mm": 4.6,
                    }
                ]
            },
            {
                "case_id": "CAR-2024-006",
                "patient_name": "Meera Krishnan",
                "classification": "Normal",
                "confidence": 99.2,
                "max_doi_mm": 0.0,
                "t_stage": "T0",
                "risk_classification": "Low",
                "days_ago": 1,
                "slides": [
                    {
                        "image_path": available_images[6 % len(available_images)],
                        "classification": "Normal",
                        "confidence": 99.2,
                        "magnification_selected": "10x",
                        "pixel_to_mm_calibration_factor": 0.005,
                        "surface_y": None,
                        "deepest_y": None,
                        "doi_pixels": 0.0,
                        "doi_mm": 0.0,
                    }
                ]
            }
        ]

        cases_added = 0
        slides_added = 0

        for c_data in seed_cases:
            existing_case = Case.query.filter_by(case_id=c_data["case_id"]).first()
            if not existing_case:
                c = Case(
                    case_id=c_data["case_id"],
                    patient_name=c_data["patient_name"],
                    classification=c_data["classification"],
                    confidence=c_data["confidence"],
                    max_doi_mm=c_data["max_doi_mm"],
                    t_stage=c_data["t_stage"],
                    risk_classification=c_data["risk_classification"],
                    created_at=datetime.utcnow() - timedelta(days=c_data["days_ago"])
                )
                db.session.add(c)
                db.session.flush()

                for s_data in c_data["slides"]:
                    s = Slide(
                        case_id=c.id,
                        image_path=s_data["image_path"],
                        classification=s_data["classification"],
                        confidence=s_data["confidence"],
                        magnification_selected=s_data.get("magnification_selected"),
                        pixel_to_mm_calibration_factor=s_data.get("pixel_to_mm_calibration_factor"),
                        surface_y=s_data.get("surface_y"),
                        deepest_y=s_data.get("deepest_y"),
                        doi_pixels=s_data.get("doi_pixels"),
                        doi_mm=s_data.get("doi_mm"),
                        created_at=c.created_at
                    )
                    db.session.add(s)
                    slides_added += 1

                cases_added += 1

        db.session.commit()

        total_users = User.query.count()
        total_cases = Case.query.count()
        total_slides = Slide.query.count()

        print("-" * 60)
        print(f"  TOTAL USERS IN DB  : {total_users}")
        print(f"  TOTAL CASES IN DB  : {total_cases} ({cases_added} newly seeded)")
        print(f"  TOTAL SLIDES IN DB : {total_slides} ({slides_added} newly seeded)")
        print("-" * 60)
        print("  DATABASE POPULATION COMPLETED SUCCESSFULLY! [OK]")
        print("=" * 60)

if __name__ == "__main__":
    populate_database()
