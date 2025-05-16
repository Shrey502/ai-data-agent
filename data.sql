INSERT INTO regions (name) VALUES ('North'), ('South'), ('East'), ('West');

INSERT INTO customers (name, email, region_id) VALUES
('Alice', 'alice@example.com', 1),
('Bob', 'bob@example.com', 2),
('Charlie', 'charlie@example.com', 3);

INSERT INTO products (name, category, price) VALUES
('Laptop', 'Electronics', 1200),
('Phone', 'Electronics', 800),
('Desk Chair', 'Furniture', 150);

INSERT INTO orders (customer_id, product_id, quantity, order_date) VALUES
(1, 1, 2, '2023-01-15'),
(2, 2, 1, '2023-02-01'),
(3, 3, 3, '2023-02-20');
