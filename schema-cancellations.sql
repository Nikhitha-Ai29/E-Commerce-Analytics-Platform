-- Additive GoogleSQL migration for cancellation analytics and order status audit.
-- Apply once to the existing global_analytics database before deploying the backend.

ALTER TABLE Orders ADD COLUMN status_updated_at TIMESTAMP;

ALTER TABLE Orders ADD COLUMN cancellation_reason STRING(500);

CREATE TABLE OrderStatusHistory (
  history_id STRING(36) NOT NULL,
  order_id INT64 NOT NULL,
  previous_status STRING(30),
  new_status STRING(30) NOT NULL,
  changed_at TIMESTAMP NOT NULL,
  cancellation_reason STRING(500)
) PRIMARY KEY (history_id);

CREATE INDEX OrderStatusHistoryByOrder
  ON OrderStatusHistory (order_id, changed_at DESC);
