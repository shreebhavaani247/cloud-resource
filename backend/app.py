import ast
import joblib
import os
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal

# Initialize FastAPI app
app = FastAPI(title="Cloud Resource Monitoring API", version="1.0.0")

# Add CORS middleware to allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins like ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request model for the predict endpoint
class ResourceMetrics(BaseModel):
    cpu_usage: float
    memory_usage: float
    storage_usage: float
    network_usage: float
    avg_cpu_7d: float


# Request model for the alert prediction endpoint
class AlertMetrics(BaseModel):
    cpu: float
    memory: float
    disk: float
    network: float


# Response model for the predict endpoint
class PredictionResponse(BaseModel):
    prediction: Literal["Normal", "Underutilized", "Overutilized"]
    confidence: float

# Response model for the alert prediction endpoint
class AlertPredictionResponse(BaseModel):
    prediction: int
    status: Literal["Normal", "Anomaly"]
    confidence: float

# Load ML model and label encoder on startup
model = None
label_encoder = None
script_dir = os.path.dirname(__file__)
ml_dir = os.path.join(script_dir, "ml")

def extract_cpu(value):
    try:
        data = ast.literal_eval(value)
        if isinstance(data, dict):
            return data.get("cpus", 0)
    except Exception:
        return 0
    return 0

@app.on_event("startup")
def load_model():
    global model, label_encoder
    model_path = os.path.join(ml_dir, "resource_model.pkl")
    encoder_path = os.path.join(ml_dir, "label_encoder.pkl")

    if not os.path.exists(model_path) or not os.path.exists(encoder_path):
        # Instead of failing, we can log it and wait for training or manual upload
        print(f"Warning: Model or encoder file not found in {ml_dir}. Start server without model.")
        return

    try:
        model = joblib.load(model_path)
        label_encoder = joblib.load(encoder_path)
        print("Model and label encoder loaded successfully")
    except Exception as e:
        print(f"Failed to load model or encoder: {str(e)}")

@app.get("/")
def read_root():
    """Root endpoint for health check"""
    return {
        "message": "Cloud Resource Monitoring API",
        "version": "1.0.0",
        "status": "running"
    }

@app.post("/predict", response_model=PredictionResponse)
def predict(metrics: ResourceMetrics):
    """
    Predict resource utilization status based on current metrics.
    
    Args:
        metrics: ResourceMetrics containing cpu_usage, memory_usage, storage_usage, 
                 network_usage, and avg_cpu_7d
    
    Returns:
        PredictionResponse with prediction label and confidence score
    """
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Prepare input features as a DataFrame to provide valid feature names
        feature_names = [
            "average_usage",
            "maximum_usage",
            "assigned_memory",
            "page_cache_memory",
            "memory_accesses_per_instruction"
        ]
        features_df = pd.DataFrame([[
            metrics.cpu_usage,
            metrics.memory_usage,
            metrics.storage_usage,
            metrics.network_usage,
            metrics.avg_cpu_7d
        ]], columns=feature_names)
        
        # Make prediction
        prediction_idx = model.predict(features_df)[0]
        
        # Map prediction index to label
        label_map = {0: "Normal", 1: "Underutilized", 2: "Overutilized"}
        prediction_label = label_map.get(prediction_idx, "Normal")
        
        # Get prediction confidence if the model supports predict_proba
        confidence = 0.0
        try:
            proba = model.predict_proba(features_df)[0]
            confidence = float(max(proba))
        except (AttributeError, IndexError):
            confidence = 1.0  # Default confidence for models without probability
        
        return PredictionResponse(
            prediction=prediction_label,
            confidence=confidence
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Prediction error: {str(e)}"
        )

