from passlib.context import CryptContext

# Single shared password hashing context — used across auth and employee routes
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_business_days(start_date, end_date):
    """Calculate the number of days for a leave request (inclusive).
    
    Note: This is a simplified calculation that counts all calendar days.
    For a more accurate calculation, consider excluding weekends and
    public holidays using a library like `numpy.busday_count`.
    """
    return (end_date - start_date).days + 1
