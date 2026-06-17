COMPANY_POLICIES = {
    "sick": (
        "Sick Leave Policy:\n"
        "- Employees receive 12 days of paid Sick Leave per calendar year.\n"
        "- Sick leave is intended for personal illness, medical appointments, or injury.\n"
        "- A medical certificate may be requested for sick leaves exceeding 3 consecutive days.\n"
        "- Unused sick leave does not carry forward to the next calendar year and cannot be encashed."
    ),
    "casual": (
        "Casual Leave Policy:\n"
        "- Employees receive 12 days of paid Casual Leave per calendar year.\n"
        "- Casual leave can be taken for personal matters, unexpected situations, or short vacations.\n"
        "- Prior approval from the direct manager is required, ideally at least 3 days in advance.\n"
        "- Unused casual leave expires at the end of the calendar year."
    ),
    "earned": (
        "Earned Leave (Privilege Leave) Policy:\n"
        "- Employees accrue 18 days of Earned Leave per calendar year (accrued at 1.5 days per month of service).\n"
        "- Earned leave must be planned and applied for at least 2 weeks in advance.\n"
        "- A maximum of 30 unused Earned Leave days can be carried forward to the next calendar year.\n"
        "- Accumulation beyond 30 days is subject to company rules and can be encashed under specific conditions."
    ),
    "maternity": (
        "Maternity Leave Policy:\n"
        "- Female employees are eligible for 182 days (26 weeks) of fully paid Maternity Leave.\n"
        "- Up to 8 weeks can be taken before the expected delivery date, and the remaining after delivery.\n"
        "- A medical certificate confirming pregnancy and expected delivery date must be submitted at least 2 months in advance."
    ),
    "miscarriage": (
        "Miscarriage Leave Policy:\n"
        "- In the unfortunate event of a miscarriage or medical termination of pregnancy, female employees are entitled to 42 days (6 weeks) of paid leave immediately following the day of miscarriage.\n"
        "- Valid medical certification is required to apply for this leave."
    ),
    "unpaid": (
        "Unpaid Leave (Loss of Pay) Policy:\n"
        "- Unpaid leave can be requested when all paid leave balances have been exhausted.\n"
        "- It requires special approval from the Department Head and HR.\n"
        "- Salary deduction will occur on a pro-rata basis for each day of unpaid leave taken."
    ),
    "general": (
        "General Leave Guidelines:\n"
        "- The leave year runs from January 1 to December 31.\n"
        "- All leaves must be applied for through the Leaveflow system and approved by the direct manager.\n"
        "- In case of emergencies, notify your manager as early as possible and submit the request within 24 hours of resuming work."
    )
}

def get_policy(query: str) -> str:
    """Helper function to find the relevant policy based on keyword search."""
    q = query.lower().strip()
    
    # Check for specific leave types
    if "sick" in q:
        return COMPANY_POLICIES["sick"]
    elif "casual" in q:
        return COMPANY_POLICIES["casual"]
    elif "earned" in q or "privilege" in q:
        return COMPANY_POLICIES["earned"]
    elif "maternity" in q:
        return COMPANY_POLICIES["maternity"]
    elif "miscarriage" in q:
        return COMPANY_POLICIES["miscarriage"]
    elif "unpaid" in q or "lop" in q or "loss of pay" in q:
        return COMPANY_POLICIES["unpaid"]
    
    # If generic search for general guidelines or policies
    return COMPANY_POLICIES["general"]
