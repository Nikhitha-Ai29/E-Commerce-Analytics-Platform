package com.analytics.service;

import com.analytics.model.*;
import com.analytics.repository.OrderRepository;
import com.google.cloud.Timestamp;
import com.google.cloud.spring.data.spanner.core.SpannerQueryOptions;
import com.google.cloud.spring.data.spanner.core.SpannerTemplate;
import com.google.cloud.spanner.Statement;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final SpannerTemplate spannerTemplate;
    private final OrderRepository orderRepository;

    public KpiResponse getKpi(String startDate, String endDate, String country, String status, String productId) {
        StringBuilder sql = new StringBuilder("""
            SELECT
              COALESCE(SUM(IF(o.order_status != 'CANCELLED',
                COALESCE(o.quantity, 0) * COALESCE(o.unit_price, NUMERIC '0'), NUMERIC '0')), NUMERIC '0') AS totalRevenue,
              COUNT(*) AS orderCount,
              COALESCE(AVG(IF(o.order_status != 'CANCELLED',
                COALESCE(o.quantity, 0) * COALESCE(o.unit_price, NUMERIC '0'), NULL)), NUMERIC '0') AS avgOrderValue,
              COUNTIF(o.order_status = 'CANCELLED') AS cancelledOrderCount,
              COUNTIF(o.order_status = 'COMPLETED') AS completedOrderCount,
              COUNTIF(o.order_status = 'PENDING') AS pendingOrderCount,
              COALESCE(SUM(IF(o.order_status = 'CANCELLED',
                COALESCE(o.quantity, 0) * COALESCE(o.unit_price, NUMERIC '0'), NUMERIC '0')), NUMERIC '0') AS revenueLost
            FROM Orders o
            LEFT JOIN Customers c ON c.customer_id = o.customer_id
            LEFT JOIN Products p ON p.product_id = o.product_id
            WHERE TRUE
            """);
        appendFilters(sql, startDate, endDate, country, status, productId);
        Statement statement = buildStatement(sql, startDate, endDate, country, status, productId);

        return spannerTemplate.query(
            row -> {
                long totalOrders = row.getLong("orderCount");
                long cancelledOrders = row.getLong("cancelledOrderCount");
                double cancellationRate = totalOrders == 0 ? 0.0 : cancelledOrders * 100.0 / totalOrders;
                return new KpiResponse(
                    row.getBigDecimal("totalRevenue").doubleValue(),
                    totalOrders,
                    row.getBigDecimal("avgOrderValue").doubleValue(),
                    cancellationRate,
                    cancelledOrders,
                    row.getLong("completedOrderCount"),
                    row.getLong("pendingOrderCount"),
                    row.getBigDecimal("revenueLost").doubleValue()
                );
            },
            statement,
            new SpannerQueryOptions()
        ).stream().findFirst().orElse(new KpiResponse(0.0, 0L, 0.0, 0.0, 0L, 0L, 0L, 0.0));
    }

    public List<MonthlySales> getMonthlySales(String startDate, String endDate, String country, String status,
                                               String productId) {
        StringBuilder sql = new StringBuilder("""
            SELECT
              FORMAT_TIMESTAMP('%Y-%m', o.order_date, 'UTC') AS month,
              SUM(IF(o.order_status != 'CANCELLED',
                COALESCE(o.quantity, 0) * COALESCE(o.unit_price, NUMERIC '0'), NUMERIC '0')) AS revenue,
              COUNT(*) AS orders
            FROM Orders o
            LEFT JOIN Customers c ON c.customer_id = o.customer_id
            LEFT JOIN Products p ON p.product_id = o.product_id
            WHERE TRUE
            """);
        appendFilters(sql, startDate, endDate, country, status, productId);
        sql.append(" GROUP BY month ORDER BY month");
        Statement statement = buildStatement(sql, startDate, endDate, country, status, productId);

        return spannerTemplate.query(
            row -> new MonthlySales(
                row.getString("month"),
                row.getBigDecimal("revenue").doubleValue(),
                row.getLong("orders")
            ),
            statement,
            new SpannerQueryOptions()
        );
    }

    public List<SalesEntry> getCountrySales(String startDate, String endDate, String country, String status,
                                             String productId) {
        StringBuilder sql = new StringBuilder("""
            SELECT
              c.country AS label,
              SUM(IF(o.order_status != 'CANCELLED',
                COALESCE(o.quantity, 0) * COALESCE(o.unit_price, NUMERIC '0'), NUMERIC '0')) AS revenue,
              COUNT(*) AS orders
            FROM Orders o
            JOIN Customers c ON c.customer_id = o.customer_id
            LEFT JOIN Products p ON p.product_id = o.product_id
            WHERE c.country IS NOT NULL
            """);
        appendFilters(sql, startDate, endDate, country, status, productId);
        sql.append(" GROUP BY label ORDER BY revenue DESC LIMIT 20");
        Statement statement = buildStatement(sql, startDate, endDate, country, status, productId);

        return spannerTemplate.query(
            row -> new SalesEntry(
                row.getString("label"),
                row.getBigDecimal("revenue").doubleValue(),
                row.getLong("orders")
            ),
            statement,
            new SpannerQueryOptions()
        );
    }

    public List<SalesEntry> getTopProducts(String startDate, String endDate, String country, String status,
                                            String productId) {
        StringBuilder sql = new StringBuilder("""
            SELECT
              p.product_name AS label,
              SUM(IF(o.order_status != 'CANCELLED',
                COALESCE(o.quantity, 0) * COALESCE(o.unit_price, NUMERIC '0'), NUMERIC '0')) AS revenue,
              COUNT(*) AS orders
            FROM Orders o
            JOIN Products p ON p.product_id = o.product_id
            LEFT JOIN Customers c ON c.customer_id = o.customer_id
            WHERE TRUE
            """);
        appendFilters(sql, startDate, endDate, country, status, productId);
        sql.append(" GROUP BY label ORDER BY revenue DESC LIMIT 10");
        Statement statement = buildStatement(sql, startDate, endDate, country, status, productId);

        return spannerTemplate.query(
            row -> new SalesEntry(
                row.getString("label"),
                row.getBigDecimal("revenue").doubleValue(),
                row.getLong("orders")
            ),
            statement,
            new SpannerQueryOptions()
        );
    }

    public List<OrderRow> getOrdersTable(String startDate, String endDate, String country, String status,
                                          String productId) {
        StringBuilder sql = new StringBuilder("""
            SELECT
              CAST(o.order_id AS STRING) AS orderId,
              COALESCE(c.name, '') AS customerName,
              COALESCE(p.product_name, '') AS productName,
              CAST(NULL AS STRING) AS category,
              COALESCE(o.quantity, 0) AS quantity,
              COALESCE(o.quantity, 0) * COALESCE(o.unit_price, NUMERIC '0') AS totalPrice,
              COALESCE(o.order_status, 'UNKNOWN') AS status,
              FORMAT_TIMESTAMP('%Y-%m-%d', o.order_date, 'UTC') AS orderDate,
              c.country AS country,
              CAST(NULL AS STRING) AS statusUpdatedAt,
              CAST(NULL AS STRING) AS cancellationReason
            FROM Orders o
            LEFT JOIN Customers c ON c.customer_id = o.customer_id
            LEFT JOIN Products p ON p.product_id = o.product_id
            WHERE TRUE
            """);
        appendFilters(sql, startDate, endDate, country, status, productId);
        sql.append(" ORDER BY o.order_date DESC LIMIT 500");
        Statement statement = buildStatement(sql, startDate, endDate, country, status, productId);

        return spannerTemplate.query(
            row -> new OrderRow(
                row.getString("orderId"),
                row.getString("customerName"),
                row.getString("productName"),
                row.isNull("category") ? "" : row.getString("category"),
                row.getLong("quantity"),
                row.getBigDecimal("totalPrice").doubleValue(),
                row.getString("status"),
                row.getString("orderDate"),
                row.isNull("country") ? "" : row.getString("country"),
                row.isNull("statusUpdatedAt") ? "" : row.getString("statusUpdatedAt"),
                row.isNull("cancellationReason") ? "" : row.getString("cancellationReason")
            ),
            statement,
            new SpannerQueryOptions()
        );
    }

    public FilterOptions getFilterOptions() {
        List<String> countries = spannerTemplate.query(
            row -> row.getString("country"),
            Statement.newBuilder("SELECT DISTINCT country FROM Customers WHERE country IS NOT NULL ORDER BY country").build(),
            new SpannerQueryOptions()
        );
        List<ProductOption> products = spannerTemplate.query(
            row -> new ProductOption(row.getLong("productId"), row.getString("productName")),
            Statement.newBuilder("""
                SELECT product_id AS productId, product_name AS productName
                FROM Products
                ORDER BY product_name
                """).build(),
            new SpannerQueryOptions()
        );
        return new FilterOptions(countries, products);
    }

    public List<MonthlyCancellation> getMonthlyCancellations(String startDate, String endDate, String country,
                                                              String status, String productId) {
        StringBuilder sql = new StringBuilder("""
            SELECT
              FORMAT_TIMESTAMP('%Y-%m', o.order_date, 'UTC') AS month,
              COUNT(*) AS cancellations,
              SUM(COALESCE(o.quantity, 0) * COALESCE(o.unit_price, NUMERIC '0')) AS revenueLost
            FROM Orders o
            LEFT JOIN Customers c ON c.customer_id = o.customer_id
            LEFT JOIN Products p ON p.product_id = o.product_id
            WHERE o.order_status = 'CANCELLED'
            """);
        appendCancellationFilters(sql, startDate, endDate, country, status, productId);
        sql.append(" GROUP BY month ORDER BY month");
        return spannerTemplate.query(
            row -> new MonthlyCancellation(row.getString("month"), row.getLong("cancellations"),
                row.getBigDecimal("revenueLost").doubleValue()),
            buildStatement(sql, startDate, endDate, country, status, productId),
            new SpannerQueryOptions()
        );
    }

    public List<CancellationEntry> getCancellationReasons(String startDate, String endDate, String country,
                                                           String status, String productId) {
        StringBuilder sql = new StringBuilder("""
            SELECT
              'Not recorded in the existing database' AS label,
              COUNT(*) AS cancellations,
              SUM(COALESCE(o.quantity, 0) * COALESCE(o.unit_price, NUMERIC '0')) AS revenueLost
            FROM Orders o
            LEFT JOIN Customers c ON c.customer_id = o.customer_id
            LEFT JOIN Products p ON p.product_id = o.product_id
            WHERE o.order_status = 'CANCELLED'
            """);
        appendCancellationFilters(sql, startDate, endDate, country, status, productId);
        sql.append(" GROUP BY label ORDER BY cancellations DESC LIMIT 20");
        return queryCancellationEntries(sql, startDate, endDate, country, status, productId);
    }

    public List<CancellationEntry> getCancelledProducts(String startDate, String endDate, String country,
                                                         String status, String productId) {
        StringBuilder sql = new StringBuilder("""
            SELECT
              COALESCE(p.product_name, 'Unknown product') AS label,
              COUNT(*) AS cancellations,
              SUM(COALESCE(o.quantity, 0) * COALESCE(o.unit_price, NUMERIC '0')) AS revenueLost
            FROM Orders o
            LEFT JOIN Customers c ON c.customer_id = o.customer_id
            LEFT JOIN Products p ON p.product_id = o.product_id
            WHERE o.order_status = 'CANCELLED'
            """);
        appendCancellationFilters(sql, startDate, endDate, country, status, productId);
        sql.append(" GROUP BY label ORDER BY cancellations DESC LIMIT 10");
        return queryCancellationEntries(sql, startDate, endDate, country, status, productId);
    }

    public List<CancellationEntry> getCountryCancellations(String startDate, String endDate, String country,
                                                            String status, String productId) {
        StringBuilder sql = new StringBuilder("""
            SELECT
              COALESCE(c.country, 'Unknown country') AS label,
              COUNT(*) AS cancellations,
              SUM(COALESCE(o.quantity, 0) * COALESCE(o.unit_price, NUMERIC '0')) AS revenueLost
            FROM Orders o
            LEFT JOIN Customers c ON c.customer_id = o.customer_id
            LEFT JOIN Products p ON p.product_id = o.product_id
            WHERE o.order_status = 'CANCELLED'
            """);
        appendCancellationFilters(sql, startDate, endDate, country, status, productId);
        sql.append(" GROUP BY label ORDER BY cancellations DESC LIMIT 20");
        return queryCancellationEntries(sql, startDate, endDate, country, status, productId);
    }

    private List<CancellationEntry> queryCancellationEntries(StringBuilder sql, String startDate, String endDate,
                                                              String country, String status, String productId) {
        return spannerTemplate.query(
            row -> new CancellationEntry(row.getString("label"), row.getLong("cancellations"),
                row.getBigDecimal("revenueLost").doubleValue()),
            buildStatement(sql, startDate, endDate, country, status, productId),
            new SpannerQueryOptions()
        );
    }

    private void appendCancellationFilters(StringBuilder sql, String startDate, String endDate,
                                          String country, String status, String productId) {
        if (hasText(startDate)) sql.append(" AND o.order_date >= @startDate");
        if (hasText(endDate)) sql.append(" AND o.order_date < @endDate");
        if (hasText(country)) sql.append(" AND c.country = @country");
        if (hasText(status)) sql.append(" AND o.order_status = @status");
        if (hasText(productId)) sql.append(" AND o.product_id = @productId");
    }

    @Transactional
    public void updateOrderStatus(long orderId, String requestedStatus, String requestedReason) {
        String status = requestedStatus == null ? "" : requestedStatus.trim().toUpperCase(Locale.ROOT);
        if (!List.of("PENDING", "COMPLETED", "CANCELLED").contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status must be PENDING, COMPLETED, or CANCELLED");
        }

        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        String previousStatus = order.getOrderStatus();
        if (status.equals(previousStatus)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Order already has this status");
        }
        if ("CANCELLED".equals(status)) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                "The existing Spanner schema cannot store cancellation reasons or status history; add those columns before cancelling orders.");
        }
        order.setOrderStatus(status);
        orderRepository.save(order);
    }

    public List<OrderStatusHistory> getOrderStatusHistory(long orderId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED,
            "The existing Spanner schema does not include an order status history table.");
    }

    private void appendFilters(StringBuilder sql, String startDate, String endDate,
                               String country, String status, String productId) {
        if (hasText(startDate)) sql.append(" AND o.order_date >= @startDate");
        if (hasText(endDate)) sql.append(" AND o.order_date < @endDate");
        if (hasText(country)) sql.append(" AND c.country = @country");
        if (hasText(status)) sql.append(" AND o.order_status = @status");
        if (hasText(productId)) sql.append(" AND o.product_id = @productId");
    }

    private Statement buildStatement(StringBuilder sql, String startDate, String endDate,
                                     String country, String status, String productId) {
        Statement.Builder builder = Statement.newBuilder(sql.toString());
        if (hasText(startDate)) {
            builder.bind("startDate").to(toTimestamp(LocalDate.parse(startDate)));
        }
        if (hasText(endDate)) {
            builder.bind("endDate").to(toTimestamp(LocalDate.parse(endDate).plusDays(1)));
        }
        if (hasText(country)) builder.bind("country").to(country);
        if (hasText(status)) builder.bind("status").to(status);
        if (hasText(productId)) {
            try {
                builder.bind("productId").to(Long.parseLong(productId));
            } catch (NumberFormatException ex) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "productId must be numeric");
            }
        }
        return builder.build();
    }

    private Timestamp toTimestamp(LocalDate date) {
        return Timestamp.ofTimeSecondsAndNanos(date.atStartOfDay(ZoneOffset.UTC).toEpochSecond(), 0);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
