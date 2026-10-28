package com.analytics.model;

import lombok.Data;

@Data
public class OrderStatusUpdateRequest {
    private String status;
    private String cancellationReason;
}
