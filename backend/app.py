from flask import Flask, send_from_directory
from flask_cors import CORS
import os
from dotenv import load_dotenv
from routes.doi import doi_bp
from routes.history import history_bp
from routes.cases import cases_bp
from routes.misc import misc_bp
from database.models import db

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    load_dotenv()
    
    # Configure Database
    base_dir = os.path.abspath(os.path.dirname(__file__))
    database_url = os.environ.get('DATABASE_URL')
    
    if database_url:
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)
        app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    else:
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(base_dir, 'instance', 'doi_ai.db')
        
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
    }
    
    db.init_app(app)
    
    # Register Blueprints
    app.register_blueprint(doi_bp, url_prefix='/api/doi')
    app.register_blueprint(history_bp, url_prefix='/api/history')
    app.register_blueprint(cases_bp, url_prefix='/api/cases')
    app.register_blueprint(misc_bp, url_prefix='/api/misc')
    
    with app.app_context():
        db.create_all()
        
    # Serve Local Uploads
    @app.route('/uploads/<path:filename>')
    def serve_uploads(filename):
        uploads_dir = os.path.join(base_dir, 'uploads')
        return send_from_directory(uploads_dir, filename)
        
    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
