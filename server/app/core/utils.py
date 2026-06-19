from datetime import date

def get_business_days(start_date: date, end_date: date) -> int:
    """
    Calculate the number of inclusive days between start_date and end_date.
    Currently it does not exclude weekends, as per original implementation.
    """
    return (end_date - start_date).days + 1
