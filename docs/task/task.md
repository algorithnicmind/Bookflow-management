# SaaS Tenant Management & Dynamic RBAC - Task Details

## 1. Project Details & Feature Requirements
This project focuses on building an advanced Tenant/Organization Management Portal specifically designed for the Platform Owner. The core features to be implemented include:
- **Organization Profile Management:** Create, edit, and manage basic profile details (Name, Domain).
- **Subscription Plans & Tiered Access:** Assign subscription plans (e.g., Starter, Pro, Enterprise) to dictate organizational limits and access.
- **Granular Module Access (Feature Flags):** Manually toggle specific modules (like AI Chatbot, Slack Integrations, Advanced Analytics) on and off for specific organizations.
- **Custom RBAC (Role-Based Access Control) Setup:** Allow manual configuration of role permissions directly from the UI, moving away from hardcoded roles to a dynamic permissions matrix.
- **Credential Setup:** Form to set up initial super-admin credentials directly from the platform owner UI.
- **Tenant Status Management:** Ability to suspend or deactivate an organization's access with a single click.
- **"Login As" / Impersonation:** Securely log in as an organization's Super Admin for troubleshooting.
- **Usage & Quota Tracking:** Track employee limits and optionally allow the Platform Owner to manually override quotas.
- **Global Audit Logging:** Master audit logs for all administrative actions across the platform.

## 2. Implementation Tasks

### Backend Tasks (FastAPI & Database)
- [x] **Database Schema Updates:** Update the `Organization` table to include columns for `plan_tier`, `module_access` (JSON), `max_employees` (Integer), and `status`.
- [x] **Role Permissions Table:** Create a new `RolePermissions` table linking `organization_id`, `role_name`, and a JSON array of `permissions`.
- [x] **Tenant Management APIs:** Create endpoints for the Platform Owner to edit organization details, update plan tiers, toggle modules, change active status, and override quotas.
- [x] **Complete transition to Zero-Hardcoding Architecture:**
  - [x] Dynamic Roles (RolePermission implementation, RoleChecker logic)
  - [x] Dynamic Departments (Department model, CRUD API)
  - [x] Dynamic Leave Types (LeaveType model, is_paid logic, CRUD API)
  - [x] Remove DB Constraints (Dropped PostgreSQL CheckConstraints on role, leave_type, etc.)
- [x] **Dynamic RBAC Engine:** Create endpoints to fetch and update role permissions. Implement a dynamic `PermissionChecker` middleware to replace the hardcoded `RoleChecker`, ensuring that users only access routes they have explicit permissions for.
- [x] **Impersonation API:** Build a secure endpoint that generates a temporary login JWT for an organization's admin, accessible only by Platform Owners.

### Frontend Tasks (Next.js)
- [x] **Platform Owner Tenant Dashboard:** Build a detailed list view of all organizations.
- [x] **Tenant Settings Forms:** Inside a specific Tenant's view, build forms for the Platform Owner to edit the organization name, select pricing plans from a dropdown, toggle module access switches, suspend the account, and configure initial super-admin credentials.
- [x] **Impersonation & Actions:** Add a "Login As" button on the Tenant Details view that securely routes the Platform Owner into that tenant's view.
- [x] **Dynamic RBAC Matrix UI:** Build a grid/matrix interface where administrators can check/uncheck specific permission boxes for each role (e.g., granting the "Manager" role the ability to view organization reports).
