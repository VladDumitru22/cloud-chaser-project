from backend.utils import has_min_length, has_digit, has_special_char, has_uppercase, validate_password

PWD = "tEst123!"

def test_has_min_length():
    assert has_min_length(PWD) == True
    assert has_min_length("test") == False

def test_has_digit():
    assert has_digit(PWD) == True    
    assert has_digit("test") == False

def test_has_special_char():
    assert has_special_char(PWD) == True
    assert has_special_char("test") == False

def test_has_uppercase():
    assert has_uppercase(PWD) == True   
    assert has_uppercase("test") == False

def test_password_valid():
    validate_password(PWD)