package com.analytics.model;

import com.google.cloud.spring.data.spanner.core.mapping.Column;
import com.google.cloud.spring.data.spanner.core.mapping.PrimaryKey;
import com.google.cloud.spring.data.spanner.core.mapping.Table;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.Instant;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "Orders")
public class Order {

    @PrimaryKey
    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "product_id")
    private Long productId;

    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "quantity")
    private Long quantity;

    @Column(name = "unit_price")
    private BigDecimal unitPrice;

    @Column(name = "order_status")
    private String orderStatus;

    @Column(name = "order_date")
    private Instant orderDate;

}
