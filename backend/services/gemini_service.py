import os
from datetime import datetime
from dotenv import load_dotenv
import google.generativeai as genai
import requests

# Load environment variables
load_dotenv()

def analyze_task_importance(task):
    """
    Analyze task importance using Gemini API
    Returns a tuple of (importance_score, explanation)
    """
    try:
        print("\n=== Starting Gemini Analysis ===")
        
        # Check if API key is configured
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            print("❌ Error: GEMINI_API_KEY not found in environment variables")
            return 0.5, "API key not configured"

        print(f"✓ API Key found: {api_key[:5]}...")
        
        # Configure the Gemini API
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        
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

        print(f"\n📝 Analyzing task: {task.title}")
        print(f"📝 Description: {task.description or 'No description'}")
        print(f"📅 Deadline: {deadline_str}")
        print(f"📋 Prompt:\n{prompt}")
        
        # Generate response using Gemini
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.1,
                top_k=1,
                top_p=1,
                max_output_tokens=100,
            )
        )
        
        # Extract response text
        response_text = response.text.strip()
        print(f"📝 Raw response: {response_text}")
        
        if '|' not in response_text:
            print("❌ Error: Invalid response format - no delimiter found")
            print(f"Received: {response_text}")
            return 0.5, "Invalid AI response format"
            
        score_str, explanation = response_text.split('|', 1)
        score_str = score_str.strip()
        explanation = explanation.strip()
        
        try:
            importance_score = float(score_str)
            if not (0 <= importance_score <= 1):
                print(f"❌ Error: Score out of range: {importance_score}")
                return 0.5, "Invalid importance score"
        except ValueError:
            print(f"❌ Error: Could not convert score to float: {score_str}")
            return 0.5, "Invalid importance score format"
        
        print(f"\n✅ Analysis complete:")
        print(f"Score: {importance_score:.2f}")
        print(f"Explanation: {explanation}")
        print("=== End Gemini Analysis ===\n")
        
        return importance_score, explanation
            
    except Exception as e:
        print(f"\n❌ Error in analyze_task_importance: {str(e)}")
        import traceback
        print(f"Traceback:\n{traceback.format_exc()}")
        return 0.5, f"Error analyzing task: {str(e)}"

def analyze_task(task):
    api_key = os.getenv('GEMINI_API_KEY')
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    headers = {
        'Content-Type': 'application/json',
        'x-goog-api-key': api_key
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
        return None 
