import ast
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import joblib


def extract_cpu(value):
    try:
        data = ast.literal_eval(value)
        if isinstance(data, dict):
            return data.get("cpus", 0)
    except Exception:
        return 0
    return 0


def main():
    csv_path = "dataset.csv"
    if not os.path.exists(csv_path):
        csv_path = "dataset_sample.csv"
        print(f"Large dataset.csv not found, using {csv_path} instead.")
        
    df = pd.read_csv(csv_path)

    print("average_usage stats:")
    print(df["average_usage"].describe())

    df["average_usage"] = df["average_usage"].apply(extract_cpu)
    df["maximum_usage"] = df["maximum_usage"].apply(extract_cpu)

    if df["average_usage"].max() <= 1.0:
        df["average_usage"] = df["average_usage"] * 100
        df["maximum_usage"] = df["maximum_usage"] * 100

    numeric_cols = [
        "average_usage",
        "maximum_usage",
        "assigned_memory",
        "page_cache_memory",
        "memory_accesses_per_instruction",
    ]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    p60 = df["average_usage"].quantile(0.60)
    p90 = df["average_usage"].quantile(0.90)

    def create_label(cpu):
        if cpu < p60:
            return "Underutilized"
        elif cpu < p90:
            return "Normal"
        else:
            return "Overutilized"

    df["utilization_status"] = df["average_usage"].apply(create_label)

    print("Label distribution:")
    print(df["utilization_status"].value_counts())

    features = df[[
        "average_usage",
        "maximum_usage",
        "assigned_memory",
        "page_cache_memory",
        "memory_accesses_per_instruction",
    ]]
    target = df["utilization_status"]

    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(target)

    X_train, X_test, y_train, y_test = train_test_split(
        features, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, target_names=label_encoder.classes_)

    print(f"Accuracy: {acc:.4f}")
    print("Classification report:")
    print(report)

    joblib.dump(model, "resource_model.pkl")
    joblib.dump(label_encoder, "label_encoder.pkl")

    print("Saved resource_model.pkl and label_encoder.pkl")


if __name__ == "__main__":
    main()
