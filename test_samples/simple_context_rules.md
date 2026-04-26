# CodeSage User Registration Rules

All API endpoints that handle user registration must adhere to the following business and security rules:

## 1. Age Restriction
Users **must be 18 years or older** to register for our platform due to data privacy laws. Any registration request for a user under 18 must be rejected.

## 2. Branded Greeting
We want a consistent experience across all our services. When a user registers successfully, the greeting message MUST be exactly:
`Welcome to CodeSage, [username]!`
Do not use generic "Hello" or "Hi" messages.

## 3. Secret Management
Never hardcode API tokens or secrets in the source code. For sending emails, the application must read the token from the environment variable `EMAIL_API_TOKEN`.
