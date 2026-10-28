package com.analytics.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// DTO for the filterable orders table — result of JOIN across orders, customers, products
@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderRow {
    private String orderId;
    private String customerName;
    private String productName;
    private String category;
    private Long quantity;
    private Double totalPrice;
    private String status;
    private String orderDate;
    private String country;
    private String statusUpdatedAt;
    private String cancellationReason;
}