@app.post("/predict-alert", response_model=AlertPredictionResponse)
def predict_alert(metrics: AlertMetrics):
    """
    Predict anomaly status based on resource metrics.
    
    Args:
        metrics: AlertMetrics containing cpu, memory, disk, network
    
    Returns:
        AlertPredictionResponse with prediction (0/1) and status label
    """
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Prepare input features as a DataFrame to provide valid feature names
        feature_names = [
            "average_usage",
            "maximum_usage",
            "assigned_memory",
            "page_cache_memory",
            "memory_accesses_per_instruction"
        ]
        features_df = pd.DataFrame([[
            metrics.cpu,           # cpu_usage
            metrics.memory,        # memory_usage
            metrics.disk,          # storage_usage
            metrics.network,       # network_usage
            metrics.cpu * 0.9      # avg_cpu_7d (approximation)
        ]], columns=feature_names)
        
        # Make prediction
        prediction_idx = model.predict(features_df)[0]
        
        # Convert to binary prediction (Normal=0, Anomaly=1)
        # If prediction is "Overutilized" or "Underutilized", flag as anomaly
        is_anomaly = 0 if prediction_idx == 0 else 1
        status = "Normal" if is_anomaly == 0 else "Anomaly"
        
        # Get prediction confidence
        confidence = 0.0
        try:
            proba = model.predict_proba(features_df)[0]
            confidence = float(max(proba))
        except (AttributeError, IndexError):
            confidence = 0.95
        
        return AlertPredictionResponse(
            prediction=is_anomaly,
            status=status,
            confidence=confidence
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Prediction error: {str(e)}"
        )

@app.get("/api/resources")
def get_resources():
    """Return 10 sampled resources with predicted utilization status."""
    if model is None or label_encoder is None:
        raise HTTPException(status_code=500, detail="Model or label encoder not loaded")

    # Use a smaller sample file if it exists, otherwise fall back to the full dataset
    sample_data_path = os.path.join(ml_dir, "dataset_sample.csv")
    full_data_path = os.path.join(ml_dir, "dataset.csv")
    
    data_path = sample_data_path if os.path.exists(sample_data_path) else full_data_path
    
    if not os.path.exists(data_path):
        raise HTTPException(status_code=500, detail="Dataset not found")

    df = pd.read_csv(data_path)

    # Extract CPU usage fields from dict-like strings
    df["average_usage"] = df["average_usage"].apply(extract_cpu)
    df["maximum_usage"] = df["maximum_usage"].apply(extract_cpu)

    # Normalize to percentages when needed
    if df["average_usage"].max() <= 1.0:
        df["average_usage"] = df["average_usage"] * 100
        df["maximum_usage"] = df["maximum_usage"] * 100

    # Drop rows with missing critical features and cast numeric
    feature_cols = [
        "average_usage",
        "maximum_usage",
        "assigned_memory",
        "page_cache_memory",
        "memory_accesses_per_instruction",
    ]
    for col in feature_cols:
        if col not in df.columns:
            raise HTTPException(status_code=500, detail=f"Missing feature column: {col}")
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    sample_df = df.sample(n=10) # Removed fixed random_state for dynamic data sampling
    feature_data = sample_df[feature_cols]

    try:
        preds = model.predict(feature_data)
        labels = label_encoder.inverse_transform(preds)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model prediction failed: {str(e)}")

    response = []
    for idx, (_, row) in enumerate(sample_df.iterrows(), start=1):
        response.append({
            "id": idx,
            "cpu_usage": float(row["average_usage"]),
            "max_cpu": float(row["maximum_usage"]),
            "assigned_memory": float(row["assigned_memory"]),
            "status": str(labels[idx - 1]),
        })

    return response


@app.get("/health")
def health_check():
    """Health check endpoint"""
    dataset_path = os.path.join(ml_dir, "dataset_sample.csv") if os.path.exists(os.path.join(ml_dir, "dataset_sample.csv")) else os.path.join(ml_dir, "dataset.csv")
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "label_encoder_loaded": label_encoder is not None,
        "dataset_found": os.path.exists(dataset_path),
        "dataset_path": dataset_path
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
