import os
import sys
import io
import uuid
import requests

BASE_URL = os.environ.get('API_BASE_URL', 'http://127.0.0.1:5000/api')
UPLOADS_DIR = r'd:\carcinova\backend\uploads'

def run_tests():
    print("==================================================")
    print("  CARCINOVA BACKEND & LOCAL DATABASE TEST SUITE   ")
    print(f"  Target: {BASE_URL} (Local SQLite DB)")
    print("==================================================\n")

    passed_tests = 0
    total_tests = 5

    # Test 1: User Registration & Authentication (JWT)
    print("[TEST 1/5] Testing User Registration & Login (JWT Auth)...")
    test_user = f"doctor_{uuid.uuid4().hex[:6]}"
    test_pass = "SecurePass123!"

    # Register
    reg_res = requests.post(f"{BASE_URL}/auth/register", json={
        "username": test_user,
        "password": test_pass
    })
    assert reg_res.status_code == 201, f"Register failed: {reg_res.text}"
    reg_data = reg_res.json()
    token = reg_data.get('token')
    assert token, "Token not returned in registration"
    print(f"  ? User '{test_user}' registered successfully.")

    # Login
    login_res = requests.post(f"{BASE_URL}/auth/login", json={
        "username": test_user,
        "password": test_pass
    })
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    login_data = login_res.json()
    auth_token = login_data.get('token')
    assert auth_token, "Token not returned in login"
    print(f"  ? User logged in successfully. Received valid JWT.")

    # Validate /me endpoint with Bearer token
    me_res = requests.get(f"{BASE_URL}/auth/me", headers={"Authorization": f"Bearer {auth_token}"})
    assert me_res.status_code == 200, f"/me verification failed: {me_res.text}"
    assert me_res.json().get('username') == test_user, "Username mismatch in /me"
    print(f"  ? Authenticated session verified for '{test_user}'.")
    passed_tests += 1

    # Test 2: Case Creation & Image Classification (Local DB persistence)
    print("\n[TEST 2/5] Testing Image Classification & Local SQLite Storage...")
    sample_img = os.path.join(UPLOADS_DIR, '310686b21f58473db5b62fba7bf8cbeb_normal_only.jpg')
    if not os.path.exists(sample_img):
        # Fallback to any jpg in uploads
        jpgs = [os.path.join(UPLOADS_DIR, f) for f in os.listdir(UPLOADS_DIR) if f.endswith('.jpg')]
        sample_img = jpgs[0]

    case_code = f"CASE-{uuid.uuid4().hex[:6].upper()}"
    patient_name = "Jonathan Harker"

    with open(sample_img, 'rb') as img_f:
        files = {'image': ('slide_1.jpg', img_f, 'image/jpeg')}
        data = {'case_id': case_code, 'patient_name': patient_name}
        cls_res = requests.post(f"{BASE_URL}/cases/classify", files=files, data=data)

    assert cls_res.status_code == 201, f"Classify failed: {cls_res.text}"
    cls_data = cls_res.json()
    assert cls_data.get('success') is True, "Success flag missing"
    case_db_id = cls_data.get('case_id')
    slide_id = cls_data.get('slide_id')
    classification = cls_data.get('classification')
    print(f"  ? Case {case_code} created (DB ID: {case_db_id}).")
    print(f"  ? AI Classification: {classification} (Slide ID: {slide_id})")
    passed_tests += 1

    # Test 3: Multi-Slide Aggregation via /add_slides
    print("\n[TEST 3/5] Testing Multi-Slide Upload & Staging Aggregation...")
    second_img = os.path.join(UPLOADS_DIR, '009ff88b5d784e3494e6f32122b4f5a2_osmf_002.jpg')
    if not os.path.exists(second_img):
        second_img = sample_img

    with open(second_img, 'rb') as img_f2:
        files2 = {'image': ('slide_2.jpg', img_f2, 'image/jpeg')}
        add_res = requests.post(f"{BASE_URL}/cases/{case_db_id}/add_slides", files=files2)

    assert add_res.status_code == 200, f"Add slides failed: {add_res.text}"
    add_data = add_res.json()
    assert add_data.get('success') is True, "Add slide success flag false"
    print(f"  ? Second slide added. Overall classification: {add_data.get('overall_classification')}")
    passed_tests += 1

    # Test 4: Depth of Invasion (DOI) Calculation
    print("\n[TEST 4/5] Testing DOI Calculation Engine...")
    # Fetch case details to get the newly added slide ID
    detail_res = requests.get(f"{BASE_URL}/cases/{case_db_id}")
    assert detail_res.status_code == 200
    case_obj = detail_res.json().get('case', {})
    slides = case_obj.get('slides', [])
    assert len(slides) >= 2, "Expected at least 2 slides"

    # Find the OSCC/OSMF slide or the second slide
    target_slide = None
    for s in slides:
        if s.get('classification') in ['OSCC', 'OSCC induced OSMF']:
            target_slide = s
            break
    if not target_slide:
        target_slide = slides[0]

    doi_payload = {
        'slide_id': target_slide['id'],
        'surface_points': [100.0, 100.0],
        'tumour_points': [100.0, 200.0],
        'magnification': '10x'
    }
    doi_res = requests.post(f"{BASE_URL}/doi/calculate", json=doi_payload)
    if target_slide.get('classification') == 'Normal':
        # Normal slides must reject DOI calculation with 400
        assert doi_res.status_code == 400
        print("  ? Normal slide correctly rejected DOI measurement (HTTP 400).")
    else:
        assert doi_res.status_code == 200, f"DOI calculation failed: {doi_res.text}"
        doi_data = doi_res.json()
        print(f"  ? DOI Calculated successfully: {doi_data.get('doi_mm')} mm, T-Stage: {doi_data.get('t_stage')}")
    passed_tests += 1

    # Test 5: Case Listing & Archive Integrity
    print("\n[TEST 5/5] Testing Case Listing & Retrieval...")
    list_res = requests.get(f"{BASE_URL}/cases/list")
    assert list_res.status_code == 200, "List cases failed"
    all_cases = list_res.json().get('cases', [])
    found = any(c['id'] == case_db_id for c in all_cases)
    assert found, f"Created case ID {case_db_id} not found in case list"
    print(f"  ? Case list returned {len(all_cases)} records. Created case verified in local database.")
    passed_tests += 1

    print("\n==================================================")
    print(f"  RESULT: ALL {passed_tests}/{total_tests} TESTS PASSED SUCCESSFULLY! ?")
    print("==================================================")
    return True

if __name__ == '__main__':
    try:
        run_tests()
        sys.exit(0)
    except AssertionError as ae:
        print(f"\n? TEST FAILED: {ae}")
        sys.exit(1)
    except Exception as e:
        print(f"\n? UNEXPECTED ERROR: {e}")
        sys.exit(1)
