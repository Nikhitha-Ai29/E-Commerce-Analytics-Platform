package com.analytics.controller;

import com.analytics.model.*;
import com.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    // Analytics endpoints accept date, country, status, and product filters.

    @GetMapping("/kpi")
    public KpiResponse getKpi(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String productId) {
        return analyticsService.getKpi(startDate, endDate, country, status, productId);
    }

    @GetMapping("/monthly-sales")
    public List<MonthlySales> getMonthlySales(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String productId) {
        return analyticsService.getMonthlySales(startDate, endDate, country, status, productId);
    }

    @GetMapping("/country-sales")
    public List<SalesEntry> getCountrySales(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String productId) {
        return analyticsService.getCountrySales(startDate, endDate, country, status, productId);
    }

    @GetMapping("/top-products")
    public List<SalesEntry> getTopProducts(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String productId) {
        return analyticsService.getTopProducts(startDate, endDate, country, status, productId);
    }

    @GetMapping("/orders")
    public List<OrderRow> getOrders(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String productId) {
        return analyticsService.getOrdersTable(startDate, endDate, country, status, productId);
    }

    @GetMapping("/filter-options")
    public FilterOptions getFilterOptions() {
        return analyticsService.getFilterOptions();
    }

    @GetMapping("/cancellations/monthly")
    public List<MonthlyCancellation> getMonthlyCancellations(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String productId) {
        return analyticsService.getMonthlyCancellations(startDate, endDate, country, status, productId);
    }

    @GetMapping("/cancellations/reasons")
    public List<CancellationEntry> getCancellationReasons(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String productId) {
        return analyticsService.getCancellationReasons(startDate, endDate, country, status, productId);
    }

    @GetMapping("/cancellations/products")
    public List<CancellationEntry> getCancelledProducts(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String productId) {
        return analyticsService.getCancelledProducts(startDate, endDate, country, status, productId);
    }

    @GetMapping("/cancellations/countries")
    public List<CancellationEntry> getCountryCancellations(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String productId) {
        return analyticsService.getCountryCancellations(startDate, endDate, country, status, productId);
    }

    @PatchMapping("/orders/{orderId}/status")
    public void updateOrderStatus(@PathVariable long orderId,
                                  @RequestBody OrderStatusUpdateRequest request) {
        analyticsService.updateOrderStatus(orderId, request.getStatus(), request.getCancellationReason());
    }

    @GetMapping("/orders/{orderId}/status-history")
    public List<OrderStatusHistory> getOrderStatusHistory(@PathVariable long orderId) {
        return analyticsService.getOrderStatusHistory(orderId);
    }
}
