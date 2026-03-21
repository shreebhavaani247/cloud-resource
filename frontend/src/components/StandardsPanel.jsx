function StandardsPanel() {
  const standards = [
    {
      label: 'Underutilized',
      criteria: 'CPU < 60th Percentile',
      description: 'Resource is significantly over-provisioned for its current workload.',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Normal',
      criteria: '60th ≤ CPU < 90th Percentile',
      description: 'Optimal balance between performance and cost-efficiency.',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Overutilized',
      criteria: 'CPU ≥ 90th Percentile',
      description: 'Risk of throttling or performance degradation. Scaling recommended.',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
    },
  ]

  return (
    <section className="flex flex-col rounded-xl border border-slate-800 bg-slate-950/70 p-4 shadow-sm shadow-slate-900/40">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-100 sm:text-base">Prediction Standards</h2>
        <span className="text-[11px] text-slate-400">ML Classification Logic</span>
      </div>
      <div className="space-y-3">
        {standards.map((s) => (
          <div key={s.label} className="flex flex-col gap-1 rounded-lg border border-slate-800 bg-slate-900/40 p-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${s.color}`}>
                {s.label}
              </span>
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-300">
                {s.criteria}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              {s.description}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 border-t border-slate-800 pt-3">
        <p className="text-[10px] italic leading-snug text-slate-500">
          *Thresholds are dynamically calculated by the Random Forest model using historical dataset quantiles (P60, P90).
        </p>
      </div>
    </section>
  )
}

export default StandardsPanel
