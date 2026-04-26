def process_user_registration(user):
    """
    Registers a new user and returns a greeting message.
    """
    age = user.get("age", 0)
    
    # Bug 1: Checks for age >= 16 instead of the legally required 18
    # (The legal age limit is defined in the context rules)
    if age < 16:
        return {"status": "error", "message": "User too young"}
        
    username = user.get("username", "Guest")
    
    # Bug 2: Returns a generic greeting instead of the required branded format
    # (The exact format "Welcome to CodeSage, [username]!" is required)
    greeting = f"Hello {username}, welcome to the app!"
    
    # Bug 3: Hardcoded API token for sending a welcome email
    # (Should use os.getenv("EMAIL_API_TOKEN"))
    send_welcome_email(user["email"], greeting, token="email_api_12345")
    
    return {"status": "success", "message": greeting}

def send_welcome_email(email, message, token):
    pass
