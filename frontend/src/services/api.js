// Use relative path for Vercel deployment, fallback to localhost for local development
const API_BASE = import.meta.env.VITE_API_URL || "";

export const fetchResources = async () => {
  const res = await fetch(`${API_BASE}/api/resources`);
  
  if (!res.ok) {
    throw new Error("Failed to fetch resources");
  }

  return res.json();
};

