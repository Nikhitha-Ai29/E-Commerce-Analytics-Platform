import { useEffect, useState } from "react";

const ICONS = {
  "Total Revenue":    { icon: "💰", gradient: "from-violet-600 to-indigo-600",  glow: "rgba(99,102,241,0.4)"  },
  "Total Orders":     { icon: "📦", gradient: "from-cyan-500 to-blue-600",      glow: "rgba(6,182,212,0.4)"   },
  "Avg Order Value":  { icon: "📈", gradient: "from-emerald-500 to-teal-600",   glow: "rgba(16,185,129,0.4)"  },
  "Completed Orders": { icon: "✅", gradient: "from-green-500 to-emerald-600",  glow: "rgba(34,197,94,0.4)"   },
  "Pending Orders":   { icon: "⏳", gradient: "from-amber-500 to-orange-600",   glow: "rgba(245,158,11,0.4)"  },
  "Cancellation Rate":{ icon: "❌", gradient: "from-rose-500 to-red-600",      glow: "rgba(239,68,68,0.4)"   },
  "Revenue Lost":     { icon: "💸", gradient: "from-orange-500 to-rose-600",   glow: "rgba(249,115,22,0.4)"  },
};

export default function KpiCard({ label, value, sub }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t); }, []);
  const meta = ICONS[label] || { icon: "📊", gradient: "from-pink-500 to-rose-600", glow: "rgba(236,72,153,0.4)" };

  return (
    <div
      className={`glass glass-hover rounded-2xl p-6 flex flex-col gap-3 relative overflow-hidden transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      style={{ boxShadow: `0 8px 32px ${meta.glow}` }}
    >
      {/* Background gradient blob */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${meta.gradient} opacity-20 blur-xl`} />

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</span>
        <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-lg shadow-lg`}>
          {meta.icon}
        </span>
      </div>

      <div className="count-up">
        <span className="text-4xl font-extrabold gradient-text">{value ?? "—"}</span>
      </div>

      {sub && <span className="text-xs text-slate-500">{sub}</span>}

      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${meta.gradient} opacity-60`} />
    </div>
  );
}
