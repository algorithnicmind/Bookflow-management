"""
Integration tests for GET /api/reports/organization
"""

import pytest
from httpx import AsyncClient
from conftest import auth_headers


@pytest.mark.asyncio
async def test_org_report_super_admin(client: AsyncClient, super_admin, super_admin_token, seeded_db):
    """Super admin should see org-wide report."""
    response = await client.get(
        "/api/reports/organization",
        headers=auth_headers(super_admin_token),
    )
    assert response.status_code == 200
    data = response.json()
    assert "org_stats" in data


@pytest.mark.asyncio
async def test_org_report_admin_forbidden(client: AsyncClient, admin_user, admin_token):
    """Admin should not access org reports."""
    response = await client.get(
        "/api/reports/organization",
        headers=auth_headers(admin_token),
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_org_report_employee_forbidden(client: AsyncClient, employee_user, employee_token):
    """Employee should not access org reports."""
    response = await client.get(
        "/api/reports/organization",
        headers=auth_headers(employee_token),
    )
    assert response.status_code == 403
