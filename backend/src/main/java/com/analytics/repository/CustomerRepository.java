package com.analytics.repository;

import com.analytics.model.Customer;
import com.google.cloud.spring.data.spanner.repository.SpannerRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends SpannerRepository<Customer, Long> {
}
