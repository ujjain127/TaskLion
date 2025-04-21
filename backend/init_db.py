from app import app
from extensions import db
from models.task import Task
import os
from dotenv import load_dotenv

def init_db():
    # Load environment variables
    load_dotenv()
    
    print("Initializing database...")
    print(f"Using database URL: {os.getenv('DATABASE_URL', 'sqlite:///tasklion.db')}")
    
    try:
        with app.app_context():
            # Create all tables
            db.create_all()
            print("Database tables created successfully")
            
            # Verify tables were created
            tables = db.engine.table_names()
            print(f"Created tables: {', '.join(tables)}")
            
    except Exception as e:
        print(f"Error initializing database: {str(e)}")
        raise

if __name__ == "__main__":
    init_db() 