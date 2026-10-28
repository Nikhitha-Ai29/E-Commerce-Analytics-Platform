import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchKpi,
  fetchMonthlySales,
  fetchCountrySales,
  fetchTopProducts,
  fetchOrders,
  fetchFilterOptions,
  fetchMonthlyCancellations,
  fetchCancellationReasons,
  fetchCancelledProducts,
  fetchCountryCancellations,
} from "../api/client";

export function useAnalytics(filters) {
  const [data, setData] = useState({
    kpi: null, monthly: [], country: [], products: [], orders: [], options: { countries: [], products: [] },
    monthlyCancellations: [], cancellationReasons: [], cancelledProducts: [], countryCancellations: [],
    updatedAt: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const inFlight = useRef(false);
  const refreshAgain = useRef(false);

  const load = useCallback(async () => {
    if (inFlight.current) {
      refreshAgain.current = true;
      return;
    }
    inFlight.current = true;
    setLoading(true);
    setError(null);
    try {
      const [kpi, monthly, country, products, orders, options, monthlyCancellations,
        cancellationReasons, cancelledProducts, countryCancellations] = await Promise.all([
        fetchKpi(filters),
        fetchMonthlySales(filters),
        fetchCountrySales(filters),
        fetchTopProducts(filters),
        fetchOrders(filters),
        fetchFilterOptions(),
        fetchMonthlyCancellations(filters),
        fetchCancellationReasons(filters),
        fetchCancelledProducts(filters),
        fetchCountryCancellations(filters),
      ]);
      setData({
        kpi:      kpi.data,
        monthly:  monthly.data,
        country:  country.data,
        products: products.data,
        orders:   orders.data,
        options:  options.data,
        monthlyCancellations: monthlyCancellations.data,
        cancellationReasons: cancellationReasons.data,
        cancelledProducts: cancelledProducts.data,
        countryCancellations: countryCancellations.data,
        updatedAt: new Date(),
      });
    } catch (e) {
      const responseMessage = e.response?.data?.message;
      setError(responseMessage || e.message || "Failed to load analytics data");
    } finally {
      inFlight.current = false;
      setLoading(false);
      if (refreshAgain.current) {
        refreshAgain.current = false;
        window.setTimeout(load, 0);
      }
    }
  }, [JSON.stringify(filters)]); // eslint-disable-line

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!document.hidden) load();
    }, 7000);
    return () => window.clearInterval(timer);
  }, [load]);

  return { data, loading, error, reload: load };
}
