import asyncio
import os
import httpx
from dotenv import load_dotenv

# Load environment variables directly from the .env file in the backend folder
load_dotenv()

# Fetch configs just like llm_service.py
LLAMA_BASE_URL = os.getenv("LLAMA_BASE_URL")
LLAMA_MODEL = os.getenv("LLAMA_MODEL")
raw_ssl = os.getenv("LLAMA_VERIFY_SSL", "true")
verify_ssl = raw_ssl.lower() in ("true", "1", "yes", "t")

async def main():
    if not LLAMA_BASE_URL:
        print("ERROR: LLAMA_BASE_URL is not set in .env")
        return

    endpoint = f"{LLAMA_BASE_URL}/generate"
    print(f"--> Target Endpoint: {endpoint}")
    print(f"--> Target Model: {LLAMA_MODEL}")
    print(f"--> Verify SSL: {verify_ssl} (from raw str: '{raw_ssl}')\n")

    payload = {
        "model": LLAMA_MODEL,
        "prompt": "You are a highly intelligent AI. Reply with the single word 'SUCCESS' if you read this.",
        "stream": False,
        "options": {
            "temperature": 0.1
        }
    }

    try:
        async with httpx.AsyncClient(timeout=60.0, verify=verify_ssl) as client:
            print("Sending request... (waiting for response)")
            response = await client.post(endpoint, json=payload)
            
            print("\n" + "="*40)
            print(f"STATUS CODE: {response.status_code}")
            print("="*40)
            
            try:
                data = response.json()
                print("\n[RAW JSON RESPONSE]:")
                print(data)
                
                # Try to extract text based on common patterns
                text = data.get("response") or data.get("generated_text") or data.get("text")
                if text:
                    print(f"\n[EXTRACTED TEXT]:\n{text}")
                else:
                    print("\n[WARNING]: Could not auto-extract text! 'response' key missing?")
                    
            except Exception:
                print("\n[RAW TEXT RESPONSE (Not JSON)]:")
                print(response.text)

            response.raise_for_status()

    except httpx.ConnectError as e:
        print(f"\n[CONNECTION ERROR]: Could not reach {endpoint}")
        print(f"Details: {e}")
    except httpx.HTTPStatusError as e:
        print(f"\n[HTTP ERROR]: The server returned a bad status code.")
        print(f"Details: {e}")
    except Exception as e:
        print(f"\n[UNKNOWN ERROR]: {e}")

if __name__ == "__main__":
    asyncio.run(main())
