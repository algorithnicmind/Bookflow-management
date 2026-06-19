import asyncio
import os
import sys
from datetime import datetime, timedelta

# Add current folder to Python path
sys.path.append(os.path.dirname(__file__))

# Import all models to ensure they are registered on Base.metadata
from app.modules.organizations.models import Organization, OnboardingApplication
from app.modules.employees.models import Employee
from app.modules.leaves.models import LeaveRequest, LeaveApproval, LeaveBalance
from app.modules.settings.models import SystemSetting
from app.modules.notifications.models import Notification
from app.modules.audit.models import AuditLog
from app.modules.contact.models import ContactMessage
from app.modules.accrual.models import AccrualLedger

from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal
from app.modules.employees.models import Employee
from app.modules.leaves.models import LeaveRequest
from app.modules.leaves.schemas import LeaveApplication
from app.modules.leaves.repositories import LeaveRepository
from app.modules.leaves.services import LeaveService

class MockRequest:
    def __init__(self, form_dict):
        self.form_dict = form_dict
        self.headers = {}

    async def form(self):
        class FormMock:
            def __init__(self, d):
                self.d = d
            def get(self, key):
                return self.d.get(key)
        return FormMock(self.form_dict)

    async def body(self):
        return b""

async def main():
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass # Fallback for older python versions without reconfigure

    async with AsyncSessionLocal() as db:
        # 1. Fetch John Doe and Alice Manager
        emp_res = await db.execute(select(Employee).where(Employee.email == "john@company.com"))
        john = emp_res.scalar_one_or_none()
        
        mgr_res = await db.execute(select(Employee).where(Employee.email == "alice@company.com"))
        alice = mgr_res.scalar_one_or_none()

        if not john or not alice:
            print("Demo users not found. Seeding database first...")
            from main import seed_demo_users
            await seed_demo_users()
            emp_res = await db.execute(select(Employee).where(Employee.email == "john@company.com"))
            john = emp_res.scalar_one_or_none()
            mgr_res = await db.execute(select(Employee).where(Employee.email == "alice@company.com"))
            alice = mgr_res.scalar_one_or_none()

        print(f"Employee: {john.name} (ID: {john.id})")
        print(f"Manager: {alice.name} (ID: {alice.id})")

        # 2. Apply a leave using LeaveService
        repo = LeaveRepository(db, john.organization_id)
        service = LeaveService(repo)

        # Delete any existing leave requests for testing clean run
        del_stmt = select(LeaveRequest).where(LeaveRequest.employee_id == john.id)
        pending_leaves = (await db.execute(del_stmt)).scalars().all()
        for pl in pending_leaves:
            await db.delete(pl)
        await db.commit()

        start_date = datetime.today().date() + timedelta(days=5)
        end_date = datetime.today().date() + timedelta(days=7)

        app_payload = LeaveApplication(
            leave_type="casual",
            start_date=start_date,
            end_date=end_date,
            reason="Testing Slack & Teams Integration"
        )

        print("\n--- Applying leave request ---")
        res = await service.apply_leave(john.id, app_payload)
        print("Apply Leave Response:", res)

        # Retrieve the newly created request
        req_res = await db.execute(
            select(LeaveRequest)
            .where(LeaveRequest.employee_id == john.id, LeaveRequest.status == "pending")
            .order_by(LeaveRequest.created_at.desc())
        )
        leave_req = req_res.scalars().first()
        print(f"Created Leave Request ID: {leave_req.id}, Status: {leave_req.status}")

        # 3. Simulate Slack Approve Callback Action
        print("\n--- Simulating Slack Approve Callback ---")
        from app.modules.integrations.routes import slack_actions

        slack_payload = {
            "type": "block_actions",
            "user": {"username": "alice_manager"},
            "actions": [
                {
                    "action_id": "approve_leave",
                    "value": str(leave_req.id)
                }
            ]
        }

        mock_req = MockRequest({"payload": json.dumps(slack_payload)})
        slack_res = await slack_actions(mock_req, db)
        print("Slack Callback Response:", slack_res)

        # Verify status in database
        await db.refresh(leave_req)
        print(f"Leave Status after Slack Approval: {leave_req.status}")
        assert leave_req.status == "approved", "Leave status should be approved"

        # 4. Apply another leave to test Reject action
        # First reset the previous one or cancel it
        leave_req.status = "cancelled"
        await db.commit()

        print("\n--- Applying second leave request for rejection test ---")
        res2 = await service.apply_leave(john.id, app_payload)
        req_res2 = await db.execute(
            select(LeaveRequest)
            .where(LeaveRequest.employee_id == john.id, LeaveRequest.status == "pending")
            .order_by(LeaveRequest.created_at.desc())
        )
        leave_req2 = req_res2.scalars().first()
        print(f"Created Leave Request ID: {leave_req2.id}, Status: {leave_req2.status}")

        # 5. Simulate Teams Reject Callback Action
        print("\n--- Simulating Teams Reject Callback ---")
        from app.modules.integrations.routes import teams_actions

        class MockTeamsRequest:
            def __init__(self, json_data):
                self.json_data = json_data
            async def json(self):
                return self.json_data

        teams_payload = {
            "action": {
                "verb": "reject_leave",
                "data": {"leave_id": str(leave_req2.id)},
                "user": {"displayName": "Alice Manager"}
            }
        }

        mock_teams_req = MockTeamsRequest(teams_payload)
        teams_res = await teams_actions(mock_teams_req, db)
        print("Teams Callback Response:", teams_res)

        # Verify status in database
        await db.refresh(leave_req2)
        print(f"Leave Status after Teams Rejection: {leave_req2.status}")
        assert leave_req2.status == "rejected", "Leave status should be rejected"

        print("\nAll integration test cases passed successfully!")

if __name__ == "__main__":
    import json
    asyncio.run(main())
