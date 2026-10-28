import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";

const COLORS = [
  "#6366f1","#8b5cf6","#06b6d4","#10b981","#f59e0b",
  "#ef4444","#ec4899","#14b8a6","#3b82f6","#a855f7"
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl p-3 text-xs shadow-2xl border border-white/10">
      <p className="text-slate-300 font-bold mb-1">🌍 {payload[0].payload.label}</p>
      <p style={{ color: payload[0].color }}>💰 ${Number(payload[0].value).toLocaleString()}</p>
      <p className="text-cyan-400">📦 {payload[0].payload.orders} orders</p>
    </div>
  );
};

export default function CountrySalesChart({ data }) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xl">🌍</span>
        <div>
          <h2 className="text-sm font-bold text-slate-200">Revenue by Country</h2>
          <p className="text-xs text-slate-500">Top performing markets</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false}
            tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
          <YAxis dataKey="label" type="category" tick={{ fontSize: 11, fill: "#94a3b8" }} width={70} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar dataKey="revenue" radius={[0, 6, 6, 0]} maxBarSize={22}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
