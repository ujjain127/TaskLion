from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv
from extensions import db, ma

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configure the app
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///tasklion.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-key-please-change-in-production')

    # Initialize extensions
    CORS(app)
    db.init_app(app)
    ma.init_app(app)

    # Ensure instance folder exists
    try:
        os.makedirs('instance', exist_ok=True)
    except OSError as e:
        print(f"Warning: Could not create instance directory: {e}")

    # Import models
    from models.task import Task

    # Import routes
    from routes import tasks_bp

    # Register blueprints
    app.register_blueprint(tasks_bp, url_prefix='/api')

    return app

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        # Create database tables
        db.create_all()
    app.run(debug=True) 