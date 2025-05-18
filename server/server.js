const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const userRoutes = require('./routes/users');
const db = require('../db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// Middleware to serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Middleware to parse JSON bodies (for signup/login requests)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.options('*', cors());

// Basic route for the root, serves index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// --- API Endpoints ---

// Signup Endpoint
app.post('/signup', async (req, res) => {
    const { role, name, email, password } = req.body;
    if (!role || !name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        let table = '';
        let insertFields = '';
        let insertValues = [];
        if (role === 'customer') {
            table = 'customers';
            insertFields = '(name, email, password_hash)';
            insertValues = [name, email, hashedPassword];
        } else if (role === 'restaurant') {
            table = 'restaurants';
            insertFields = '(name, email, password_hash, address)';
            insertValues = [name, email, hashedPassword, '']; // Address can be updated later
        } else if (role === 'delivery_partner') {
            table = 'delivery_partners';
            insertFields = '(name, email, password_hash, phone_number)';
            insertValues = [name, email, hashedPassword, '']; // Phone can be updated later
        } else {
            return res.status(400).json({ message: 'Invalid role.' });
        }
        // Check if email already exists in the table
        db.query(`SELECT * FROM ${table} WHERE email = ?`, [email], (err, results) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err });
            if (results.length > 0) {
                return res.status(409).json({ message: 'Email already registered.' });
            }
            // Insert new user
            db.query(`INSERT INTO ${table} ${insertFields} VALUES (${insertValues.map(() => '?').join(', ')})`, insertValues, (err, result) => {
                if (err) return res.status(500).json({ message: 'Database error', error: err });
                return res.status(201).json({ message: 'Signup successful!', userId: result.insertId });
            });
        });
    } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err });
    }
});

// Login Endpoint
app.post('/login', (req, res) => {
    const { role, email, password } = req.body;
    if (!role || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    let table = '';
    if (role === 'customer') {
        table = 'customers';
    } else if (role === 'restaurant') {
        table = 'restaurants';
    } else if (role === 'delivery_partner') {
        table = 'delivery_partners';
    } else {
        return res.status(400).json({ message: 'Invalid role.' });
    }

    db.query(`SELECT * FROM ${table} WHERE email = ?`, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        // You can add session/token logic here if needed
        res.status(200).json({
            message: 'Login successful!',
            userId: user.id,
            name: user.name,
            role
        });
    });
});

// Get Restaurants Endpoint (for customer dashboard)
app.get('/api/restaurants', (req, res) => {
    // TODO: Query database for restaurants and their food items
    // For now, sending placeholder data similar to the frontend script
    const placeholderRestaurants = [
        { id: 1, name: 'Pizza Place', foods: ['Pepperoni Pizza', 'Margherita Pizza', 'Veggie Pizza', 'Garlic Knots', 'Soda'] },
        { id: 2, name: 'Burger Joint', foods: ['Cheeseburger', 'Bacon Burger', 'Veggie Burger', 'Fries', 'Milkshake'] },
        // Add more to match the 20 total, 5 foods each requirement
        { id: 3, name: 'Sushi Spot', foods: ['California Roll', 'Spicy Tuna Roll', 'Salmon Nigiri', 'Edamame', 'Miso Soup'] },
        { id: 4, name: 'Taco Town', foods: ['Chicken Taco', 'Beef Taco', 'Fish Taco', 'Guacamole', 'Chips and Salsa'] },
        { id: 5, name: 'Pasta Palace', foods: ['Spaghetti Carbonara', 'Fettuccine Alfredo', 'Lasagna', 'Caesar Salad', 'Garlic Bread'] },
        { id: 6, name: 'Curry House', foods: ['Chicken Tikka Masala', 'Vegetable Korma', 'Naan Bread', 'Samosa', 'Mango Lassi'] },
        { id: 7, name: 'Salad Bar', foods: ['Greek Salad', 'Cobb Salad', 'Caesar Salad', 'Fruit Salad', 'Soup of the Day'] },
        { id: 8, name: 'BBQ Shack', foods: ['Pulled Pork Sandwich', 'Brisket', 'Ribs', 'Coleslaw', 'Cornbread'] },
        { id: 9, name: 'Breakfast Nook', foods: ['Pancakes', 'Waffles', 'Omelette', 'Bacon', 'Coffee'] },
        { id: 10, name: 'Seafood Grill', foods: ['Grilled Salmon', 'Fish and Chips', 'Shrimp Scampi', 'Clam Chowder', 'Lobster Bisque'] },
        { id: 11, name: 'Vegan Vibes', foods: ['Beyond Burger', 'Tofu Scramble', 'Quinoa Bowl', 'Smoothie', 'Avocado Toast'] },
        { id: 12, name: 'Dessert Den', foods: ['Chocolate Cake', 'Ice Cream Sundae', 'Cheesecake', 'Apple Pie', 'Brownies'] },
        { id: 13, name: 'Mexican Fiesta', foods: ['Enchiladas', 'Burrito Bowl', 'Quesadillas', 'Churros', 'Horchata'] },
        { id: 14, name: 'Chinese Express', foods: ['General Tso Chicken', 'Kung Pao Shrimp', 'Fried Rice', 'Egg Rolls', 'Wonton Soup'] },
        { id: 15, name: 'Italian Deli', foods: ['Meatball Sub', 'Caprese Sandwich', 'Antipasto Salad', 'Cannoli', 'Espresso'] },
        { id: 16, name: 'Thai Garden', foods: ['Pad Thai', 'Green Curry', 'Tom Yum Soup', 'Spring Rolls', 'Thai Iced Tea'] },
        { id: 17, name: 'Steakhouse Supreme', foods: ['Ribeye Steak', 'Filet Mignon', 'Loaded Baked Potato', 'Creamed Spinach', 'Red Wine'] },
        { id: 18, name: 'Smoothie Central', foods: ['Strawberry Banana Smoothie', 'Mango Pineapple Smoothie', 'Green Detox Smoothie', 'Protein Shake', 'Acai Bowl'] },
        { id: 19, name: 'Ramen Shop', foods: ['Tonkotsu Ramen', 'Shoyu Ramen', 'Miso Ramen', 'Gyoza', 'Seaweed Salad'] },
        { id: 20, name: 'Coffee Corner', foods: ['Latte', 'Cappuccino', 'Americano', 'Croissant', 'Muffin'] }
    ];
    res.json(placeholderRestaurants);
});

