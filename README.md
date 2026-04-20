# Cloud Resource Monitoring & Prediction Dashboard

A modern, full-stack dashboard for monitoring cloud resource utilization using Machine Learning (Random Forest) for status prediction and optimization recommendations.

## 🚀 Features
- **Real-time Monitoring**: Automated data refresh every 20 seconds.
- **ML Predictions**: Uses a Random Forest classifier to categorize resource status.
- **Interactive Visualizations**: Snapshot-based line charts and status distribution bars.
- **Smart Alerts**: Actionable recommendations for right-sizing or scaling.
- **Prediction Standards**: Transparent classification logic based on dataset quantiles.

## 🛠 Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS 4, Recharts
- **Backend**: FastAPI, Scikit-learn, Pandas, Joblib
- **Deployment**: Vercel

## 📊 Data Management
Due to the large size of the original dataset (313 MB), a smaller version `dataset_sample.csv` (10,000 rows, ~7.7 MB) is automatically generated and used for cloud deployment. The system is designed to:
1.  **Prioritize the Sample**: The backend and training scripts look for `dataset_sample.csv` first.
2.  **Local Fallback**: If you have the full `dataset.csv` locally, the scripts will use it automatically for more comprehensive testing/training.
3.  **Git Safety**: The large 313 MB file is excluded from Git to prevent push errors and deployment issues.

## 📦 Deployment Instructions (Vercel)

### 1. Prep your Git Repository
- Push this entire folder to a new GitHub repository.
- Ensure the `.gitignore` and `vercel.json` files are in the root directory.

### 2. Connect to Vercel
- Import your repository in Vercel.
- The `vercel.json` in the root will automatically handle the routing and Python runtime configuration.

### 3. Environment Variables
In Vercel Dashboard, set the following environment variable for the frontend:
- `VITE_API_URL`: Set this to your deployed backend URL (usually your Vercel project URL) if deploying separately, or leave it to use the unified routing defined in `vercel.json`.

## 🧪 Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
