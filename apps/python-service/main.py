from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Python Microservice",
    description="FastAPI service for AI/ML tasks",
    version="1.0.0",
)

# CORS middleware for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Python Microservice",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.post("/api/analyze")
async def analyze_text(text: str):
    """
    Placeholder for ML/AI analysis
    In production, this would use transformers, sklearn, etc.
    """
    return {
        "text": text,
        "length": len(text),
        "words": len(text.split()),
        "sentiment": "positive",  # Mock sentiment
        "message": "This is a placeholder. Add your ML model here!"
    }

@app.get("/api/stats")
async def get_stats():
    """Get service statistics"""
    return {
        "uptime": "running",
        "requests_processed": 0,
        "models_loaded": 0,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)