// Live Chat Endpoint for customer to send message
app.post('/api/livechat', (req, res) => {
    const { orderId, orderItemId, restaurantId, customerId, message } = req.body;
    if (!orderId || !orderItemId || !restaurantId || !customerId || !message) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    db.query(
        'INSERT INTO order_item_chats (order_id, order_item_id, restaurant_id, customer_id, message, sender) VALUES (?, ?, ?, ?, ?, ?)',
        [orderId, orderItemId, restaurantId, customerId, message, 'customer'],
        (err, result) => {
            if (err) {
                console.error('DB Error:', err);
                return res.status(500).json({ message: 'Database error', error: err });
            }
            res.status(201).json({ message: 'Message sent!' });
        }
    );
});

// Get chat history for an order item
app.get('/api/livechat/:orderId/:orderItemId', (req, res) => {
    const { orderId, orderItemId } = req.params;
    db.query(
        'SELECT * FROM order_item_chats WHERE order_id = ? AND order_item_id = ? ORDER BY timestamp ASC',
        [orderId, orderItemId],
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err });
            res.json(results);
        }
    );
});

// Get all order items with chats for a restaurant
app.get('/api/restaurant-chats/:restaurantId', (req, res) => {
    const { restaurantId } = req.params;
    // This query finds all order items for this restaurant that have at least one chat message
    db.query(`
        SELECT DISTINCT c.order_id, c.order_item_id, c.customer_id, c.restaurant_id, c.message, c.timestamp,
            o.food_name, cu.name AS customer_name
        FROM order_item_chats c
        JOIN order_items o ON c.order_item_id = o.id
        JOIN customers cu ON c.customer_id = cu.id
        WHERE c.restaurant_id = ?
        ORDER BY c.timestamp DESC
    `, [restaurantId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.json(results);
    });
});

// Restaurant reply to chat
app.post('/api/restaurant-reply', (req, res) => {
    const { orderId, orderItemId, restaurantId, customerId, message } = req.body;
    if (!orderId || !orderItemId || !restaurantId || !customerId || !message) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    db.query(
        'INSERT INTO order_item_chats (order_id, order_item_id, restaurant_id, customer_id, message, sender) VALUES (?, ?, ?, ?, ?, ?)',
        [orderId, orderItemId, restaurantId, customerId, message, 'restaurant'],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err });
            res.status(201).json({ message: 'Message sent!' });
        }
    );
});

// Register user routes
app.use('/', userRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Place a new order
app.post('/api/orders', async (req, res) => {
    const { userId, items, totalAmount } = req.body;

    if (!userId || !items || !items.length || !totalAmount) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Start a transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // Get user's address
        const [userRows] = await connection.query(
            'SELECT address FROM customers WHERE customer_id = ?',
            [userId]
        );

        if (!userRows.length || !userRows[0].address) {
            await connection.rollback();
            return res.status(400).json({ message: 'User address not found' });
        }

        // Create the order
        const [orderResult] = await connection.query(
            `INSERT INTO orders (customer_id, restaurant_id, total_amount, delivery_address)
             VALUES (?, ?, ?, ?)`,
            [userId, items[0].restaurantId, totalAmount, userRows[0].address]
        );

        const orderId = orderResult.insertId;

        // Insert order items
        for (const item of items) {
            await connection.query(
                `INSERT INTO order_items (order_id, food_item_id, quantity, price_at_time)
                 VALUES (?, ?, ?, ?)`,
                [orderId, item.foodId, item.quantity, item.price]
            );
        }

        // Commit the transaction
        await connection.commit();

        res.status(201).json({
            message: 'Order placed successfully',
            orderId: orderId
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error placing order:', error);
        res.status(500).json({ message: 'Failed to place order' });
    } finally {
        connection.release();
    }
});

app.post('/api/feedback', (req, res) => {
    console.log('Feedback endpoint hit', req.body);
    const { restaurantId, customerId, rating, comment } = req.body;
    if (!restaurantId || !customerId || !rating || !comment) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    db.query(
        'INSERT INTO feedback (restaurant_id, customer_id, rating, comment) VALUES (?, ?, ?, ?)',
        [restaurantId, customerId, rating, comment],
        (err, result) => {
            if (err) {
                console.error('DB Error:', err);
                return res.status(500).json({ message: 'Database error', error: err });
            }
            res.status(201).json({ message: 'Feedback submitted!' });
        }
    );
}); 