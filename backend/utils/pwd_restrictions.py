import string
from fastapi import HTTPException
from fastapi import status

def has_min_length(pwd: str) -> bool:
    return len(pwd) >= 8

def has_special_char(pwd: str) -> bool:
    special_chars = set(string.punctuation)
    return any(char in special_chars for char in pwd)

def has_uppercase(pwd: str) -> bool:
    return any(char.isupper() for char in pwd)

def has_digit(pwd:str) -> bool:
    return any(char.isdigit() for char in pwd)

def validate_password(password: str):
    if not has_min_length(password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 8 characters long.")
    if not has_uppercase(password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must contain at least one uppercase letter.")
    if not has_digit(password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must contain at least one digit.")
    if not has_special_char(password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must contain at least one special character.")
    