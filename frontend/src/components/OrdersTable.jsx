import { Fragment, useState } from "react";
import { updateOrderStatus } from "../api/client";

const COLS = [
  { key: "orderId",      label: "Order ID" },
  { key: "customerName", label: "Customer" },
  { key: "productName",  label: "Product" },
  { key: "category",     label: "Category" },
  { key: "quantity",     label: "Qty" },
  { key: "totalPrice",   label: "Revenue" },
  { key: "status",       label: "Status" },
  { key: "orderDate",    label: "Date" },
  { key: "country",      label: "Country" },
];

const STATUS_STYLE = {
  COMPLETED: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  PENDING:   "bg-amber-500/15   text-amber-400   border border-amber-500/30",
  CANCELLED: "bg-red-500/15     text-red-400     border border-red-500/30",
};
const STATUS_DOT = { COMPLETED: "bg-emerald-400", PENDING: "bg-amber-400", CANCELLED: "bg-red-400" };

export default function OrdersTable({ data, onUpdated }) {
  const [search, setSearch] = useState("");
  const [page, setPage]     = useState(1);
  const [sortKey, setSortKey]   = useState("orderDate");
  const [sortDir, setSortDir]   = useState("desc");
  const [drafts, setDrafts] = useState({});
  const [savingOrder, setSavingOrder] = useState(null);
  const [updateError, setUpdateError] = useState("");
  const PAGE_SIZE = 15;

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = data
    .filter(row => Object.values(row).some(v => String(v).toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      const cmp = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const editStatus = (row, status) => setDrafts(current => {
    const next = { ...current };
    if (status === row.status) {
      delete next[row.orderId];
      return next;
    }
    next[row.orderId] = { status, reason: current[row.orderId]?.reason ?? "" };
    return next;
  });

  const saveStatus = async (row) => {
    const draft = drafts[row.orderId];
    if (!draft) return;
    setSavingOrder(row.orderId);
    setUpdateError("");
    try {
      await updateOrderStatus(row.orderId, draft.status, draft.reason);
      setDrafts(current => {
        const next = { ...current };
        delete next[row.orderId];
        return next;
      });
      await onUpdated();
    } catch (error) {
      setUpdateError(error.response?.data?.message || error.message || "Could not update order status");
    } finally {
      setSavingOrder(null);
    }
  };

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="text-xl">📋</span>
          <div>
            <h2 className="text-sm font-bold text-slate-200">Orders Table</h2>
            <p className="text-xs text-slate-500">{filtered.length} records</p>
          </div>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
          <input type="text" placeholder="Search orders..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 w-56 transition-all" />
        </div>
      </div>

      {updateError && <p role="alert" className="mb-4 text-xs text-red-400">{updateError}</p>}
      <p className="mb-4 text-xs text-slate-500">
        The connected database stores current order status only. Cancellation reasons and status history are not supported by its schema.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/5">
              {COLS.map(c => (
                <th key={c.key} onClick={() => toggleSort(c.key)}
                  className="pb-3 pr-4 text-left text-slate-500 font-semibold uppercase tracking-wider cursor-pointer hover:text-indigo-400 transition-colors select-none whitespace-nowrap">
                  {c.label} {sortKey === c.key ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
            <tr><td colSpan={COLS.length} className="py-12 text-center text-slate-600">No orders found</td></tr>
            )}
            {rows.map((row, i) => (
              <Fragment key={row.orderId}>
              <tr className={`border-b border-white/5 hover:bg-white/3 transition-colors ${i % 2 === 0 ? "" : "bg-white/1"}`}>
                <td className="py-3 pr-4 font-mono text-indigo-400">{row.orderId}</td>
                <td className="py-3 pr-4 text-slate-300 font-medium">{row.customerName}</td>
                <td className="py-3 pr-4 text-slate-300">{row.productName}</td>
                <td className="py-3 pr-4">
                  <span className="bg-violet-500/15 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-full text-xs">
                    {row.category || "—"}
                  </span>
                </td>
                <td className="py-3 pr-4 text-slate-400">{row.quantity}</td>
                <td className="py-3 pr-4 text-emerald-400 font-semibold">${row.totalPrice?.toFixed(2)}</td>
                <td className="py-3 pr-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit ${STATUS_STYLE[row.status] || ""}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[row.status] || "bg-slate-400"}`} />
                    {row.status}
                  </span>
                  <select aria-label={`Change status for order ${row.orderId}`}
                    value={drafts[row.orderId]?.status ?? row.status}
                    onChange={event => editStatus(row, event.target.value)}
                    className="mt-2 block rounded-lg bg-slate-900 border border-white/10 px-2 py-1 text-xs text-slate-300">
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED" disabled={row.status !== "CANCELLED"}>Cancelled</option>
                  </select>
                  {drafts[row.orderId] && drafts[row.orderId].status !== row.status && (
                    <button type="button" onClick={() => saveStatus(row)}
                      disabled={savingOrder === row.orderId}
                      className="mt-2 block rounded-lg bg-indigo-600 px-2 py-1 text-xs text-white disabled:opacity-50">
                      {savingOrder === row.orderId ? "Saving…" : "Save status"}
                    </button>
                  )}
                </td>
                <td className="py-3 pr-4 text-slate-500">{row.orderDate}</td>
                <td className="py-3 pr-4 text-slate-400">🌍 {row.country}</td>
              </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
        <span className="text-xs text-slate-600">
          Showing {Math.min((page-1)*PAGE_SIZE+1, filtered.length)}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}
        </span>
        <div className="flex gap-1">
          <button onClick={() => setPage(1)} disabled={page === 1}
            className="px-2 py-1 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 disabled:opacity-30 transition-all">«</button>
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
            className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 disabled:opacity-30 transition-all">Prev</button>
          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
            return (
              <button key={p} onClick={() => setPage(p)}
                className={`px-3 py-1 rounded-lg text-xs transition-all ${page === p ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"}`}>
                {p}
              </button>
            );
          })}
          <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
            className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 disabled:opacity-30 transition-all">Next</button>
          <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
            className="px-2 py-1 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 disabled:opacity-30 transition-all">»</button>
        </div>
      </div>
    </div>
  );
}
