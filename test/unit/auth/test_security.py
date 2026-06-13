"""
Unit tests for app.core.security — JWT token creation and password hashing.
"""


from datetime import timedelta, datetime, timezone
from jose import jwt

from app.core.security import create_access_token, pwd_context
from app.core.config import settings


# ─── JWT Token Tests ──────────────────────────────────────────────────


def test_create_access_token_contains_email():
    """Token payload should contain the 'sub' (email) claim."""
    token = create_access_token(data={"sub": "john@company.com", "id": 1, "role": "employee"})
    payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    assert payload["sub"] == "john@company.com"


def test_create_access_token_contains_role():
    """Token payload should contain the 'role' claim."""
    token = create_access_token(data={"sub": "john@company.com", "id": 1, "role": "manager"})
    payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    assert payload["role"] == "manager"


def test_create_access_token_contains_id():
    """Token payload should contain the 'id' claim."""
    token = create_access_token(data={"sub": "john@company.com", "id": 42, "role": "employee"})
    payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    assert payload["id"] == 42


def test_create_access_token_has_expiration():
    """Token should have an 'exp' field in the future."""
    token = create_access_token(data={"sub": "john@company.com"})
    payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    assert "exp" in payload
    assert payload["exp"] > datetime.now(timezone.utc).timestamp() - 10


def test_create_access_token_custom_expiry():
    """Custom expires_delta should be respected."""
    token = create_access_token(
        data={"sub": "john@company.com"},
        expires_delta=timedelta(hours=2),
    )
    payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    expected = datetime.now(timezone.utc) + timedelta(hours=2)
    # Allow 10 second tolerance
    assert abs(payload["exp"] - expected.timestamp()) < 10


def test_create_access_token_default_expiry():
    """No expires_delta should default to 15 minutes."""
    token = create_access_token(data={"sub": "john@company.com"})
    payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    expected = datetime.now(timezone.utc) + timedelta(minutes=15)
    assert abs(payload["exp"] - expected.timestamp()) < 10


# ─── Password Hashing Tests ──────────────────────────────────────────


def test_password_hash_and_verify():
    """Hashed password should verify correctly."""
    plain = "password123"
    hashed = pwd_context.hash(plain)
    assert pwd_context.verify(plain, hashed) is True


def test_password_hash_wrong_password():
    """Wrong password should not verify."""
    hashed = pwd_context.hash("password123")
    assert pwd_context.verify("wrongpassword", hashed) is False


def test_password_hash_is_not_plaintext():
    """Hash should not equal the plain password."""
    plain = "password123"
    hashed = pwd_context.hash(plain)
    assert hashed != plain
    assert hashed.startswith("$2b$") or hashed.startswith("$2a$")
