package com.analytics.repository;

import com.analytics.model.Product;
import com.google.cloud.spring.data.spanner.repository.SpannerRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends SpannerRepository<Product, Long> {
}
