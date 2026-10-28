package com.analytics.model;

import com.google.cloud.spring.data.spanner.core.mapping.Column;
import com.google.cloud.spring.data.spanner.core.mapping.PrimaryKey;
import com.google.cloud.spring.data.spanner.core.mapping.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "OrderStatusHistory")
public class OrderStatusHistory {

    @PrimaryKey
    @Column(name = "history_id")
    private String historyId;

    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "previous_status")
    private String previousStatus;

    @Column(name = "new_status")
    private String newStatus;

    @Column(name = "changed_at")
    private Instant changedAt;

    @Column(name = "cancellation_reason")
    private String cancellationReason;
}
