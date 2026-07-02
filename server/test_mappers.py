import logging
logging.basicConfig(level=logging.DEBUG)
from main import app
from sqlalchemy.orm import configure_mappers
configure_mappers()
print('Mappers configured successfully!')
