import os
from datetime import datetime
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

def analyze_task_importance(task):
    """
    Analyze task importance using Gemini API
    Returns a tuple of (importance_score, explanation)
    If Gemini API is unavailable, uses a fallback algorithm.
    """
    try:
        print("\n=== Starting Gemini Analysis ===")
        
        # Check if API key is configured
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            print("❌ Error: GEMINI_API_KEY not found in environment variables")
            return fallback_importance_analysis(task)

        print(f"✓ API Key found: {api_key[:5] if len(api_key) > 5 else ''}...")
        
        # Try the REST API approach directly (more reliable than the Python client)
        result = analyze_task_with_rest_api(task, api_key)
        if result:
            return result
        
        # If we reached here, the API call failed
        print("❌ Gemini API unavailable. Using fallback algorithm.")
        return fallback_importance_analysis(task)
            
    except Exception as e:
        print(f"\n❌ Error in analyze_task_importance: {str(e)}")
        import traceback
        print(f"Traceback:\n{traceback.format_exc()}")
        return fallback_importance_analysis(task)

def analyze_task_with_rest_api(task, api_key):
    """Use the REST API to analyze task importance"""
    try:
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
        headers = {
            'Content-Type': 'application/json',
        }
        
        # Add API key as query parameter
        url = f"{url}?key={api_key}"
        
        # Create the prompt for task analysis
        current_date = datetime.utcnow().strftime("%Y-%m-%d")
        deadline_str = task.deadline.strftime("%Y-%m-%d") if task.deadline else "No deadline"
        
        prompt = f"""Analyze this task's importance and respond with ONLY a number (0.0 to 1.0) and a brief explanation, separated by a | character.

Task: {task.title}
Description: {task.description or 'No description'}
Deadline: {deadline_str}
Current Date: {current_date}

Format: [number]|[explanation]
Example: 0.8|High priority due to upcoming deadline.
"""

        data = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "temperature": 0.1,
                "topK": 1,
                "topP": 1,
                "maxOutputTokens": 100,
            }
        }

        print(f"\n📝 Analyzing task: {task.title}")
        print(f"📝 Description: {task.description or 'No description'}")
        print(f"📅 Deadline: {deadline_str}")
        
        response = requests.post(url, headers=headers, json=data)
        if response.status_code == 200:
            try:
                response_json = response.json()
                # Extract the text from the response
                if 'candidates' in response_json and len(response_json['candidates']) > 0:
                    if 'content' in response_json['candidates'][0]:
                        content = response_json['candidates'][0]['content']
                        if 'parts' in content and len(content['parts']) > 0:
                            response_text = content['parts'][0]['text'].strip()
                            
                            print(f"📝 Raw response: {response_text}")
                            
                            if '|' not in response_text:
                                print("❌ Error: Invalid response format - no delimiter found")
                                return None
                                
                            score_str, explanation = response_text.split('|', 1)
                            score_str = score_str.strip()
                            explanation = explanation.strip()
                            
                            try:
                                importance_score = float(score_str)
                                if not (0 <= importance_score <= 1):
                                    print(f"❌ Error: Score out of range: {importance_score}")
                                    return None
                                
                                print(f"\n✅ Analysis complete:")
                                print(f"Score: {importance_score:.2f}")
                                print(f"Explanation: {explanation}")
                                print("=== End Gemini Analysis ===\n")
                                
                                return importance_score, explanation
                            except ValueError:
                                print(f"❌ Error: Could not convert score to float: {score_str}")
                                return None
            except Exception as e:
                print(f"❌ Error processing Gemini response: {str(e)}")
                return None
        else:
            print(f"❌ Error: API request failed with status code {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error calling Gemini REST API: {str(e)}")
        return None

def fallback_importance_analysis(task):
    """
    Fallback algorithm when Gemini is unavailable
    Uses deadline proximity and task complexity to determine importance
    """
    print("\n=== Using Fallback Task Analysis ===")
    
    # Start with a base score
    score = 0.5
    explanation = "Analyzed using fallback algorithm. "
    
    # Factor 1: Deadline proximity
    if task.deadline:
        time_until_deadline = (task.deadline - datetime.utcnow()).total_seconds()
        days_until_deadline = time_until_deadline / 86400  # Convert to days
        
        if days_until_deadline < 0:
            # Overdue tasks get high priority
            score += 0.3
            explanation += "Task is overdue. "
        elif days_until_deadline <= 1:
            # Due within 24 hours
            score += 0.25
            explanation += "Due within 24 hours. "
        elif days_until_deadline <= 3:
            # Due within 3 days
            score += 0.15
            explanation += "Due within 3 days. "
        elif days_until_deadline <= 7:
            # Due within a week
            score += 0.1
            explanation += "Due within a week. "
    else:
        explanation += "No deadline specified. "
    
    # Factor 2: Title length can indicate complexity
    if task.title:
        title_words = len(task.title.split())
        if title_words > 8:
            score += 0.05
            explanation += "Complex task title. "
    
    # Factor 3: Description length can indicate complexity/importance
    if task.description:
        desc_length = len(task.description)
        if desc_length > 200:
            score += 0.1
            explanation += "Detailed description suggests importance. "
        elif desc_length > 50:
            score += 0.05
            explanation += "Task has good description. "
    else:
        explanation += "No description provided. "
    
    # Cap the score between 0 and 1
    score = max(0, min(score, 1))
    
    print(f"Score: {score:.2f}")
    print(f"Explanation: {explanation}")
    print("=== End Fallback Analysis ===\n")
    
    return score, explanation

def analyze_task(task):
    """Legacy function - calls the newer implementation"""
    
    if hasattr(task, 'deadline'):
        # This is a Task object from the database
        score, explanation = analyze_task_importance(task)
        return {"score": score, "explanation": explanation}
    else:
        # This is a dictionary representation of a task
        api_key = os.getenv('GEMINI_API_KEY')
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
        
        if not api_key:
            return {"score": 0.5, "explanation": "API key not configured"}
            
        try:
            url = f"{url}?key={api_key}"
            headers = {
                'Content-Type': 'application/json',
            }
            data = {
                "contents": [{
                    "parts": [{
                        "text": f"Analyze this task: {task['title']}"
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.1,
                    "topK": 1,
                    "topP": 1,
                    "maxOutputTokens": 100,
                }
            }

            response = requests.post(url, headers=headers, json=data)
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Error: {response.status_code} - {response.text}")
                return {"score": 0.5, "explanation": f"Error analyzing task: {response.status_code}"}
        except Exception as e:
            print(f"Error: {str(e)}")
            return {"score": 0.5, "explanation": f"Error analyzing task: {str(e)}"}
