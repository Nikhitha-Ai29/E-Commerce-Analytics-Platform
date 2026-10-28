package com.analytics.repository;

import com.analytics.model.OrderStatusHistory;
import com.google.cloud.spring.data.spanner.repository.SpannerRepository;

import java.util.List;

public interface OrderStatusHistoryRepository extends SpannerRepository<OrderStatusHistory, String> {
    List<OrderStatusHistory> findByOrderIdOrderByChangedAtDesc(Long orderId);
}
