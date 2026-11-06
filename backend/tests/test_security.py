"""
Security tests for Procurement Order Approval/Rejection authorization.
Verifies that:
- Client-supplied X-User-Role and X-User-Name cannot independently establish identity without credentials (401).
- Unauthorized roles are blocked (403 Forbidden).
- Authentication requirements are enforced in production or when configured (401/403).
- Valid procurement credentials record verified identity in audit logs.
- Bearer token authentication works as expected.
"""

import pytest
from unittest.mock import patch
from fastapi import HTTPException
from app.core.security import (
    get_current_approver,
    AUTHORIZED_PROCUREMENT_ROLES
)
from app.core.config import settings


class TestSecurityAuthorization:
    def test_client_headers_cannot_independently_claim_identity_without_key(self):
        # Attempting to supply role or name without credentials must be rejected
        with pytest.raises(HTTPException) as exc_info:
            get_current_approver(x_user_role="procurement_manager")
        assert exc_info.value.status_code == 401
        assert "Authentication required" in exc_info.value.detail

        with pytest.raises(HTTPException) as exc_info:
            get_current_approver(x_user_name="Mallory")
        assert exc_info.value.status_code == 401

    def test_unauthorized_role_rejected_with_403(self):
        with patch.object(settings, "PROCUREMENT_API_KEY", "valid-key-123"):
            with pytest.raises(HTTPException) as exc_info:
                get_current_approver(
                    x_procurement_key="valid-key-123",
                    x_user_role="intern"
                )
            assert exc_info.value.status_code == 403
            assert "not authorized" in exc_info.value.detail

    def test_authorized_roles_accepted_with_valid_key(self):
        with patch.object(settings, "PROCUREMENT_API_KEY", "valid-key-123"):
            for role in AUTHORIZED_PROCUREMENT_ROLES:
                approver = get_current_approver(
                    x_procurement_key="valid-key-123",
                    x_user_role=role
                )
                assert role in approver
                assert "Verified" in approver

    def test_verified_user_name_sanitized_and_recorded(self):
        with patch.object(settings, "PROCUREMENT_API_KEY", "valid-key-123"):
            approver = get_current_approver(
                x_procurement_key="valid-key-123",
                x_user_role="procurement_manager",
                x_user_name="Alice Smith"
            )
            assert "Verified: Alice Smith (procurement_manager)" in approver

    def test_require_auth_rejects_missing_credentials(self):
        with patch.object(settings, "REQUIRE_AUTH", True):
            with pytest.raises(HTTPException) as exc_info:
                get_current_approver()
            assert exc_info.value.status_code == 401
            assert "Authentication required" in exc_info.value.detail

    def test_production_mode_enforces_credentials(self):
        with patch.object(settings, "ENVIRONMENT", "production"):
            with pytest.raises(HTTPException) as exc_info:
                get_current_approver()
            assert exc_info.value.status_code == 401

    def test_wrong_key_rejects_with_403(self):
        with patch.object(settings, "PROCUREMENT_API_KEY", "secret-token-12345"):
            with pytest.raises(HTTPException) as exc_info:
                get_current_approver(x_procurement_key="wrong-key")
            assert exc_info.value.status_code == 403
            assert "Invalid procurement credentials" in exc_info.value.detail

    def test_bearer_token_supported(self):
        with patch.object(settings, "PROCUREMENT_API_KEY", "jwt-procurement-key"):
            approver = get_current_approver(
                authorization="Bearer jwt-procurement-key",
                x_user_role="procurement_manager"
            )
            assert "Verified" in approver
            assert "procurement_manager" in approver

    def test_development_mode_default_identity(self):
        with patch.object(settings, "ENVIRONMENT", "development"):
            with patch.object(settings, "REQUIRE_AUTH", False):
                approver = get_current_approver()
                assert approver == "Local System (Development)"
