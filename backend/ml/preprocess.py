import pandas as pd


def load_and_preprocess(csv_path: str) -> pd.DataFrame:
    if not os.path.exists(csv_path):
        csv_path = "dataset_sample.csv"
        print(f"Original dataset path not found, using {csv_path} instead.")
    df = pd.read_csv(csv_path)

    required_cols = [
        "average_usage",
        "maximum_usage",
        "assigned_memory",
        "page_cache_memory",
        "memory_accesses_per_instruction",
    ]
    for col in required_cols:
        if col not in df.columns:
            raise ValueError(f"Missing required dataset column: {col}")

    df = df[required_cols].copy()
    df = df.apply(pd.to_numeric, errors="coerce").fillna(0)

    cpu_usage = df["average_usage"].copy()
    if cpu_usage.max() <= 1.0:
        cpu_usage = cpu_usage * 100

    def utilization_status(cpu_value):
        if cpu_value < 30:
            return "Underutilized"
        if cpu_value <= 80:
            return "Normal"
        return "Overutilized"

    df["utilization_status"] = cpu_usage.apply(utilization_status)

    features = df.drop(columns=["utilization_status"])
    target = df["utilization_status"]
    return features, target
