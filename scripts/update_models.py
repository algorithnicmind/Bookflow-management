import os
import re

app_dir = r'C:\Users\ankit\OneDrive\Documents\GitHub\Leaveflow-management\server\app\modules'

for root, dirs, files in os.walk(app_dir):
    for file in files:
        if file == 'models.py':
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()

            if 'tenants' in path:
                continue

            # Add ForeignKey import if not there
            if 'ForeignKey' not in content and 'Column' in content:
                content = content.replace('from sqlalchemy import Column', 'from sqlalchemy import Column, ForeignKey')

            def replacer(match):
                table_line = match.group(0)
                # Check if tenant_id is already in this block (we do a simple global check for the file first)
                if 'tenant_id = Column' in content: 
                    return table_line
                return table_line + '\n    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)'
                
            new_content = re.sub(r'__tablename__\s*=\s*\"[^\"]+\"', replacer, content)

            if new_content != content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f'Updated {path}')

print('Done updating models')
