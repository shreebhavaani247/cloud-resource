import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts'

function ChartsSection({ cpuData, statusData }) {
  // Transform the current resources into a format suitable for the snapshot graph
  const snapshotData = cpuData.map(r => ({
    name: `Res ${r.id}`,
    cpu: Number(r.cpu_usage.toFixed(2)),
    status: r.status
  }));

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-950/70 p-4 shadow-sm shadow-slate-900/40">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-100 sm:text-base">Resource CPU Distribution</h2>
          <p className="text-xs text-slate-400">Exact CPU usage across all 10 monitored resources</p>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={snapshotData} margin={{ top: 12, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280" 
                tickLine={false} 
                fontSize={10} 
                interval={0}
              />
              <YAxis
                stroke="#6b7280"
                tickLine={false}
                fontSize={11}
                width={32}
                domain={['auto', 'auto']}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#020617',
                  borderColor: '#1f2937',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: '#e5e7eb', fontWeight: 500 }}
              />
              <Line
                type="monotone"
                dataKey="cpu"
                name="CPU Usage"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: '#0f172a' }}
                activeDot={{ r: 6 }}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-950/70 p-4 shadow-sm shadow-slate-900/40">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-100 sm:text-base">Resource Status Distribution</h2>
          <p className="text-xs text-slate-400">Current resource statuses</p>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" stroke="#6b7280" tickLine={false} fontSize={11} />
              <YAxis stroke="#6b7280" tickLine={false} fontSize={11} width={40} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#020617',
                  borderColor: '#1f2937',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: '#e5e7eb', fontWeight: 500 }}
              />
              <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]}>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}

export default ChartsSection

