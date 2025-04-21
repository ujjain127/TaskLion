from flask import Blueprint, request, jsonify
from datetime import datetime
from models.task import Task
from extensions import db
from schemas.task import task_schema, tasks_schema
from services.optimizer import lion_optimization

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
        
        if 'title' in data:
            task.title = data['title']
        if 'description' in data:
            task.description = data['description']
        if 'completed' in data:
            task.completed = data['completed']
        if 'priority' in data:
            task.priority = data['priority']
        if 'deadline' in data:
            task.deadline = datetime.fromisoformat(data['deadline'].replace('Z', '+00:00')) if data['deadline'] else None
        
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