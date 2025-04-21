from flask import Flask
from flask_cors import CORS
from .models import db
from .schemas import ma
from .routes.tasks import tasks_bp
from .config import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    CORS(app)
    db.init_app(app)
    ma.init_app(app)

    # Register blueprints
    app.register_blueprint(tasks_bp, url_prefix='/api')

    return app 