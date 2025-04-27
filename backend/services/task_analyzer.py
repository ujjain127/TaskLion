"""
TaskLion Built-in Task Analysis System
Analyzes task importance based on multiple factors without external API dependencies.
"""

from datetime import datetime, timedelta
import re


class TaskAnalyzer:
    """Task analysis system that evaluates task importance based on multiple factors"""

    def __init__(self):
        # Keywords that indicate high importance when found in title or description
        self.high_priority_keywords = [
            'urgent', 'important', 'critical', 'deadline', 'asap', 'emergency',
            'priority', 'crucial', 'vital', 'essential', 'immediate', 'due',
            'meeting', 'presentation', 'interview', 'exam', 'test', 'report',
            'review', 'submit', 'deliver', 'payment', 'tax', 'bill', 'assignment',
        ]
        
        # Keywords that may indicate medium importance
        self.medium_priority_keywords = [
            'finish', 'complete', 'update', 'prepare', 'organize', 'check',
            'review', 'send', 'contact', 'call', 'email', 'buy', 'purchase',
            'schedule', 'plan', 'draft', 'research', 'study', 'analyze',
        ]

    def analyze_task(self, task):
        """
        Analyze task importance and return a score between 0.0 and 1.0
        along with an explanation
        """
        factors = []
        explanations = []
        
        # Start with a base score
        base_score = 0.5
        factors.append(("Base score", base_score))
        
        # === FACTOR 1: DEADLINE PROXIMITY ===
        deadline_score, deadline_reason = self._analyze_deadline(task)
        if deadline_reason:
            factors.append(("Deadline", deadline_score))
            explanations.append(deadline_reason)
        
        # === FACTOR 2: TASK AGE ===
        age_score, age_reason = self._analyze_task_age(task)
        factors.append(("Task age", age_score))
        if age_reason:
            explanations.append(age_reason)
        
        # === FACTOR 3: KEYWORD ANALYSIS ===
        keyword_score, keyword_reason = self._analyze_keywords(task)
        if keyword_score != 0:
            factors.append(("Keywords", keyword_score))
            if keyword_reason:
                explanations.append(keyword_reason)
        
        # === FACTOR 4: TEXT LENGTH/COMPLEXITY ===
        complexity_score, complexity_reason = self._analyze_complexity(task)
        factors.append(("Complexity", complexity_score))
        if complexity_reason:
            explanations.append(complexity_reason)
        
        # Calculate weighted importance score
        weights = {
            "Base score": 0.2,
            "Deadline": 0.4,
            "Task age": 0.1,
            "Keywords": 0.2,
            "Complexity": 0.1,
        }
        
        weighted_sum = 0
        total_weight = 0
        
        for factor_name, factor_score in factors:
            if factor_name in weights:
                weight = weights[factor_name]
                weighted_sum += factor_score * weight
                total_weight += weight
        
        # Normalize the final score
        final_score = weighted_sum / total_weight if total_weight > 0 else 0.5
        
        # Ensure score is within bounds
        final_score = max(0.0, min(1.0, final_score))
        
        # Generate the final explanation
        if not explanations:
            explanation = "Standard priority task."
        else:
            explanation = " ".join(explanations)
        
        return final_score, explanation

    def _analyze_deadline(self, task):
        """Analyze deadline proximity and return a score adjustment and reason"""
        if not task.deadline:
            return 0, "No deadline specified."
        
        time_until_deadline = (task.deadline - datetime.utcnow()).total_seconds()
        days_until_deadline = time_until_deadline / 86400  # Convert to days
        
        # Overdue tasks
        if days_until_deadline < 0:
            days_overdue = abs(days_until_deadline)
            if days_overdue > 30:
                return 1.0, f"Task is significantly overdue by {int(days_overdue)} days."
            elif days_overdue > 14:
                return 0.95, f"Task is overdue by {int(days_overdue)} days."
            elif days_overdue > 7:
                return 0.9, f"Task is overdue by one week."
            elif days_overdue > 3:
                return 0.85, f"Task is overdue by several days."
            else:
                return 0.8, f"Task is recently overdue."
        
        # Upcoming deadlines
        if days_until_deadline <= 1:
            return 0.9, "Due within 24 hours."
        elif days_until_deadline <= 2:
            return 0.8, "Due within 2 days."
        elif days_until_deadline <= 3:
            return 0.7, "Due within 3 days."
        elif days_until_deadline <= 7:
            return 0.65, "Due within a week."
        elif days_until_deadline <= 14:
            return 0.55, "Due within two weeks."
        elif days_until_deadline <= 30:
            return 0.5, "Due within a month."
        else:
            return 0.4, "Due date is far in the future."

    def _analyze_task_age(self, task):
        """Analyze task age and return a score and reason"""
        age_in_days = (datetime.utcnow() - task.created_at).total_seconds() / 86400
        
        if age_in_days > 30:
            return 0.6, "Task has been pending for over a month."
        elif age_in_days > 14:
            return 0.55, "Task has been pending for over two weeks."
        elif age_in_days > 7:
            return 0.52, "Task has been pending for over a week."
        elif age_in_days > 3:
            return 0.51, None
        else:
            return 0.5, None  # No adjustment for new tasks

    def _analyze_keywords(self, task):
        """Analyze keywords in title and description"""
        text = f"{task.title} {task.description or ''}".lower()
        
        high_priority_matches = [word for word in self.high_priority_keywords if word in text]
        medium_priority_matches = [word for word in self.medium_priority_keywords if word in text]
        
        high_count = len(high_priority_matches)
        medium_count = len(medium_priority_matches)
        
        if high_count >= 3:
            return 0.3, f"Contains multiple priority indicators: {', '.join(high_priority_matches[:3])}."
        elif high_count >= 1:
            return 0.2, f"Contains priority indicators: {', '.join(high_priority_matches)}."
        elif medium_count >= 3:
            return 0.1, "Contains action-oriented language."
        elif medium_count >= 1:
            return 0.05, None
        else:
            return 0, None

    def _analyze_complexity(self, task):
        """Analyze task complexity based on title and description length"""
        title_length = len(task.title.split()) if task.title else 0
        
        if not task.description:
            if title_length > 10:
                return 0.1, "Complex task title."
            else:
                return 0, None
        
        desc_length = len(task.description)
        word_count = len(task.description.split())
        
        if desc_length > 500 or word_count > 100:
            return 0.2, "Very detailed description suggests significant task."
        elif desc_length > 200 or word_count > 40:
            return 0.15, "Detailed description suggests important task."
        elif desc_length > 100 or word_count > 20:
            return 0.1, "Good task description."
        elif desc_length > 0:
            return 0.05, None
        else:
            return 0, None


# Create a singleton instance
task_analyzer = TaskAnalyzer()


def analyze_task_importance(task):
    """
    Public function to analyze task importance
    Returns a tuple of (importance_score, explanation)
    """
    try:
        score, explanation = task_analyzer.analyze_task(task)
        
        print(f"\n=== Built-in Task Analysis ===")
        print(f"Task: {task.title}")
        print(f"Score: {score:.2f}")
        print(f"Explanation: {explanation}")
        print("=== End Analysis ===\n")
        
        return score, explanation
        
    except Exception as e:
        print(f"Error in built-in analysis: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return 0.5, "Error in analysis"