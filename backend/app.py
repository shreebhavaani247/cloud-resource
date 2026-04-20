import ast
import joblib
import numpy as np
import os
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# -------------------------------
# INIT
# -------------------------------
app = FastAPI(title="Cloud Resource Monitoring API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# LOAD MODEL
# -------------------------------
model = None
label_encoder = None

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ML_DIR = os.path.join(BASE_DIR, "ml")

@app.on_event("startup")
def load_model():
    global model, label_encoder

    model_path = os.path.join(ML_DIR, "resource_model.pkl")
    encoder_path = os.path.join(ML_DIR, "label_encoder.pkl")

    try:
        model = joblib.load(model_path)
        label_encoder = joblib.load(encoder_path)
        print("✅ Model loaded")
    except Exception as e:
        print("❌ Model load failed:", e)

# -------------------------------
# HELPERS
# -------------------------------
def extract_usage(value):
    try:
        if isinstance(value, str):
            value = ast.literal_eval(value)

        cpu = value.get("cpus", 0)
        memory = value.get("memory", 0)

        if cpu is None:
            cpu = 0
        if memory is None:
            memory = 0

    except:
        cpu, memory = 0, 0

    # convert to %
    if cpu <= 1:
        cpu *= 100
    if memory <= 1:
        memory *= 100
    
    # Scale memory more strongly for better influence
    memory = memory * 2

    return cpu, memory


def recommend_instance(cpu, memory, util):
    if util < 20:
        return "t2.micro | Save Cost"
    elif util < 40:
        return "t2.small | Low Workload"
    elif util < 60:
        return "t2.medium | Balanced"
    elif util < 80:
        return "m5.large | Moderate Load"
    else:
        if cpu > memory:
            return "c5.large | CPU Optimized"
        else:
            return "r5.large | Memory Optimized"

def get_ec2_suggestion(cpu, memory):
    """Get EC2 instance type based on CPU and memory usage"""
    if cpu < 20 and memory < 20:
        return "t2.micro"
    elif cpu > 70 and memory < 50:
        return "c5.large"
    elif memory > 70 and cpu < 50:
        return "r5.large"
    elif cpu > 70 and memory > 70:
        return "m5.large"
    else:
        return "t3.medium"

# -------------------------------
# ROUTES
# -------------------------------
@app.get("/")
def root():
    return {"status": "running"}

@app.get("/api/resources")
def get_resources():
    import pandas as pd
    import random
    import os

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(BASE_DIR, "ml", "dataset.csv")

    resources = []

    try:
        df = pd.read_csv(dataset_path)
        df = df.fillna(0)

        def parse_usage(val):
            import ast
            try:
                data = ast.literal_eval(val)
                return data.get("cpus", 0), data.get("memory", 0)
            except:
                return 0, 0

        def parse_request(val):
            import ast
            try:
                data = ast.literal_eval(val)
                return data.get("cpus", 0), data.get("memory", 0)
            except:
                return 0, 0

        avg_usage = df["average_usage"].apply(parse_usage)
        max_usage = df["maximum_usage"].apply(parse_usage)
        req_usage = df["resource_request"].apply(parse_request)

        def usage_percent(used, requested):
            if requested and requested > 0:
                return (used / requested) * 100
            if used <= 1:
                return used * 100
            return used

        df["cpu_usage"] = [usage_percent(u, r) for (u, _), (r, _) in zip(avg_usage, req_usage)]
        df["assigned_memory"] = [usage_percent(m, r) for (_, m), (_, r) in zip(avg_usage, req_usage)]
        df["max_cpu"] = [usage_percent(u, r) for (u, _), (r, _) in zip(max_usage, req_usage)]

        # Normalize to 0-100 scale
        df["cpu_usage"] = pd.to_numeric(df["cpu_usage"], errors="coerce").fillna(0).clip(0, 100)
        df["assigned_memory"] = pd.to_numeric(df["assigned_memory"], errors="coerce").fillna(0).clip(0, 100)
        df["max_cpu"] = pd.to_numeric(df["max_cpu"], errors="coerce").fillna(0).clip(0, 100)

        # Sample directly from the real dataset
        sample_df = df.sample(n=10, replace=True).copy().reset_index(drop=True)

        # Compute utilization for all samples
        sample_df["utilization"] = (0.7 * sample_df["cpu_usage"]) + (0.3 * sample_df["assigned_memory"])
        sample_df["utilization"] = sample_df["utilization"] / 100.0

        # Generate resources using utilization-based status for realistic distribution
        for i, row in sample_df.iterrows():
            util_val = row["utilization"]
            cpu_val = row["cpu_usage"]
            mem_val = row["assigned_memory"]
            utilization = util_val * 100  # Back to 0-100 scale for display

            if utilization < 30:
                status = "Underutilized"
            elif utilization <= 70:
                status = "Normal"
            else:
                status = "Overutilized"

            if utilization < 30:
                priority = "Low"
            elif utilization < 70:
                priority = "Medium"
            else:
                priority = "High"

            if utilization < 30:
                health = "Idle"
            elif utilization < 70:
                health = "Stable"
            else:
                health = "Critical"

            if status == "Underutilized":
                action = "Scale Down"
            elif status == "Normal":
                action = "Maintain"
            else:
                action = "Scale Up"

            if cpu_val > 70:
                workload_type = "Compute Intensive"
            elif mem_val > 70:
                workload_type = "Memory Intensive"
            else:
                workload_type = "Balanced"

            estimated_cost = (cpu_val * 0.05) + (mem_val * 0.02)

            # Get EC2 suggestion
            ec2_instance = get_ec2_suggestion(cpu_val, mem_val)

            confidence = 85.0
            try:
                if hasattr(model, 'predict_proba'):
                    features = [[cpu_val, row["max_cpu"], mem_val, 0, 0]]
                    proba = model.predict_proba(features)
                    confidence = round(float(np.max(proba)) * 100, 2)
            except:
                confidence = 85.0

            if status == "Underutilized":
                trend = "Decreasing → May become Underutilized"
                reason = "Low CPU + Low Memory → Underutilized"
            elif status == "Normal":
                trend = "Stable"
                reason = "Balanced usage → Normal"
            else:
                trend = "Increasing → May become Overutilized"
                reason = "High CPU + High Memory → Overutilized"

            resources.append({
                "id": int(i),
                "cpu_usage": round(cpu_val, 2),
                "max_cpu": round(row["max_cpu"], 2),
                "assigned_memory": round(mem_val, 2),
                "utilization": round(utilization, 2),
                "status": status,
                "priority": priority,
                "health": health,
                "action": action,
                "workload_type": workload_type,
                "estimated_cost": round(estimated_cost, 2),
                "confidence": confidence,
                "trend": trend,
                "reason": reason,
                "ec2_instance": ec2_instance,
                "wasted_cost": 0.0,
                "is_top": False
            })

        # Shuffle output for natural appearance
        resources = sorted(resources, key=lambda x: random.random())

    except Exception as e:
        print("DATASET ERROR:", e)

    resources = resources[:10]
    print(f"STATUS DISTRIBUTION: {pd.Series([r['status'] for r in resources]).value_counts().to_dict()}")
    return resources

@app.get("/health")
def health():
    dataset_path = os.path.join(ML_DIR, "dataset.csv")

    return {
        "model_loaded": model is not None,
        "dataset_found": os.path.exists(dataset_path)
    }

# --------------------------------
# SIMULATION ENDPOINT
# --------------------------------
@app.post("/simulate")
def simulate(data: dict):
    """
    What-If Simulation Engine
    
    Input:
    - cpu: CPU usage (0-100)
    - memory: Memory usage (0-100)
    
    Returns simulated metrics without mutating real data
    """
    try:
        # Extract input values with defaults
        cpu = float(data.get("cpu", 10))
        memory = float(data.get("memory", 10))
        
        # Clamp values to 0-100 range
        cpu = max(0, min(100, cpu))
        memory = max(0, min(100, memory))
        
        # Calculate utilization using same formula as main system
        utilization = (0.7 * cpu) + (0.3 * memory)
        
        # Determine status based on utilization
        if utilization < 30:
            status = "Underutilized"
        elif utilization <= 70:
            status = "Normal"
        else:
            status = "Overutilized"
        
        # Calculate estimated cost (same formula as main system)
        cost = (cpu * 0.05) + (memory * 0.02)
        
        # Generate recommendation based on status
        if status == "Underutilized":
            recommendation = "Scale Down resources to reduce cost"
        elif status == "Normal":
            recommendation = "Maintain current configuration"
        else:
            recommendation = "Scale Up resources or enable auto-scaling"
        
        return {
            "utilization": round(utilization, 2),
            "status": status,
            "cost": round(cost, 2),
            "recommendation": recommendation
        }
    
    except Exception as e:
        print(f"Simulation error: {e}")
        return {
            "error": "Simulation failed",
            "message": str(e)
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)