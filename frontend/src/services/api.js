const API_BASE_URL = import.meta.env.VITE_API_URL || ""

export async function fetchResources() {
  const response = await fetch(`${API_BASE_URL}/api/resources`)
  if (!response.ok) {
    throw new Error("Failed to fetch resources")
  }
  const data = await response.json()
  return data
}

