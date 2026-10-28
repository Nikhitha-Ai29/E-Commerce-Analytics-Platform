package com.analytics.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// DTO for monthly sales — used in line chart
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MonthlySales {
    private String month;   // e.g. "2024-01"
    private Double revenue;
    private Long orders;
}
