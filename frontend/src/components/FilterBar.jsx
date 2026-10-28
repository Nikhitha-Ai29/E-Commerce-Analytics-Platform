export default function FilterBar({ filters, onChange, options }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });
  const clear = () => onChange({ startDate: "", endDate: "", country: "", status: "", productId: "" });
  const hasFilters = Object.values(filters).some(Boolean);

  const inputCls = "bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:bg-white/8 transition-all w-full";

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔍</span>
          <span className="text-sm font-semibold text-slate-300">Filters</span>
          {hasFilters && (
            <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2 py-0.5 rounded-full border border-indigo-500/30">
              Active
            </span>
          )}
        </div>
        {hasFilters && (
          <button onClick={clear} className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1">
            ✕ Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-500 font-medium">Start Date</label>
          <input type="date" value={filters.startDate} onChange={set("startDate")} className={inputCls}
            style={{ colorScheme: "dark" }} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-500 font-medium">End Date</label>
          <input type="date" value={filters.endDate} onChange={set("endDate")} className={inputCls}
            style={{ colorScheme: "dark" }} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-500 font-medium">Country</label>
          <select value={filters.country} onChange={set("country")} className={inputCls}>
            <option value="" className="bg-slate-900">All Countries</option>
            {options.countries.map(country => <option key={country} value={country} className="bg-slate-900">{country}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-500 font-medium">Product</label>
          <select value={filters.productId} onChange={set("productId")} className={inputCls}>
            <option value="" className="bg-slate-900">All Products</option>
            {options.products.map(product => (
              <option key={product.productId} value={product.productId} className="bg-slate-900">{product.productName}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-500 font-medium">Order Status</label>
          <select value={filters.status} onChange={set("status")} className={inputCls}>
            <option value="" className="bg-slate-900">All Statuses</option>
            <option value="COMPLETED" className="bg-slate-900">✅ Completed</option>
            <option value="PENDING"   className="bg-slate-900">⏳ Pending</option>
            <option value="CANCELLED" className="bg-slate-900">❌ Cancelled</option>
          </select>
        </div>
      </div>
    </div>
  );
}
