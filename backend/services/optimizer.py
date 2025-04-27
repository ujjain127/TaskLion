import numpy as np
from datetime import datetime
from services.task_analyzer import analyze_task_importance

def lion_optimization(tasks, num_lions=10, iterations=50):
    if not tasks:
        return []
    
    print(f"\nStarting optimization with {len(tasks)} tasks")
    
    # First, get task analysis for each task using our built-in analyzer
    for task in tasks:
        try:
            # Only analyze if we haven't already
            if task.importance_score is None:
                importance_score, explanation = analyze_task_importance(task)
                task.importance_score = importance_score
                task.importance_explanation = explanation
                print(f"\nTask: {task.title}")
                print(f"Importance Score: {importance_score:.2f}")
                print(f"Explanation: {explanation}")
        except Exception as e:
            print(f"Error analyzing task '{task.title}': {str(e)}")
            # Use default values if analysis fails
            task.importance_score = 0.5
            task.importance_explanation = "Could not analyze importance"
    
    # Parameters for the algorithm
    num_tasks = len(tasks)
    
    # Initialize lion positions (task priorities)
    lions = np.random.rand(num_lions, num_tasks) * 0.5 + 0.25  # Initialize in middle range
    best_lion = None
    best_fitness = float('-inf')
    
    # Fitness function considering deadline, creation time, and task importance
    def calculate_fitness(priorities):
        fitness = 0
        
        # Calculate weights for each task
        weights = []
        for i, task in enumerate(tasks):
            deadline_weight = 0.5  # Base weight for tasks without deadline
            if task.deadline:
                time_until_deadline = (task.deadline - datetime.utcnow()).total_seconds()
                days_until_deadline = time_until_deadline / 86400  # Convert to days
                
                # Handle overdue tasks
                if days_until_deadline < 0:
                    deadline_weight = 1.0  # Highest priority for overdue tasks
                    print(f"Task '{task.title}' is overdue by {abs(days_until_deadline):.1f} days")
                # Handle upcoming deadlines
                else:
                    if days_until_deadline <= 1:  # Due within 24 hours
                        deadline_weight = 1.0
                        print(f"Task '{task.title}' is due within 24 hours")
                    elif days_until_deadline <= 3:  # Due within 3 days
                        deadline_weight = 0.9
                        print(f"Task '{task.title}' is due within 3 days")
                    elif days_until_deadline <= 7:  # Due within a week
                        deadline_weight = 0.75
                        print(f"Task '{task.title}' is due within a week")
                    elif days_until_deadline <= 14:  # Due within 2 weeks
                        deadline_weight = 0.6
                        print(f"Task '{task.title}' is due within 2 weeks")
                    else:
                        deadline_weight = 0.5
                        print(f"Task '{task.title}' is due in {days_until_deadline:.1f} days")
            
            age_in_days = (datetime.utcnow() - task.created_at).total_seconds() / 86400
            creation_weight = min(0.5, age_in_days / 14)  # Max weight after 2 weeks
            
            # Use the analyzed importance score
            importance_weight = task.importance_score if task.importance_score is not None else 0.5
            
            # Combine all weights with adjusted importance
            total_weight = (
                deadline_weight * 0.5 +      # 50% weight to deadlines (most important)
                creation_weight * 0.2 +      # 20% weight to task age
                importance_weight * 0.3      # 30% weight to task importance
            )
            
            weights.append(total_weight)
            print(f"\nTask '{task.title}' weights:")
            print(f"- Deadline weight: {deadline_weight:.2f}")
            print(f"- Creation weight: {creation_weight:.2f}")
            print(f"- Importance weight: {importance_weight:.2f}")
            print(f"= Total weight: {total_weight:.2f}")
            
        # Normalize weights
        weights = np.array(weights)
        weights = weights / np.max(weights) if np.max(weights) > 0 else weights
        
        # Calculate priority distribution penalty
        # We want roughly 20% high, 40% medium, 40% low priority
        num_high = np.sum(priorities > 0.7)
        num_medium = np.sum((priorities > 0.4) & (priorities <= 0.7))
        num_low = np.sum(priorities <= 0.4)
        
        target_high = 0.2 * num_tasks
        target_medium = 0.4 * num_tasks
        target_low = 0.4 * num_tasks
        
        distribution_penalty = (
            abs(num_high - target_high) +
            abs(num_medium - target_medium) +
            abs(num_low - target_low)
        ) / num_tasks
        
        # Calculate weighted priority fitness
        priority_fitness = np.sum(priorities * weights)
        
        # Combine fitness components
        fitness = priority_fitness - distribution_penalty
        
        print(f"\nFitness calculation:")
        print(f"Priority fitness: {priority_fitness:.2f}")
        print(f"Distribution penalty: {distribution_penalty:.2f}")
        print(f"Final fitness: {fitness:.2f}")
        return fitness
    
    # Main optimization loop
    for iteration in range(iterations):
        print(f"\nIteration {iteration + 1}/{iterations}")
        # Update each lion's position
        for i in range(num_lions):
            # Random walk with smaller step size
            lions[i] += np.random.normal(0, 0.05, num_tasks)
            lions[i] = np.clip(lions[i], 0, 1)
            
            # Calculate fitness
            current_fitness = calculate_fitness(lions[i])
            
            if current_fitness > best_fitness:
                best_fitness = current_fitness
                best_lion = lions[i].copy()
                print(f"New best fitness: {best_fitness:.2f}")
    
    if best_lion is None:
        print("\nWarning: No best lion found, returning balanced priorities")
        # Return a balanced distribution instead of all ones
        return np.array([0.3 if i < num_tasks * 0.4 else
                        0.6 if i < num_tasks * 0.8 else
                        0.9 for i in range(num_tasks)])
        
    print(f"\nFinal best fitness: {best_fitness:.2f}")
    return best_lion