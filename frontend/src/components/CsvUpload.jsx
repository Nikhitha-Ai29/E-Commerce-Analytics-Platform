import { useState } from "react";
import { uploadCustomers, uploadProducts, uploadOrders } from "../api/client";

const TYPES = [
  { key: "customers", label: "Customers", icon: "👥", fn: uploadCustomers,
    hint: "customer_id, name, email, country", color: "from-violet-600 to-indigo-600", glow: "rgba(99,102,241,0.3)" },
  { key: "products",  label: "Products",  icon: "🛍", fn: uploadProducts,
    hint: "product_id, name, category, unit_price", color: "from-cyan-500 to-blue-600", glow: "rgba(6,182,212,0.3)" },
  { key: "orders",    label: "Orders",    icon: "📦", fn: uploadOrders,
    hint: "order_id, customer_id, product_id, quantity, total_price, status, order_date, country, cancellation_reason (optional)",
    color: "from-emerald-500 to-teal-600", glow: "rgba(16,185,129,0.3)" },
];

export default function CsvUpload({ onUploaded }) {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [open, setOpen] = useState(false);

  const handle = (type) => async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(l => ({ ...l, [type.key]: true }));
    try {
      const res = await type.fn(file);
      setResults(r => ({ ...r, [type.key]: res.data }));
      onUploaded();
    } catch (err) {
      setResults(r => ({ ...r, [type.key]: { error: err.message } }));
    } finally {
      setLoading(l => ({ ...l, [type.key]: false }));
    }
  };

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/3 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-xl">⬆️</span>
          <div className="text-left">
            <p className="text-sm font-bold text-slate-200">Upload CSV Data</p>
            <p className="text-xs text-slate-500">Import customers, products & orders</p>
          </div>
        </div>
        <span className={`text-slate-500 transition-transform duration-300 ${open ? "rotate-180" : ""}`}>▼</span>
      </button>

      {open && (
        <div className="px-6 pb-6 border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {TYPES.map(type => (
              <div key={type.key} className="rounded-xl border border-white/8 p-4 flex flex-col gap-3 hover:border-white/15 transition-all"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center text-lg shadow-lg`}
                    style={{ boxShadow: `0 4px 15px ${type.glow}` }}>
                    {type.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{type.label}</p>
                    <p className="text-xs text-slate-600 leading-tight">{type.hint}</p>
                  </div>
                </div>

                {results[type.key] && (
                  <div className={`text-xs px-3 py-2 rounded-lg ${results[type.key].error ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
                    <p>
                      {results[type.key].error
                        ? `❌ ${results[type.key].error}`
                        : `✅ ${results[type.key].saved} rows saved${results[type.key].errors?.length > 0 ? ` · ${results[type.key].errors.length} skipped` : ""}`
                      }
                    </p>
                    {results[type.key].warnings?.map((warning) => (
                      <p key={warning} className="mt-1 text-amber-300">{warning}</p>
                    ))}
                  </div>
                )}

                <label className="cursor-pointer mt-auto">
                  <div className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white transition-all
                    bg-gradient-to-r ${type.color} hover:opacity-90 active:scale-95 ${loading[type.key] ? "opacity-60 cursor-wait" : ""}`}>
                    {loading[type.key] ? (
                      <><span className="animate-spin">⟳</span> Uploading…</>
                    ) : (
                      <><span>📁</span> Choose CSV File</>
                    )}
                  </div>
                  <input type="file" accept=".csv" className="hidden" onChange={handle(type)} disabled={loading[type.key]} />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
