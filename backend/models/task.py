from datetime import datetime
from extensions import db

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    deadline = db.Column(db.DateTime)
    priority = db.Column(db.String(10), default='medium')
    completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    importance_score = db.Column(db.Float)  # Gemini's importance score
    importance_explanation = db.Column(db.Text)  # Gemini's explanation 