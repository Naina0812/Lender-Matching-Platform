from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine
from app.api.endpoints import application, lender

app = FastAPI(title="Loan Underwriting System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; specify domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(application.router, prefix="/api/applications", tags=["Applications"])
app.include_router(lender.router, prefix="/api/lenders", tags=["Lenders"])

@app.get("/")
def root():
    return {"message": "Loan Underwriting System API is running"}
