import { useState } from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import FilterBar from "../components/FilterBar";
import KpiCard from "../components/KpiCard";
import MonthlySalesChart from "../components/MonthlySalesChart";
import CountrySalesChart from "../components/CountrySalesChart";
import TopProductsChart from "../components/TopProductsChart";
import OrderStatusChart from "../components/OrderStatusChart";
import OrdersTable from "../components/OrdersTable";
import CsvUpload from "../components/CsvUpload";
import MonthlyCancellationChart from "../components/MonthlyCancellationChart";
import CancellationBreakdownChart from "../components/CancellationBreakdownChart";

const DEFAULT_FILTERS = { startDate: "", endDate: "", country: "", status: "", productId: "" };

const NAV = [
  { id: "overview",  label: "Overview",   icon: "🏠" },
  { id: "sales",     label: "Sales",      icon: "📈" },
  { id: "products",  label: "Products",   icon: "🛍" },
  { id: "orders",    label: "Orders",     icon: "📋" },
  { id: "upload",    label: "Upload",     icon: "⬆️" },
];

function fmt(n) {
  if (n == null) return "—";
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Dashboard() {
  const [filters, setFilters]   = useState(DEFAULT_FILTERS);
  const [activeNav, setActiveNav] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { data, loading, error, reload } = useAnalytics(filters);

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(135deg, #0a0e1a 0%, #0d1224 50%, #0a0e1a 100%)" }}>

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-56" : "w-16"} transition-all duration-300 flex flex-col glass border-r border-white/5 min-h-screen sticky top-0`}>
        {/* Logo */}
        <div className="px-4 py-5 border-b border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold shadow-lg glow-pulse flex-shrink-0">
            ⚡
          </div>
          {sidebarOpen && (
            <div>
              <p className="text-xs font-bold text-slate-200 leading-tight">Spanner</p>
              <p className="text-xs text-indigo-400 leading-tight">Analytics</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 flex flex-col gap-1">
          {NAV.map(n => (
            <button key={n.id} onClick={() => setActiveNav(n.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all w-full text-left
                ${activeNav === n.id
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/5"}`}>
              <span className="text-base flex-shrink-0">{n.icon}</span>
              {sidebarOpen && <span className="font-medium">{n.label}</span>}
            </button>
          ))}
        </nav>

        {/* Collapse toggle */}
        <button onClick={() => setSidebarOpen(o => !o)}
          className="mx-2 mb-4 px-3 py-2 rounded-xl text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-all text-xs flex items-center gap-2">
          <span>{sidebarOpen ? "◀" : "▶"}</span>
          {sidebarOpen && <span>Collapse</span>}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Header */}
        <header className="glass border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-extrabold gradient-text">Cloud Spanner Analytics</h1>
            <p className="text-xs text-slate-600">Global Sales Intelligence Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            {loading && (
              <div className="flex items-center gap-2 text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full">
                <span className="animate-spin">⟳</span> Loading…
              </div>
            )}
            {data.updatedAt && !loading && (
              <div className="hidden md:block text-xs text-slate-500">
                Updated {data.updatedAt.toLocaleTimeString()}
              </div>
            )}
            {error && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full">
                ⚠ {error}
              </div>
            )}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold">
              GC
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 flex flex-col gap-6 overflow-auto">

          {/* Filters always visible */}
          <FilterBar filters={filters} onChange={setFilters} options={data.options} />

          {/* OVERVIEW TAB */}
          {activeNav === "overview" && (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7 gap-4">
                <KpiCard label="Total Revenue"    value={fmt(data.kpi?.totalRevenue)} sub="Excludes cancelled orders" />
                <KpiCard label="Total Orders"     value={data.kpi?.orderCount?.toLocaleString() ?? "—"} sub="Across all regions" />
                <KpiCard label="Avg Order Value"  value={fmt(data.kpi?.avgOrderValue)} sub="Per transaction" />
                <KpiCard label="Cancellation Rate" value={`${Number(data.kpi?.cancellationRate ?? 0).toFixed(1)}%`} sub={`${data.kpi?.cancelledOrderCount?.toLocaleString() ?? "—"} cancelled orders`} />
                <KpiCard label="Completed Orders" value={data.kpi?.completedOrderCount?.toLocaleString() ?? "—"} sub="Successfully fulfilled" />
                <KpiCard label="Pending Orders" value={data.kpi?.pendingOrderCount?.toLocaleString() ?? "—"} sub="Awaiting fulfillment" />
                <KpiCard label="Revenue Lost" value={fmt(data.kpi?.revenueLost)} sub="Value of cancelled orders" />
              </div>

              {/* Charts row 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MonthlySalesChart data={data.monthly} />
                <OrderStatusChart  orders={data.orders} summary={data.kpi} />
              </div>

              {/* Charts row 2 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CountrySalesChart data={data.country} />
                <TopProductsChart  data={data.products} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MonthlyCancellationChart data={data.monthlyCancellations} />
                <CancellationBreakdownChart data={data.cancellationReasons}
                  title="Cancellation Reasons" subtitle="Recorded reasons; older orders may not have one" icon="📝" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CancellationBreakdownChart data={data.cancelledProducts}
                  title="Top-Cancelled Products" subtitle="Products with the most cancelled orders" icon="🛍" />
                <CancellationBreakdownChart data={data.countryCancellations}
                  title="Cancellations by Country" subtitle="Cancelled orders across markets" icon="🌍" />
              </div>
            </>
          )}

          {/* SALES TAB */}
          {activeNav === "sales" && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <KpiCard label="Total Revenue"   value={fmt(data.kpi?.totalRevenue)} />
                <KpiCard label="Avg Order Value" value={fmt(data.kpi?.avgOrderValue)} />
              </div>
              <MonthlySalesChart data={data.monthly} />
              <CountrySalesChart data={data.country} />
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeNav === "products" && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <KpiCard label="Total Orders" value={data.kpi?.orderCount?.toLocaleString() ?? "—"} />
                <KpiCard label="Revenue Lost" value={fmt(data.kpi?.revenueLost)} />
              </div>
              <TopProductsChart data={data.products} />
              <CancellationBreakdownChart data={data.cancelledProducts}
                title="Top-Cancelled Products" subtitle="Products with the most cancelled orders" icon="🛍" />
              <OrderStatusChart orders={data.orders} summary={data.kpi} />
            </div>
          )}

          {/* ORDERS TAB */}
          {activeNav === "orders" && (
            <OrdersTable data={data.orders} onUpdated={reload} />
          )}

          {/* UPLOAD TAB */}
          {activeNav === "upload" && (
            <div className="flex flex-col gap-4">
              <div className="glass rounded-2xl p-5">
                <h2 className="text-sm font-bold text-slate-200 mb-1">📂 Data Import</h2>
                <p className="text-xs text-slate-500">Upload CSV files to populate Cloud Spanner. Upload in order: Customers → Products → Orders.</p>
              </div>
              <CsvUpload onUploaded={reload} />
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
