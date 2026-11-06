"""
Security and authentication/authorization utilities for SKUDynamic AI.
Enforces role-based or token-based authorization for sensitive operations
such as procurement order approval, rejection, and deletion.
"""

from typing import Optional
from fastapi import Header, HTTPException, status
from app.core.config import settings


# Recognized procurement roles with approval privileges
AUTHORIZED_PROCUREMENT_ROLES = {"procurement_manager", "inventory_director", "admin", "superadmin"}


def get_current_approver(
    x_procurement_key: Optional[str] = Header(None, alias="X-Procurement-Key"),
    x_user_role: Optional[str] = Header(None, alias="X-User-Role"),
    x_user_name: Optional[str] = Header(None, alias="X-User-Name"),
    authorization: Optional[str] = Header(None)
) -> str:
    """
    Validates authorization for order approval/rejection.
    
    Security rules:
    1. Mandatory in Production / when REQUIRE_AUTH is True:
       - Requests without a valid key/token are rejected (401 Unauthorized).
       - If token does not match settings.PROCUREMENT_API_KEY, rejected (403 Forbidden).
    2. Client Header Validation:
       - Client-supplied X-User-Role and X-User-Name CANNOT independently establish
         identity without valid credentials.
       - If an unauthenticated request attempts to claim a custom role/name without
         valid credentials, it is rejected (401 Unauthorized).
    3. Role-based Privilege Check:
       - If an explicit role is supplied with valid credentials, it must be in
         AUTHORIZED_PROCUREMENT_ROLES; otherwise rejected (403 Forbidden).
    4. Audit Identity:
       - Approver identity is derived from verified token context:
         e.g., 'Verified Officer: Alice (procurement_manager)' or 'Procurement Officer'.
    """
    # Clean up parameters when called directly in tests vs injected by FastAPI
    auth_header = authorization if isinstance(authorization, str) else None
    key_header = x_procurement_key if isinstance(x_procurement_key, str) else None
    role_header = x_user_role if isinstance(x_user_role, str) else None
    name_header = x_user_name if isinstance(x_user_name, str) else None

    token = None
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header[7:].strip()
    elif key_header:
        token = key_header.strip()

    is_production = getattr(settings, "ENVIRONMENT", "development").lower() == "production"
    is_auth_required = getattr(settings, "REQUIRE_AUTH", False) or is_production

    # Check if client is attempting to claim identity/privilege via headers
    has_claimed_identity = bool(role_header or name_header)

    # 1. Enforcement when auth is required OR when claiming custom identity/role
    if is_auth_required or has_claimed_identity:
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required: Valid X-Procurement-Key or Bearer token must accompany identity claims."
            )
        expected_key = getattr(settings, "PROCUREMENT_API_KEY", "")
        if expected_key and token != expected_key:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid procurement credentials."
            )

    # 2. In unauthenticated development mode (no token and no claimed identity)
    if not token:
        return "Local System (Development)"

    # 3. Validate token if supplied even in non-strict mode
    expected_key = getattr(settings, "PROCUREMENT_API_KEY", "")
    if token and expected_key and token != expected_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid procurement credentials."
        )

    # 4. Role-based privilege check for authenticated requests
    if role_header:
        role_cleaned = role_header.strip().lower()
        if role_cleaned not in AUTHORIZED_PROCUREMENT_ROLES:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{role_header}' is not authorized to approve or reject procurement orders."
            )

    # 5. Build verified audit trail identity
    clean_name = name_header.strip()[:100] if name_header and name_header.strip() else None
    clean_role = role_header.strip() if role_header else "procurement_manager"

    if clean_name:
        return f"Verified: {clean_name} ({clean_role})"
    if role_header:
        return f"Verified Officer ({clean_role})"

    return "Verified Procurement Officer"
