import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LabelList
} from "recharts";

const COLORS = [
  "#6366f1","#8b5cf6","#a855f7","#06b6d4","#10b981",
  "#f59e0b","#ef4444","#ec4899","#3b82f6","#14b8a6"
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl p-3 text-xs shadow-2xl border border-white/10">
      <p className="text-slate-300 font-bold mb-1">🛍 {payload[0].payload.label}</p>
      <p style={{ color: payload[0].fill }}>💰 ${Number(payload[0].value).toLocaleString()}</p>
      <p className="text-cyan-400">📦 {payload[0].payload.orders} orders</p>
    </div>
  );
};

export default function TopProductsChart({ data }) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xl">🏆</span>
        <div>
          <h2 className="text-sm font-bold text-slate-200">Top Products by Revenue</h2>
          <p className="text-xs text-slate-500">Best performing products</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 80 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#64748b", angle: -35, textAnchor: "end" }}
            axisLine={false} tickLine={false} interval={0} />
          <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false}
            tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={40}>
            <LabelList dataKey="revenue" position="top" formatter={(v) => `$${(v/1000).toFixed(1)}k`}
              style={{ fontSize: "9px", fill: "#64748b" }} />
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
