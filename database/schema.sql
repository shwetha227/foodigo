-- Create a database (if it doesn't exist) and use it.
-- You might need to run this part manually or ensure your MySQL user has rights to create databases.
-- CREATE DATABASE IF NOT EXISTS foodigo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE foodigo_db;

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Restaurants Table
CREATE TABLE IF NOT EXISTS restaurants (
    restaurant_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE, -- Login email for restaurant owner/manager
    password_hash VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone_number VARCHAR(20),
    cuisine_type VARCHAR(100),
    operating_hours VARCHAR(255),
    is_open BOOLEAN DEFAULT true,
    banner_image_url VARCHAR(2083),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Food Items Table (Menu Items)
CREATE TABLE IF NOT EXISTS food_items (
    food_item_id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    image_url VARCHAR(2083),
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered') DEFAULT 'pending',
    delivery_address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id)
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    food_item_id INT NOT NULL,
    quantity INT NOT NULL,
    price_at_time DECIMAL(10, 2) NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (food_item_id) REFERENCES food_items(food_item_id)
);

-- Delivery Partners Table
CREATE TABLE IF NOT EXISTS delivery_partners (
    partner_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE, -- Login email for delivery partner
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    vehicle_details VARCHAR(255), -- e.g., "Motorcycle - BA 1234"
    current_status ENUM('offline', 'available', 'on_delivery') DEFAULT 'offline',
    current_location_lat DECIMAL(10, 8),
    current_location_lng DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- You might want to add other tables later, such as:
-- Orders, OrderItems, Reviews, etc.

-- Example: Adding some dummy data (optional, for testing)
/*
-- Sample Restaurants
INSERT INTO restaurants (name, email, password_hash, address, cuisine_type) VALUES
('The Pizza Place', 'pizza@example.com', 'hashed_password1', '123 Main St, Anytown', 'Italian'),
('Burger Hub', 'burger@example.com', 'hashed_password2', '456 Oak Ave, Anytown', 'American');

-- Sample Food Items for The Pizza Place (assuming restaurant_id = 1)
INSERT INTO food_items (restaurant_id, name, price, category) VALUES
(1, 'Margherita Pizza', 12.99, 'Pizza'),
(1, 'Pepperoni Pizza', 14.99, 'Pizza'),
(1, 'Garlic Knots', 5.99, 'Appetizer'),
(1, 'Caesar Salad', 8.50, 'Salad'),
(1, 'Coke', 2.00, 'Beverage');

-- Sample Food Items for Burger Hub (assuming restaurant_id = 2)
INSERT INTO food_items (restaurant_id, name, price, category) VALUES
(2, 'Classic Cheeseburger', 10.50, 'Burger'),
(2, 'Bacon Avocado Burger', 13.00, 'Burger'),
(2, 'French Fries', 3.50, 'Side'),
(2, 'Onion Rings', 4.50, 'Side'),
(2, 'Milkshake', 5.00, 'Beverage');
*/ 