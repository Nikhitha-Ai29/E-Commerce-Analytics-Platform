package com.analytics.repository;

import com.analytics.model.Order;
import com.google.cloud.spring.data.spanner.repository.SpannerRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends SpannerRepository<Order, Long> {
}
