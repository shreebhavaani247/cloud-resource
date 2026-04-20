function ResourceDetailsPanel({ resources = [] }) {
  if (!resources || resources.length === 0) {
    return (
      <section className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 shadow-sm shadow-slate-900/40">
        <h2 className="text-sm font-semibold text-slate-100 mb-4">Resource Deep-Dive</h2>
        <div className="text-center text-slate-400 py-8">
          <p className="text-xs">No resources available</p>
        </div>
      </section>
    )
  }

  return (
    <section className="flex flex-col rounded-xl border border-slate-800 bg-slate-950/70 p-4 shadow-sm shadow-slate-900/40 h-full">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Resource Deep-Dive</h2>
          <p className="text-xs text-slate-400 mt-0.5">Clustered analysis of all nodes</p>
        </div>
        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
          {resources.length} Nodes
        </span>
      </div>

      <div className="grid gap-3 overflow-y-auto pr-1 custom-scrollbar max-h-[500px]">
        {resources.map((resource) => {
          // Determine health color and label
          const getHealthDisplay = (status) => {
            if (status === 'Underutilized') return { label: 'Idle', color: 'text-slate-400', bg: 'bg-slate-700/20' }
            if (status === 'Normal') return { label: 'Healthy', color: 'text-emerald-400', bg: 'bg-emerald-700/20' }
            return { label: 'Critical', color: 'text-red-400', bg: 'bg-red-700/20' }
          }

          const health = getHealthDisplay(resource.status)

          // Determine workload type
          const getWorkloadType = (cpu, memory) => {
            if (cpu > memory + 20) return 'Compute'
            if (memory > cpu + 20) return 'Memory'
            return 'Balanced'
          }

          const workloadType = getWorkloadType(resource.cpu_usage, resource.assigned_memory)

          return (
            <div key={resource.id} className="rounded-lg border border-slate-800/60 bg-slate-900/30 p-3 hover:bg-slate-900/50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-100">Node #{resource.id}</h3>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  resource.status === 'Overutilized' ? 'bg-rose-500/10 text-rose-400' :
                  resource.status === 'Underutilized' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-emerald-500/10 text-emerald-400'
                }`}>
                  {resource.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
                <div className="flex justify-between border-b border-slate-800/50 pb-1">
                  <span className="text-slate-500">CPU</span>
                  <span className="text-slate-200 font-mono">{resource.cpu_usage?.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/50 pb-1">
                  <span className="text-slate-500">RAM</span>
                  <span className="text-slate-200 font-mono">{resource.assigned_memory?.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/50 pb-1">
                  <span className="text-slate-500">Health</span>
                  <span className={`${health.color} font-semibold`}>{health.label}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/50 pb-1">
                  <span className="text-slate-500">Type</span>
                  <span className="text-slate-300">{workloadType}</span>
                </div>
                <div className="col-span-2 flex justify-between pt-1">
                  <span className="text-slate-500">Cost Est.</span>
                  <span className="text-emerald-400 font-bold">₹{resource.estimated_cost?.toFixed(2)}/hr</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default ResourceDetailsPanel
