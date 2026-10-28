package com.analytics.controller;

import com.analytics.service.UploadService;
import com.opencsv.exceptions.CsvValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private final UploadService uploadService;

    // POST /api/upload/customers  — multipart CSV file
    @PostMapping("/customers")
    public ResponseEntity<Map<String, Object>> uploadCustomers(@RequestParam("file") MultipartFile file)
            throws IOException, CsvValidationException {
        return ResponseEntity.ok(uploadService.uploadCustomers(file));
    }

    // POST /api/upload/products
    @PostMapping("/products")
    public ResponseEntity<Map<String, Object>> uploadProducts(@RequestParam("file") MultipartFile file)
            throws IOException, CsvValidationException {
        return ResponseEntity.ok(uploadService.uploadProducts(file));
    }

    // POST /api/upload/orders
    @PostMapping("/orders")
    public ResponseEntity<Map<String, Object>> uploadOrders(@RequestParam("file") MultipartFile file)
            throws IOException, CsvValidationException {
        return ResponseEntity.ok(uploadService.uploadOrders(file));
    }
}
