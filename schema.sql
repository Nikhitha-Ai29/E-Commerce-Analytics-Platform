-- Reference for the existing global_analytics GoogleSQL schema.
-- This was inspected from Cloud Spanner. Do not reapply it to the existing database.

CREATE TABLE Customers (
  customer_id INT64 NOT NULL,
  name STRING(100),
  email STRING(150),
  country STRING(50)
) PRIMARY KEY (customer_id);

CREATE TABLE Orders (
  order_id INT64 NOT NULL,
  customer_id INT64,
  product_id INT64,
  quantity INT64,
  unit_price NUMERIC,
  order_status STRING(30),
  order_date TIMESTAMP
) PRIMARY KEY (order_id);

CREATE TABLE Products (
  product_id INT64 NOT NULL,
  product_name STRING(150),
  price NUMERIC,
  stock_quantity INT64
) PRIMARY KEY (product_id);
