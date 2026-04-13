import json
from datetime import datetime, timedelta
import bcrypt
from jwcrypto import jwt, jwk
import os

JWE_SECRET_ENV = os.getenv("JWE_SECRET")

if JWE_SECRET_ENV:
    # k must be base64url encoded. For simplicity and if it's text, we can use k=base64url(secret)
    # the simplest way to allow any arbitrary text secret in env is to hash it or encode it
    # We will assume JWE_SECRET is a standard string, so we'll construct a JWK
    import base64
    k_bytes = JWE_SECRET_ENV.encode('utf-8')
    if len(k_bytes) < 32:
        k_bytes = k_bytes.ljust(32, b'0')
    else:
        k_bytes = k_bytes[:32]
    k_b64 = base64.urlsafe_b64encode(k_bytes).decode('utf-8').rstrip('=')
    key = jwk.JWK(kty='oct', k=k_b64)
else:
    # Development fallback
    key = jwk.JWK.generate(kty='oct', size=256)


def verify_password(plain_password, hashed_password):
    if not hashed_password:
        return False
    # bcrypt requires bytes
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except ValueError:
        return False

def get_password_hash(password):
    # Hash a password using bcrypt
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def create_jwe_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=1440) # 24 hours
    
    to_encode.update({"exp": int(expire.timestamp())})
    
    token = jwt.JWT(header={"alg": "A256KW", "enc": "A256CBC-HS512"},
                    claims=to_encode)
    token.make_encrypted_token(key)
    return token.serialize()

def decode_jwe_token(token: str):
    try:
        decoded = jwt.JWT(key=key, jwt=token, expected_type="JWE")
        claims = json.loads(decoded.claims)
        return claims
    except Exception as e:
        print("Error decoding token:", e)
        return None
