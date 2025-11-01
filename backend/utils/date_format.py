from datetime import date

def format_date(d: date) -> str:
    return d.strftime("%b %d, %Y") if d else None
