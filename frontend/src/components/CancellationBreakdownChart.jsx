import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";

const COLORS = ["#ef4444", "#f97316", "#f59e0b", "#8b5cf6", "#06b6d4", "#10b981"];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="glass rounded-xl p-3 text-xs shadow-2xl border border-white/10">
      <p className="text-slate-200 font-bold mb-1">{item.label}</p>
      <p className="text-red-400">❌ {item.cancellations} cancellations</p>
      <p className="text-amber-400">💸 ${Number(item.revenueLost).toLocaleString()} revenue lost</p>
    </div>
  );
};

export default function CancellationBreakdownChart({ data, title, subtitle, icon = "❌" }) {
  return (
    <section className="glass rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xl">{icon}</span>
        <div>
          <h2 className="text-sm font-bold text-slate-200">{title}</h2>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      {data.length === 0 ? (
        <p className="h-[280px] flex items-center justify-center text-sm text-slate-500">No cancellation data for these filters</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis dataKey="label" type="category" tick={{ fontSize: 10, fill: "#94a3b8" }}
              width={120} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Bar dataKey="cancellations" name="Cancellations" radius={[0, 6, 6, 0]} maxBarSize={22}>
              {data.map((item, index) => <Cell key={`${item.label}-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </section>
  );
}
