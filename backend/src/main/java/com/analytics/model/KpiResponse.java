package com.analytics.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// DTO returned by /api/analytics/kpi
@Data
@AllArgsConstructor
@NoArgsConstructor
public class KpiResponse {
    private Double totalRevenue;
    private Long orderCount;
    private Double avgOrderValue;
    private Double cancellationRate;
    private Long cancelledOrderCount;
    private Long completedOrderCount;
    private Long pendingOrderCount;
    private Double revenueLost;
}
