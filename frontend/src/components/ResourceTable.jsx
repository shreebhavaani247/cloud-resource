const STATUS_STYLES = {
  Normal: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.1)]',
  Underutilized: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.1)]',
  Overutilized: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.1)]',
}

function ResourceTable({ resources = [], isLoading }) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 shadow-sm shadow-slate-900/40">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-100 sm:text-base">Resource Monitoring</h2>
        <p className="text-xs text-slate-400">Snapshot of key cloud workloads</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-400">
              <th className="py-2 pr-4">ID</th>
              <th className="px-4 py-2">CPU %</th>
              <th className="px-4 py-2">Max CPU</th>
              <th className="px-4 py-2">Assigned Memory</th>
              <th className="px-4 py-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900">
            {isLoading ? (
              <tr>
                <td className="px-4 py-3 text-slate-300" colSpan={5}>
                  Loading resource data...
                </td>
              </tr>
            ) : resources.length === 0 ? (
              <tr>
                <td className="px-4 py-3 text-slate-300" colSpan={5}>
                  No resources found.
                </td>
              </tr>
            ) : (
              resources.map((resource) => (
                <tr key={`${resource.id}-${resource.status}`} className="group align-middle transition-colors hover:bg-slate-900/40">
                  <td className="py-3 pr-4 font-medium text-slate-300 group-hover:text-slate-100">{resource.id}</td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-400 group-hover:text-slate-200">
                    {Number(resource.cpu_usage).toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-400 group-hover:text-slate-200">
                    {Number(resource.max_cpu).toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-400 group-hover:text-slate-200">
                    {Number(resource.assigned_memory).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase transition-all duration-300 ${
                        STATUS_STYLES[resource.status] || ''
                      }`}
                    >
                      {resource.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default ResourceTable

