import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = { COMPLETED: "#10b981", PENDING: "#f59e0b", CANCELLED: "#ef4444" };
const ICONS  = { COMPLETED: "✅", PENDING: "⏳", CANCELLED: "❌" };

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="glass rounded-xl p-3 text-xs shadow-2xl border border-white/10">
      <p style={{ color: d.payload.fill }} className="font-bold">{ICONS[d.name]} {d.name}</p>
      <p className="text-slate-300">{d.value} orders ({d.payload.percent}%)</p>
    </div>
  );
};

export default function OrderStatusChart({ orders, summary }) {
  const counts = summary ? {
    COMPLETED: summary.completedOrderCount || 0,
    PENDING: summary.pendingOrderCount || 0,
    CANCELLED: summary.cancelledOrderCount || 0,
  } : orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});
  const total = summary?.orderCount || Object.values(counts).reduce((sum, count) => sum + count, 0) || 1;
  const data = Object.entries(counts).map(([name, value]) => ({
    name, value, fill: COLORS[name] || "#6366f1",
    percent: ((value / total) * 100).toFixed(1)
  }));

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xl">🍩</span>
        <div>
          <h2 className="text-sm font-bold text-slate-200">Order Status Breakdown</h2>
          <p className="text-xs text-slate-500">{summary?.orderCount ?? orders.length} total orders</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={65} outerRadius={100}
            paddingAngle={4} dataKey="value" strokeWidth={0}>
            {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend formatter={(v) => <span style={{ color: "#94a3b8", fontSize: "12px" }}>{ICONS[v]} {v}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
