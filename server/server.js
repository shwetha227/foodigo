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
    const { role, name, email, password, address, phone_number } = req.body;
    
    // Destructure delivery partner specific fields
    const { phone_number: dp_phone_number, vehicle_details, current_status, current_location_lat, current_location_lng } = req.body;

    if (!role || !name || !email || !password) {
        return res.status(400).json({ message: 'All required fields (role, name, email, password) are required.' });
    }
    
    // Basic validation for role-specific required fields
    if (role === 'customer' && (!address || !phone_number)) {
         return res.status(400).json({ message: 'Address and Phone Number are required for customer signup.' });
    } else if (role === 'delivery_partner' && (!dp_phone_number || !vehicle_details || !current_status)) {
         return res.status(400).json({ message: 'Phone Number, Vehicle Details, and Current Status are required for delivery partner signup.' });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        let table = '';
        let insertFields = '';
        let insertValues = [];

        if (role === 'customer') {
            table = 'customers';
            insertFields = '(name, email, password_hash, address, phone_number)';
            insertValues = [name, email, hashedPassword, address, phone_number];
        } else if (role === 'restaurant') {
            table = 'restaurants';
            insertFields = '(name, email, password_hash, address)'; // Assuming address is required for restaurants
            insertValues = [name, email, hashedPassword, address]; // Get address from req.body
        } else if (role === 'delivery_partner') {
            table = 'delivery_partners';
            // Include all required and optional fields for delivery partners
            insertFields = '(name, email, password_hash, phone_number, vehicle_details, current_status, current_location_lat, current_location_lng)';
            insertValues = [
                name,
                email,
                hashedPassword,
                dp_phone_number, // Use the delivery partner specific phone number
                vehicle_details,
                current_status,
                current_location_lat || null, // Allow null if not provided
                current_location_lng || null  // Allow null if not provided
            ];
        } else {
            return res.status(400).json({ message: 'Invalid role.' });
        }

        // Check if email already exists in the table
        db.query(`SELECT * FROM ${table} WHERE email = ?`, [email], (err, results) => {
            if (err) {
                console.error('DB Error checking email during signup:', err);
                return res.status(500).json({ message: 'Database error', error: err });
            }
            if (results.length > 0) {
                return res.status(409).json({ message: 'Email already registered.' });
            }

            // Insert new user
            db.query(`INSERT INTO ${table} ${insertFields} VALUES (${insertValues.map(() => '?').join(', ')})`, insertValues, (err, result) => {
                if (err) {
                    console.error('DB Error inserting new user during signup:', err);
                    // Provide more specific error details if possible (e.g., duplicate entry)
                    if (err.code === 'ER_DUP_ENTRY') {
                         return res.status(409).json({ message: 'Duplicate entry error. Phone number or email might already be registered.', error: err.message });
                    }
                    return res.status(500).json({ message: 'Database error', error: err });
                }
                
                // Determine the correct userId based on role
                let userIdToSend;
                if (role === 'customer') {
                    userIdToSend = result.insertId; // Assuming customer_id is auto-increment
                } else if (role === 'restaurant') {
                    userIdToSend = result.insertId; // Assuming restaurant_id is auto-increment
                } else if (role === 'delivery_partner') {
                    userIdToSend = result.insertId; // Assuming partner_id is auto-increment
                } // No else needed, as invalid role is handled above

                // Ensure userIdToSend is not undefined before sending
                if (userIdToSend === undefined) {
                     console.error('Signup successful but failed to get insertId for role:', role);
                     // Decide how to handle this - perhaps still send a success message without userId
                     // or return a partial success/warning.
                     return res.status(201).json({ message: 'Signup successful, but user ID could not be retrieved.' });
                }

                return res.status(201).json({ message: 'Signup successful!', userId: userIdToSend });
            });
        });
    } catch (err) {
        console.error('Server Error during signup:', err);
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
    let idColumn = '';
    if (role === 'customer') {
        table = 'customers';
        idColumn = 'customer_id';
    } else if (role === 'restaurant') {
        table = 'restaurants';
        idColumn = 'restaurant_id';
    } else if (role === 'delivery_partner') {
        table = 'delivery_partners';
        idColumn = 'partner_id';
    } else {
        return res.status(400).json({ message: 'Invalid role.' });
    }

    db.query(`SELECT *, ${idColumn} AS user_id FROM ${table} WHERE email = ?`, [email], async (err, results) => {
        if (err) {
            console.error('DB Error during login:', err);
            return res.status(500).json({ message: 'Database error', error: err });
        }
        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        
        // Return the specific user ID based on the role
        res.status(200).json({
            message: 'Login successful!',
            userId: user.user_id, // Use the aliased user_id
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

// Get feedback for a restaurant
app.get('/api/feedback/:restaurantId', (req, res) => {
    const { restaurantId } = req.params;
    db.query(
        'SELECT f.rating, f.comment AS feedbackText, c.name AS userName, f.created_at AS timestamp FROM feedback f JOIN customers c ON f.customer_id = c.customer_id WHERE f.restaurant_id = ? ORDER BY f.created_at DESC',
        [restaurantId],
        (err, results) => {
            if (err) {
                console.error('DB Error fetching feedback:', err);
                return res.status(500).json({ message: 'Database error', error: err });
            }
            res.json(results);
        }
    );
});

// Register user routes
app.use('/', userRoutes);

// Get delivery partner details
app.get('/api/delivery-partners/:partnerId', (req, res) => {
    const { partnerId } = req.params;
    db.query(
        'SELECT partner_id, name, email, phone_number, vehicle_details, current_status FROM delivery_partners WHERE partner_id = ?',
        [partnerId],
        (err, results) => {
            if (err) {
                console.error('DB Error fetching delivery partner details:', err);
                return res.status(500).json({ message: 'Database error', error: err });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'Delivery partner not found.' });
            }
            res.json(results[0]);
        }
    );
});

// Placeholder endpoint for delivery partner earnings
app.get('/api/delivery-partners/:partnerId/earnings', (req, res) => {
    const { partnerId } = req.params;
    // TODO: Implement actual earnings calculation based on delivered orders
    console.log(`Fetching earnings for delivery partner ${partnerId}`);
    // Return dummy data for now
    res.json({ totalEarnings: 1500.75 });
});

// Placeholder endpoint for delivery partner ratings
app.get('/api/delivery-partners/:partnerId/ratings', (req, res) => {
    const { partnerId } = req.params;
    // TODO: Implement actual rating calculation based on completed orders
    console.log(`Fetching ratings for delivery partner ${partnerId}`);
    // Sending placeholder data
    res.json({ averageRating: 4.5 });
});

// Get available orders for delivery partners
app.get('/api/available-orders', (req, res) => {
    // Query for orders that are 'Pending' and have no delivery_partner_id
    const query = `
        SELECT o.order_id, o.customer_id, o.delivery_address, o.total_amount, o.status,
               c.name AS customer_name,
               GROUP_CONCAT(oi.food_name ORDER BY oi.id SEPARATOR ', ') AS food_items_list
        FROM orders o
        JOIN customers c ON o.customer_id = c.customer_id
        JOIN order_items oi ON o.order_id = oi.order_id
        WHERE o.status = 'Pending' AND o.delivery_partner_id IS NULL
        GROUP BY o.order_id, o.customer_id, o.delivery_address, o.total_amount, o.status, c.name;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('DB Error fetching available orders:', err);
            return res.status(500).json({ message: 'Database error', error: err });
        }
        
        // Format the results to include items as an array of objects if needed by the frontend
        // Currently, the frontend expects 'items' as an array of objects {name: quantity} or similar.
        // The current query gives a comma-separated string. We can adjust this later
        // if the frontend requires a more structured item list.
        const formattedResults = results.map(order => ({
            order_id: order.order_id,
            customer_id: order.customer_id,
            customer_name: order.customer_name,
            delivery_address: order.delivery_address,
            total_amount: order.total_amount,
            status: order.status,
            // Split the concatenated string into an array of item names (basic for now)
            items: order.food_items_list ? order.food_items_list.split(', ').map(item => ({ name: item.trim(), quantity: 1 })) : []
        }));

        res.json(formattedResults);
    });
});

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
                console.error('DB Error submitting feedback:', err);
                // Check for foreign key constraint errors
                if (err.code === 'ER_NO_REFERENCED_ROW_2') {
                    return res.status(409).json({ message: 'Cannot submit feedback: Invalid restaurant or customer ID.', error: err.message });
                }
                return res.status(500).json({ message: 'Database error', error: err });
            }
            res.status(201).json({ message: 'Feedback submitted!' });
        }
    );
});

// Accept an order (Delivery Partner)
app.post('/api/orders/:orderId/accept', (req, res) => {
    const { orderId } = req.params;
    // Assuming delivery partner ID is sent in the request body or available from authenticated user
    // For now, let's assume it's sent in the body for simplicity or retrieve from req.user if using auth middleware
    const { deliveryPartnerId } = req.body; // Assuming the frontend sends deliveryPartnerId

    if (!deliveryPartnerId) {
        // Alternatively, retrieve partnerId from authenticated session/token
        // const deliveryPartnerId = req.user.partnerId; // Example if using authentication
        return res.status(400).json({ success: false, message: 'Delivery Partner ID is required.' });
    }

    // Update the order status and assign delivery partner
    db.query(
        'UPDATE orders SET delivery_partner_id = ?, status = ? WHERE order_id = ?',
        [deliveryPartnerId, 'out_for_delivery', orderId],
        (err, result) => {
            if (err) {
                console.error('DB Error accepting order:', err);
                return res.status(500).json({ success: false, message: 'Database error', error: err });
            }
            if (result.affectedRows === 0) {
                 // No order found with that ID, or it was already accepted/updated
                 return res.status(404).json({ success: false, message: 'Order not found or already accepted.' });
            }
            res.json({ success: true, message: 'Order accepted successfully!' });
        }
    );
}); 