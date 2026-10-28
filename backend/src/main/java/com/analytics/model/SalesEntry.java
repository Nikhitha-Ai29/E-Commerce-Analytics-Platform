package com.analytics.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Generic label+value DTO used for country sales and top products bar charts
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SalesEntry {
    private String label;   // country name or product name
    private Double revenue;
    private Long orders;
}
