from flask import Blueprint, request, jsonify
from datetime import datetime
from models.task import Task
from extensions import db
from schemas.task import task_schema, tasks_schema
from services.optimizer import lion_optimization
from services.task_analyzer import analyze_task_importance

tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route('/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.all()
    return jsonify(tasks_schema.dump(tasks))

@tasks_bp.route('/tasks', methods=['POST'])
def create_task():
    try:
        data = request.json
        deadline = None
        if data.get('deadline'):
            try:
                deadline = datetime.fromisoformat(data['deadline'].replace('Z', '+00:00'))
            except ValueError:
                return jsonify({'error': 'Invalid deadline format'}), 400

        new_task = Task(
            title=data['title'],
            description=data.get('description', ''),
            deadline=deadline,
            priority=data.get('priority', 'medium'),
            completed=data.get('completed', False)
        )
        
        # Analyze the task importance immediately on creation
        try:
            importance_score, explanation = analyze_task_importance(new_task)
            new_task.importance_score = importance_score
            new_task.importance_explanation = explanation
        except Exception as e:
            print(f"Error analyzing new task: {str(e)}")
        
        db.session.add(new_task)
        db.session.commit()
        return task_schema.jsonify(new_task)
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@tasks_bp.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    try:
        task = Task.query.get_or_404(task_id)
        data = request.json
        content_changed = False
        
        if 'title' in data:
            if task.title != data['title']:
                task.title = data['title']
                content_changed = True
                
        if 'description' in data:
            if task.description != data['description']:
                task.description = data['description']
                content_changed = True
                
        if 'completed' in data:
            task.completed = data['completed']
            
        if 'priority' in data:
            task.priority = data['priority']
            
        if 'deadline' in data:
            new_deadline = datetime.fromisoformat(data['deadline'].replace('Z', '+00:00')) if data['deadline'] else None
            if task.deadline != new_deadline:
                task.deadline = new_deadline
                content_changed = True
        
        # Re-analyze importance if the task content has changed
        if content_changed:
            try:
                importance_score, explanation = analyze_task_importance(task)
                task.importance_score = importance_score
                task.importance_explanation = explanation
            except Exception as e:
                print(f"Error re-analyzing task: {str(e)}")
        
        db.session.commit()
        return task_schema.jsonify(task)
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@tasks_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    try:
        task = Task.query.get_or_404(task_id)
        db.session.delete(task)
        db.session.commit()
        return jsonify({'message': 'Task deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@tasks_bp.route('/tasks/optimize', methods=['POST'])
def optimize_tasks():
    try:
        tasks = Task.query.filter_by(completed=False).all()
        if not tasks:
            return jsonify({'message': 'No pending tasks to optimize'})
        
        # Run Lion Optimization Algorithm
        priorities = lion_optimization(tasks)
        print(f"Calculated priorities: {priorities}")  # Debug log
        
        # Map numerical priorities to string-based priorities
        priority_mapping = {
            (0.0, 0.4): 'low',
            (0.4, 0.7): 'medium',
            (0.7, 1.0): 'high'
        }
        
        # Update task priorities
        for task, priority_value in zip(tasks, priorities):
            print(f"Task '{task.title}' priority value: {priority_value}")  # Debug log
            for (lower, upper), priority_str in priority_mapping.items():
                if lower <= priority_value <= upper:
                    print(f"Setting task '{task.title}' to priority: {priority_str}")  # Debug log
                    task.priority = priority_str
                    break
        
        db.session.commit()
        return jsonify(tasks_schema.dump(tasks))
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@tasks_bp.route('/tasks/<int:task_id>/analyze', methods=['GET'])
def analyze_task(task_id):
    """Analyze a specific task and return its importance"""
    try:
        task = Task.query.get_or_404(task_id)
        
        # Analyze the task
        importance_score, explanation = analyze_task_importance(task)
        
        # Update the task in the database
        task.importance_score = importance_score
        task.importance_explanation = explanation
        db.session.commit()
        
        # Determine importance category for better UI display
        importance_category = 'medium'
        if importance_score >= 0.7:
            importance_category = 'high'
        elif importance_score <= 0.4:
            importance_category = 'low'
            
        # Create visual indicators
        importance_percentage = int(importance_score * 100)
        
        # Generate actionable insights based on the score
        insights = []
        if importance_score >= 0.7:
            insights.append("Consider prioritizing this task above others")
        if task.deadline and (task.deadline - datetime.utcnow()).total_seconds() < 86400 * 3:  # 3 days
            insights.append("Task deadline is approaching soon")
        if importance_score <= 0.3:
            insights.append("This task could potentially be delegated or scheduled for later")
        
        # Return the enhanced analysis results
        return jsonify({
            'task_id': task.id,
            'title': task.title,
            'importance_score': importance_score,
            'importance_percentage': importance_percentage,
            'importance_category': importance_category,
            'explanation': explanation,
            'insights': insights,
            'analysis_time': datetime.utcnow().isoformat()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400