-- Demo database schema for text-to-sql-powerhouse
-- This creates sample tables for testing the application

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active'
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (name, email, status) VALUES
    ('John Doe', 'john@example.com', 'active'),
    ('Jane Smith', 'jane@example.com', 'active'),
    ('Bob Johnson', 'bob@example.com', 'inactive'),
    ('Alice Williams', 'alice@example.com', 'active'),
    ('Charlie Brown', 'charlie@example.com', 'active')
ON CONFLICT (email) DO NOTHING;

INSERT INTO products (name, description, price, category, stock_quantity) VALUES
    ('Laptop', 'High-performance laptop', 1299.99, 'Electronics', 50),
    ('Mouse', 'Wireless mouse', 29.99, 'Electronics', 200),
    ('Keyboard', 'Mechanical keyboard', 89.99, 'Electronics', 150),
    ('Monitor', '27-inch 4K monitor', 399.99, 'Electronics', 75),
    ('Desk Chair', 'Ergonomic office chair', 299.99, 'Furniture', 30),
    ('Desk', 'Standing desk', 499.99, 'Furniture', 20),
    ('Notebook', 'Spiral notebook pack', 9.99, 'Stationery', 500),
    ('Pen Set', 'Premium pen set', 19.99, 'Stationery', 300)
ON CONFLICT DO NOTHING;

INSERT INTO orders (user_id, total_amount, status) VALUES
    (1, 1329.98, 'completed'),
    (2, 89.99, 'pending'),
    (1, 509.98, 'completed'),
    (3, 29.99, 'cancelled'),
    (4, 1699.98, 'completed')
ON CONFLICT DO NOTHING;

INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
    (1, 1, 1, 1299.99),
    (1, 2, 1, 29.99),
    (2, 3, 1, 89.99),
    (3, 5, 1, 299.99),
    (3, 7, 21, 9.99),
    (4, 2, 1, 29.99),
    (5, 1, 1, 1299.99),
    (5, 4, 1, 399.99)
ON CONFLICT DO NOTHING;
