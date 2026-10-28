package com.analytics.service;

import com.analytics.model.Customer;
import com.analytics.model.Order;
import com.analytics.model.Product;
import com.analytics.repository.CustomerRepository;
import com.analytics.repository.OrderRepository;
import com.analytics.repository.ProductRepository;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class UploadService {

    private static final Pattern NUMERIC_ID = Pattern.compile("\\D*(\\d+)");

    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public Map<String, Object> uploadCustomers(MultipartFile file) throws IOException, CsvValidationException {
        List<Customer> customers = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        int row = 1;

        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            reader.readNext();
            String[] line;
            while ((line = reader.readNext()) != null) {
                row++;
                if (line.length < 4) {
                    errors.add("Row " + row + ": insufficient columns");
                    continue;
                }

                Long id = parseId(line[0]);
                String name = clean(line[1]);
                if (id == null || name.isEmpty()) {
                    errors.add("Row " + row + ": customer_id must be numeric (or end in digits) and name is required");
                    continue;
                }
                customers.add(new Customer(id, name, clean(line[2]), clean(line[3])));
            }
        }

        customerRepository.saveAll(customers);
        log.info("Saved {} customers to Spanner", customers.size());
        return result(customers.size(), errors, List.of());
    }

    public Map<String, Object> uploadProducts(MultipartFile file) throws IOException, CsvValidationException {
        List<Product> products = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        int row = 1;

        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            reader.readNext();
            String[] line;
            while ((line = reader.readNext()) != null) {
                row++;
                if (line.length < 4) {
                    errors.add("Row " + row + ": insufficient columns");
                    continue;
                }

                Long id = parseId(line[0]);
                String name = clean(line[1]);
                BigDecimal price = parseDecimal(line[3]);
                if (id == null || name.isEmpty() || price == null || price.signum() < 0) {
                    errors.add("Row " + row + ": product_id must be numeric (or end in digits), name is required, and unit_price must be non-negative");
                    continue;
                }
                products.add(new Product(id, name, price, null));
            }
        }

        productRepository.saveAll(products);
        log.info("Saved {} products to Spanner", products.size());
        List<String> warnings = List.of(
            "Product categories were not saved because the live Products table has no category column."
        );
        return result(products.size(), errors, warnings);
    }

    public Map<String, Object> uploadOrders(MultipartFile file) throws IOException, CsvValidationException {
        List<Order> orders = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        int row = 1;

        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            reader.readNext();
            String[] line;
            while ((line = reader.readNext()) != null) {
                row++;
                if (line.length < 8) {
                    errors.add("Row " + row + ": insufficient columns");
                    continue;
                }

                Long orderId = parseId(line[0]);
                Long customerId = parseId(line[1]);
                Long productId = parseId(line[2]);
                Long quantity = parseLong(line[3]);
                BigDecimal lineTotal = parseDecimal(line[4]);
                String status = clean(line[5]).toUpperCase();
                Instant orderDate = parseDate(line[6]);

                if (orderId == null || customerId == null || productId == null || quantity == null
                        || quantity <= 0 || lineTotal == null || lineTotal.signum() < 0 || orderDate == null) {
                    errors.add("Row " + row + ": invalid numeric IDs, quantity, total_price, or order_date");
                    continue;
                }
                if (!List.of("PENDING", "COMPLETED", "CANCELLED").contains(status)) {
                    status = "PENDING";
                }

                BigDecimal unitPrice = lineTotal.divide(BigDecimal.valueOf(quantity), 9, RoundingMode.HALF_UP);
                orders.add(new Order(orderId, productId, customerId, quantity, unitPrice, status, orderDate));
            }
        }

        orderRepository.saveAll(orders);
        log.info("Saved {} orders to Spanner", orders.size());
        List<String> warnings = List.of(
            "CSV country is resolved through Customers.country. Cancellation reasons and status history are not stored because the live Orders schema has no corresponding fields/table."
        );
        return result(orders.size(), errors, warnings);
    }

    private Map<String, Object> result(int saved, List<String> errors, List<String> warnings) {
        return Map.of("saved", saved, "errors", errors, "warnings", warnings);
    }

    private String clean(String value) {
        return value == null ? "" : value.trim();
    }

    private Long parseId(String value) {
        Matcher matcher = NUMERIC_ID.matcher(clean(value));
        if (!matcher.matches()) return null;
        try {
            long id = Long.parseLong(matcher.group(1));
            return id > 0 ? id : null;
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Long parseLong(String value) {
        try {
            return Long.parseLong(clean(value));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private BigDecimal parseDecimal(String value) {
        try {
            return new BigDecimal(clean(value));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Instant parseDate(String value) {
        try {
            return LocalDate.parse(clean(value), DateTimeFormatter.ISO_LOCAL_DATE)
                .atStartOfDay(ZoneOffset.UTC).toInstant();
        } catch (DateTimeParseException e) {
            return null;
        }
    }
}
