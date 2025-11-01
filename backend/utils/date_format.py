from datetime import date

def format_date(dt: date) -> str:
    return dt.strftime("%b %d, %Y")