from models.task import Task
from extensions import ma
from marshmallow import fields, validates, ValidationError, post_load

class TaskSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Task
        load_instance = True

    id = fields.Int(dump_only=True)
    title = fields.Str(required=True)
    description = fields.Str(allow_none=True)
    deadline = fields.DateTime(allow_none=True)
    priority = fields.Str(required=True)
    completed = fields.Bool()  # Remove default here
    created_at = fields.DateTime(dump_only=True)
    importance_score = fields.Float(dump_only=True)
    importance_explanation = fields.Str(dump_only=True)

    @validates('priority')
    def validate_priority(self, value):
        valid_priorities = ['low', 'medium', 'high']
        if value.lower() not in valid_priorities:
            raise ValidationError(f"Priority must be one of: {', '.join(valid_priorities)}")

    @validates('title')
    def validate_title(self, value):
        if not value or len(value.strip()) == 0:
            raise ValidationError("Title cannot be empty")
        if len(value) > 200:
            raise ValidationError("Title cannot be longer than 200 characters")

    @post_load
    def set_defaults(self, data, **kwargs):
        """Set default values after loading"""
        if 'completed' not in data:
            data['completed'] = False
        if 'description' not in data:
            data['description'] = ''
        return data

task_schema = TaskSchema()
tasks_schema = TaskSchema(many=True) 