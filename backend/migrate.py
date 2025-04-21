from extensions import db
from app import create_app

def migrate():
    app = create_app()
    with app.app_context():
        # Drop existing tables
        db.drop_all()
        # Create new tables with updated schema
        db.create_all()
        print("Database schema updated successfully!")

if __name__ == '__main__':
    migrate() 