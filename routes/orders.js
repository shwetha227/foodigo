const express = require('express');
const router = express.Router();
const db = require('../db');

// Place a new order
router.post('/', async (req, res) => {
    try {
        const { userId, items, totalAmount } = req.body;
        
        // Validate input
        if (!userId || !items || !totalAmount) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Start transaction
        await db.beginTransaction();

        try {
            // Create order
            const orderQuery = `
                INSERT INTO orders (user_id, restaurant_id, total_amount)
                VALUES (?, ?, ?)
            `;
            
            const [orderResult] = await db.query(orderQuery, [
                userId,
                items[0].restaurantId, // Assuming all items are from same restaurant
                totalAmount
            ]);

            const orderId = orderResult.insertId;

            // Insert order items
            const itemQuery = `
                INSERT INTO order_items (order_id, food_id, quantity, price)
                VALUES (?, ?, ?, ?)
            `;

            for (const item of items) {
                await db.query(itemQuery, [
                    orderId,
                    item.foodId,
                    item.quantity,
                    item.price
                ]);
            }

            // Commit transaction
            await db.commit();

            res.status(201).json({ 
                message: 'Order placed successfully',
                orderId: orderId
            });
        } catch (error) {
            // Rollback transaction on error
            await db.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ message: 'Error placing order' });
    }
});

// Get user's orders
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const query = `
            SELECT o.*, r.name as restaurant_name,
                   GROUP_CONCAT(
                       CONCAT(oi.quantity, 'x ', f.name)
                       SEPARATOR ', '
                   ) as items
            FROM orders o
            JOIN restaurants r ON o.restaurant_id = r.id
            JOIN order_items oi ON o.id = oi.order_id
            JOIN foods f ON oi.food_id = f.id
            WHERE o.user_id = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `;
        
        const [orders] = await db.query(query, [userId]);
        
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

module.exports = router; 