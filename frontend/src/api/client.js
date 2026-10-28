import axios from "axios";

// VITE_API_URL is set at build time when the API is on a different origin.
// In production (Cloud Run), the frontend is served from the same origin
// or you set the env var during the Docker build.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  timeout: 30000,
});

// ---- Upload endpoints ----
export const uploadCustomers = (file) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/api/upload/customers", form);
};

export const uploadProducts = (file) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/api/upload/products", form);
};

export const uploadOrders = (file) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/api/upload/orders", form);
};

// ---- Analytics endpoints ----
// filters = { startDate, endDate, country, status, productId }
const toParams = (filters) =>
  Object.fromEntries(Object.entries(filters).filter(([, v]) => v));

export const fetchKpi           = (f) => api.get("/api/analytics/kpi",            { params: toParams(f) });
export const fetchMonthlySales  = (f) => api.get("/api/analytics/monthly-sales",  { params: toParams(f) });
export const fetchCountrySales  = (f) => api.get("/api/analytics/country-sales",  { params: toParams(f) });
export const fetchTopProducts   = (f) => api.get("/api/analytics/top-products",   { params: toParams(f) });
export const fetchOrders        = (f) => api.get("/api/analytics/orders",         { params: toParams(f) });
export const fetchFilterOptions = () => api.get("/api/analytics/filter-options");
export const fetchMonthlyCancellations = (f) => api.get("/api/analytics/cancellations/monthly", { params: toParams(f) });
export const fetchCancellationReasons = (f) => api.get("/api/analytics/cancellations/reasons", { params: toParams(f) });
export const fetchCancelledProducts = (f) => api.get("/api/analytics/cancellations/products", { params: toParams(f) });
export const fetchCountryCancellations = (f) => api.get("/api/analytics/cancellations/countries", { params: toParams(f) });
export const updateOrderStatus = (orderId, status, cancellationReason) =>
  api.patch(`/api/analytics/orders/${orderId}/status`, { status, cancellationReason });
export const fetchOrderStatusHistory = (orderId) =>
  api.get(`/api/analytics/orders/${orderId}/status-history`);
