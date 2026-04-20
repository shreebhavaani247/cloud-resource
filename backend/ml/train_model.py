import ast
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

def extract_usage(value):
    try:
        if isinstance(value, str):
            data = ast.literal_eval(value)
        else:
            data = value
        cpu = data.get("cpus", 0)
        memory = data.get("memory", 0)
        if cpu <= 1:
            cpu = cpu * 100
        if memory <= 1:
            memory = memory * 100
        # Scale memory more strongly for better influence
        memory = memory * 2
        return cpu, memory
    except:
        return 0, 0

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(base_dir, "dataset.csv")
    
    df = pd.read_csv(csv_path)

    # Extract CPU and memory
    df["avg_cpu"], df["avg_memory"] = zip(*df["average_usage"].apply(extract_usage))
    df["max_cpu"], df["max_memory"] = zip(*df["maximum_usage"].apply(extract_usage))

    # Feature engineering - weighted utilization considering both CPU and memory
    df["utilization_score"] = (0.7 * df["avg_cpu"]) + (0.3 * df["avg_memory"])

    # Label creation based on weighted utilization score
    def create_label(score):
        if score < 2:
            return "Underutilized"
        elif score <= 8:
            return "Normal"
        else:
            return "Overutilized"

    df["utilization_status"] = df["utilization_score"].apply(create_label)

    print("Label distribution:")
    print(df["utilization_status"].value_counts())

    features = df[[
        "avg_cpu",
        "max_cpu",
        "avg_memory",
        "max_memory",
        "utilization_score",
    ]]
    target = df["utilization_status"]

    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(target)

    X_train, X_test, y_train, y_test = train_test_split(
        features, y_encoded, test_size=0.2, random_state=42
    )

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, target_names=label_encoder.classes_)

    print(f"Accuracy: {acc:.4f}")
    print("Classification report:")
    print(report)

    joblib.dump(model, os.path.join(base_dir, "resource_model.pkl"))
    joblib.dump(label_encoder, os.path.join(base_dir, "label_encoder.pkl"))

    print("Saved resource_model.pkl and label_encoder.pkl")


if __name__ == "__main__":
    main()
