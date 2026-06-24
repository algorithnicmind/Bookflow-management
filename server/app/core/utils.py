from datetime import date

def get_calendar_days(start_date: date, end_date: date) -> int:
    """
    Calculate the number of inclusive calendar days between start_date and end_date.
    This does not exclude weekends.
    """
    return (end_date - start_date).days + 1
