function RecommendationsPanel({ recommendations }) {
  return (
    <section className="flex flex-col rounded-xl border border-slate-800 bg-slate-950/70 p-4 shadow-sm shadow-slate-900/40">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-100 sm:text-base">Recommendations</h2>
        <span className="text-[11px] text-slate-400">Actionable optimization insights</span>
      </div>
      <div className="space-y-3">
        {recommendations.length === 0 ? (
          <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-[12px] text-slate-300">
            No recommended actions. System seems stable.
          </div>
        ) : (
          recommendations.map((rec) => (
            <article
              key={rec.id}
              className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2.5 text-xs text-slate-200"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <h3 className="text-[12px] font-semibold leading-snug text-slate-50">{rec.title}</h3>
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                    Impact: {rec.impact}
                  </span>
                  <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-400">
                    Effort: {rec.effort}
                  </span>
                </div>
              </div>
              <p className="text-[11px] leading-snug text-slate-300">{rec.description}</p>
            </article>
          ))
        )}
      </div>
    </section>
  )
}

export default RecommendationsPanel

