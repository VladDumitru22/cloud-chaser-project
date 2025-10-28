from fastapi import FastAPI

app = FastAPI(title="Cloud Chaser API")

@app.get("/")
def read_root():
    return {"message": "Welcome to Cloud Chaser API"}