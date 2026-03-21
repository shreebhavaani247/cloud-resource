import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header.jsx'
import SummaryCards from './components/SummaryCards.jsx'
import ResourceTable from './components/ResourceTable.jsx'
import ChartsSection from './components/ChartsSection.jsx'
import AlertsPanel from './components/AlertsPanel.jsx'
import RecommendationsPanel from './components/RecommendationsPanel.jsx'
import StandardsPanel from './components/StandardsPanel.jsx'
import { fetchResources } from './services/api.js'

const STATUS_SEVERITY = {
  Overutilized: 'critical',
  Underutilized: 'warning',
  Normal: 'info',
}

function App() {
  const [resources, setResources] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState(20)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  async function loadResources() {
    if (isRefreshing) return
    setIsRefreshing(true)
    try {
      const newResources = await fetchResources()
      setTimeout(() => {
        setResources(newResources)
        setLastUpdated(new Date())
        setIsLoading(false)
        setIsRefreshing(false)
        setTimeLeft(20)
      }, 400)
    } catch (error) {
      console.error('Failed to load resources from backend', error)
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadResources()

    const timerId = setInterval(() => {
      if (isPaused) return // Skip decrementing if paused

      setTimeLeft((prev) => {
        if (prev <= 1) {
          loadResources()
          return 20
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerId)
  }, [isPaused]) // Re-run effect if pause state changes

  const summary = useMemo(() => {
    const totalActiveResources = resources.length
    const normalResources = resources.filter((r) => r.status === 'Normal').length
    const underutilizedResources = resources.filter((r) => r.status === 'Underutilized').length
    const overutilizedResources = resources.filter((r) => r.status === 'Overutilized').length
    const activeAlerts = resources.filter((r) => r.status !== 'Normal').length
    return {
      totalActiveResources,
      normalResources,
      underutilizedResources,
      overutilizedResources,
      activeAlerts,
    }
  }, [resources])

  const alerts = useMemo(() => {
    return resources
      .filter((resource) => resource.status !== 'Normal')
      .map((resource, idx) => ({
        id: `${resource.id}-${idx}`,
        title: `${resource.status} resource: ${resource.id}`,
        message:
          resource.status === 'Overutilized'
            ? `Increase CPU/memory or scale out ${resource.id}. Current CPU ${resource.cpu_usage.toFixed(1)}%.`
            : `Consider right-sizing ${resource.id}. Current CPU ${resource.cpu_usage.toFixed(1)}% is low.`,
        severity: STATUS_SEVERITY[resource.status] || 'warning',
      }))
  }, [resources])

  const recommendations = useMemo(() => {
    if (resources.length === 0) {
      return []
    }

    return resources
      .filter((resource) => resource.status !== 'Normal')
      .map((resource, idx) => ({
        id: `${resource.id}-${idx}`,
        title:
          resource.status === 'Overutilized'
            ? `Scale up ${resource.id}`
            : `Right-size ${resource.id}`,
        description:
          resource.status === 'Overutilized'
            ? `CPU ${resource.cpu_usage.toFixed(1)}%. Add capacity or migrate workload to avoid throttling.`
            : `CPU ${resource.cpu_usage.toFixed(1)}%. Reduce allocation or shift workloads to optimize cost.`,
        impact: resource.status === 'Overutilized' ? 'High' : 'Medium',
        effort: resource.status === 'Overutilized' ? 'Medium' : 'Low',
      }))
  }, [resources])

  const chartData = useMemo(() => {
    const counts = resources.reduce(
      (acc, resource) => {
        acc[resource.status] = (acc[resource.status] || 0) + 1
        return acc
      },
      { Normal: 0, Underutilized: 0, Overutilized: 0 },
    )
    return [
      { name: 'Normal', value: counts.Normal, color: '#22c55e' },
      { name: 'Underutilized', value: counts.Underutilized, color: '#f59e0b' },
      { name: 'Overutilized', value: counts.Overutilized, color: '#ef4444' },
    ]
  }, [resources])

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 transition-opacity duration-500 ${isRefreshing ? 'opacity-80' : 'opacity-100'}`}>
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Header 
          timeLeft={timeLeft} 
          isRefreshing={isRefreshing} 
          isPaused={isPaused} 
          setIsPaused={setIsPaused} 
          loadResources={loadResources}
          lastUpdated={lastUpdated}
        />
        <SummaryCards summary={summary} />

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ResourceTable resources={resources} isLoading={isLoading} />
          </div>
          <div className="space-y-4">
            <StandardsPanel />
            <AlertsPanel alerts={alerts} />
            <RecommendationsPanel recommendations={recommendations} />
          </div>
        </div>

        <ChartsSection cpuData={resources} statusData={chartData} />
      </main>
    </div>
  )
}

export default App
