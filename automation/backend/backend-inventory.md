# Backend Architecture & Security Inventory

## Technology Stack
- **Programming Language**: Python 3.11
- **Framework**: Flask (Werkzeug)
- **Runtime Environment**: WSGI / Gunicorn (Cloud), Local Python (Local)
- **Package Manager**: Pip (`requirements.txt`)
- **ML Integration**: PyTorch, torchvision, timm (EfficientNet-B3)

## Architecture
- **Type**: Monolith API
- **Structure**: Blueprints (Modules for `/api/cases`, `/api/history`, `/api/doi`)

## API Structure
- **Type**: REST API
- **Base URL**: `/api`
- **Data Formats**: JSON, `multipart/form-data` (Image Uploads)

## Authentication & Authorization
- **Authentication**: Currently Anonymous/Unauthenticated.
- **Authorization**: No Roles/Permissions (Public access to cases).
- *(Note for Security Audit: This is an immediate High/Medium finding depending on deployment context).*

## Database
- **Primary Database**: SQLite (`instance/doi_ai.db`)
- **ORM**: Flask-SQLAlchemy (SQLAlchemy)

## Additional Features
- **File Uploads**: Yes (saving to local `/uploads` directory).
- **CORS**: Enabled globally (`Flask-Cors`).
- **External Dependencies**: GitHub LFS (for model weights download).

## Critical Attack Surfaces to Assess
1. **File Uploads**: `/api/cases/classify` accepts image files. Must test for MIME spoofing, oversized files, and path traversal vulnerabilities.
2. **Database Queries**: SQLAlchemy ORM mitigates direct SQL injection, but Mass Assignment on case creation must be tested.
3. **Denial of Service (DoS)**: Image classification is CPU/RAM intensive. Missing rate limiting on the `/classify` endpoint makes the system highly susceptible to DoS.
