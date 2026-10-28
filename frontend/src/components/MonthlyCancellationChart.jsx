import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl p-3 text-xs shadow-2xl border border-white/10">
      <p className="text-slate-400 mb-2 font-medium">{label}</p>
      {payload.map(item => (
        <p key={item.dataKey} style={{ color: item.color }} className="font-semibold">
          {item.dataKey === "revenueLost"
            ? `💸 Revenue lost: $${Number(item.value).toLocaleString()}`
            : `❌ Cancellations: ${item.value}`}
        </p>
      ))}
    </div>
  );
};

export default function MonthlyCancellationChart({ data }) {
  return (
    <section className="glass rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xl">📉</span>
        <div>
          <h2 className="text-sm font-bold text-slate-200">Monthly Cancellation Trends</h2>
          <p className="text-xs text-slate-500">Uses recorded cancellation time when available</p>
        </div>
      </div>
      {data.length === 0 ? (
        <p className="h-[280px] flex items-center justify-center text-sm text-slate-500">No cancellations for these filters</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false} tickLine={false} tickFormatter={value => `$${Number(value).toLocaleString()}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }} />
            <Area yAxisId="left" type="monotone" dataKey="cancellations" name="Cancellations"
              stroke="#ef4444" fill="#ef4444" fillOpacity={0.18} />
            <Line yAxisId="right" type="monotone" dataKey="revenueLost" name="Revenue lost"
              stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </section>
  );
}
