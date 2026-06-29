import os
import re

ROUTES_DIR = 'server/app/modules'

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace import RoleChecker with PermissionChecker
    content = re.sub(r'\bRoleChecker\b', 'PermissionChecker', content)

    # Replace PermissionChecker(["super_admin"]) -> PermissionChecker("manage_settings")
    content = re.sub(r'PermissionChecker\(\s*\["super_admin"\]\s*\)', 'PermissionChecker("manage_settings")', content)
    
    # Replace PermissionChecker(["super_admin", "admin"]) -> PermissionChecker("manage_employees")
    content = re.sub(r'PermissionChecker\(\s*\["super_admin",\s*"admin"\]\s*\)', 'PermissionChecker("manage_employees")', content)
    content = re.sub(r'PermissionChecker\(\s*\["admin",\s*"super_admin"\]\s*\)', 'PermissionChecker("manage_employees")', content)
    
    # Replace PermissionChecker(["manager", "admin", "super_admin"]) -> PermissionChecker("manage_leaves")
    content = re.sub(r'PermissionChecker\(\s*\["manager",\s*"admin",\s*"super_admin"\]\s*\)', 'PermissionChecker("manage_leaves")', content)
    
    # Replace PermissionChecker(["super_admin", "admin", "manager", "employee"]) -> PermissionChecker("view_reports") or something. This is a generic endpoint?
    content = re.sub(r'PermissionChecker\(\s*\["super_admin",\s*"admin",\s*"manager",\s*"employee"\]\s*\)', 'PermissionChecker("view_basic_info")', content)
    
    # Replace inline checks like: is_admin = current_user.role in ["admin", "super_admin"]
    content = re.sub(r'is_admin\s*=\s*current_user\.role\s*in\s*\["admin",\s*"super_admin"\]', 
                     'is_admin = "manage_everything" in getattr(current_user, "permissions", []) or "manage_employees" in getattr(current_user, "permissions", [])', content)
                     
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {filepath}")


for root, dirs, files in os.walk(ROUTES_DIR):
    for file in files:
        if file.endswith('routes.py') or file.endswith('services.py'):
            replace_in_file(os.path.join(root, file))

print("All replacements done!")
