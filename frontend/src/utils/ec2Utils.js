// EC2 Instance Details and Helper Functions

export const EC2_DETAILS = {
  "t2.micro": {
    family: "Burstable General Purpose",
    description: "Low usage workloads",
    cpu: "Low",
    memory: "Low",
    use_case: "Testing, idle services",
    color: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    badge_color: "gray"
  },
  "t3.medium": {
    family: "General Purpose",
    description: "Balanced workloads",
    cpu: "Moderate",
    memory: "Moderate",
    use_case: "Web apps, APIs",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    badge_color: "blue"
  },
  "c5.large": {
    family: "Compute Optimized",
    description: "CPU-heavy workloads",
    cpu: "High",
    memory: "Moderate",
    use_case: "Processing, batch jobs",
    color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    badge_color: "orange"
  },
  "r5.large": {
    family: "Memory Optimized",
    description: "Memory-heavy workloads",
    cpu: "Moderate",
    memory: "High",
    use_case: "Analytics, caching, databases",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    badge_color: "purple"
  },
  "m5.large": {
    family: "General Purpose (High Performance)",
    description: "High CPU + Memory",
    cpu: "High",
    memory: "High",
    use_case: "Production systems, real-time processing",
    color: "bg-red-500/10 text-red-400 border-red-500/20",
    badge_color: "red"
  }
}

/**
 * Get recommended EC2 instance type based on CPU and memory usage
 */
export function getEC2Suggestion(cpu, memory) {
  if (cpu < 20 && memory < 20) {
    return "t2.micro"
  } else if (cpu > 70 && memory < 50) {
    return "c5.large"
  } else if (memory > 70 && cpu < 50) {
    return "r5.large"
  } else if (cpu > 70 && memory > 70) {
    return "m5.large"
  } else {
    return "t3.medium"
  }
}

/**
 * Get explanation for why a specific EC2 instance is suggested
 */
export function getEC2Explanation(cpu, memory) {
  if (cpu > memory && cpu > 70) {
    return "CPU-intensive workload detected → compute optimized instance selected for better performance"
  } else if (memory > cpu && memory > 70) {
    return "Memory-intensive workload detected → memory optimized instance selected for efficiency"
  } else if (cpu > 70 && memory > 70) {
    return "High utilization across both CPU and memory → high-capacity instance selected to handle load"
  } else if (cpu < 20 && memory < 20) {
    return "Low utilization detected → burstable instance selected to minimize costs"
  } else {
    return "Balanced workload profile → general-purpose instance selected for flexibility"
  }
}

/**
 * Format instance type for display with details
 */
export function formatInstanceType(instanceType) {
  if (!instanceType || !EC2_DETAILS[instanceType]) {
    return "t3.medium"
  }
  return instanceType
}
