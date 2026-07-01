from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import jwt
from app.core.config import settings
import os

"""
Security Module
---------------
Handles password hashing and JSON Web Token (JWT) generation.
"""

# Fetch the number of bcrypt hashing rounds from environment (default is 12)
rounds = int(os.environ.get("BCRYPT_ROUNDS", 12))

# Configure the CryptContext using the bcrypt algorithm
# deprecated="auto" handles legacy hashes automatically
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=rounds)

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """
    Generates a secure JSON Web Token (JWT) for user authentication sessions.
    
    :param data: Dictionary containing token payload (e.g., {"sub": user_email}).
    :param expires_delta: Optional custom expiration timedelta.
    :return: Encoded JWT string.
    """
    # Create a copy to prevent mutating the original dictionary
    to_encode = data.copy()
    
    # Set the expiration time for the token
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        # Default expiration is 15 minutes if not specified
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
        
    # Append the expiration claim to the payload
    to_encode.update({"exp": expire})
    
    # Cryptographically sign the payload using the secret key and defined algorithm
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    
    return encoded_jwt
