function StandardsPanel() {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
      
      <h2 className="text-sm font-semibold text-slate-100 mb-4">
        Analytics Engine Standards & Decision Logic
      </h2>

      <div className="space-y-4 text-xs text-slate-300">

        {/* Utilization Formula */}
        <div>
          <h3 className="text-slate-200 font-medium mb-1">
            Utilization Formula
          </h3>
          <p className="font-mono bg-slate-900/50 p-2 rounded">
            Utilization = (0.7 × CPU) + (0.3 × Memory)
          </p>
          <p className="text-slate-400 mt-1">Weighted toward CPU usage for performance focus</p>
        </div>

        {/* Status Classification */}
        <div>
          <h3 className="text-slate-200 font-medium mb-1">
            Status Classification
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><span className="text-amber-400 font-semibold">Underutilized</span> → 0–30%</li>
            <li><span className="text-emerald-400 font-semibold">Normal</span> → 30–70%</li>
            <li><span className="text-rose-400 font-semibold">Overutilized</span> → 70–100%</li>
          </ul>
        </div>

        {/* Priority Levels */}
        <div>
          <h3 className="text-slate-200 font-medium mb-1">
            Priority & Action Levels
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><span className="text-green-400 font-semibold">Low</span> → &lt; 30% | Action: Monitor only</li>
            <li><span className="text-yellow-400 font-semibold">Medium</span> → 30–70% | Action: No changes needed</li>
            <li><span className="text-red-400 font-semibold">High</span> → &gt; 70% | Action: Investigate & scale</li>
          </ul>
        </div>

        {/* Recommendations */}
        <div>
          <h3 className="text-slate-200 font-medium mb-1">
            Intelligent Recommendations
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Downscale Instance</strong> → Reduce CPU/Memory when Underutilized</li>
            <li><strong>Optimal Usage</strong> → Keep current setup when Normal</li>
            <li><strong>Upscale Instance</strong> → Increase CPU/Memory when Overutilized</li>
          </ul>
        </div>

        {/* Cost Analysis */}
        <div>
          <h3 className="text-slate-200 font-medium mb-1">
            Cost Waste Estimation
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Underutilized: <span className="text-rose-400">60% wasted</span> (high savings potential)</li>
            <li>Normal: <span className="text-emerald-400">10% wasted</span> (efficient)</li>
            <li>Overutilized: <span className="text-amber-400">20% at risk</span> (scaling needed)</li>
          </ul>
        </div>

        {/* Confidence & Trends */}
        <div>
          <h3 className="text-slate-200 font-medium mb-1">
            Confidence & Trend Analysis
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Confidence Score:</strong> ML model probability (85–98%)</li>
            <li><strong>Trend Direction:</strong> 7-day projection (Stable, Increasing, Decreasing)</li>
            <li><strong>Pattern Recognition:</strong> High CPU, High Memory, or Balanced workloads</li>
          </ul>
        </div>

        {/* Interpretation Guide */}
        <div>
          <h3 className="text-slate-200 font-medium mb-1">
            Workload Pattern Interpretation
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>High CPU + Low Memory</strong> → CPU-bound (compute-intensive)</li>
            <li><strong>Low CPU + High Memory</strong> → Memory-bound (data-intensive)</li>
            <li><strong>Both High</strong> → Overutilized (scaling needed)</li>
            <li><strong>Both Low</strong> → Underutilized (cost reduction opportunity)</li>
            <li><strong>Balanced</strong> → Optimal distribution</li>
          </ul>
        </div>

        {/* Data Distribution */}
        <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-3">
          <h3 className="text-slate-200 font-medium mb-2">
            Realistic Data Distribution
          </h3>
          <div className="space-y-1 text-[11px]">
            <p>• <span className="text-amber-400 font-semibold">40%</span> Underutilized resources</p>
            <p>• <span className="text-emerald-400 font-semibold">40%</span> Normal resources</p>
            <p>• <span className="text-rose-400 font-semibold">20%</span> Overutilized resources</p>
            <p className="text-slate-400 mt-2">Distribution reflects realistic cloud deployment patterns</p>
          </div>
        </div>

      </div>
    </section>
  )
}

export default StandardsPanel