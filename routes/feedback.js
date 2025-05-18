const express = require('express');
const router = express.Router();
const db = require('../db');

// Submit feedback
router.post('/', async (req, res) => {
    try {
        const { restaurantId, userId, rating, feedbackText, timestamp } = req.body;
        
        // Validate input
        if (!restaurantId || !userId || !rating || !feedbackText) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Insert feedback into database
        const query = `
            INSERT INTO feedback (restaurant_id, user_id, rating, feedback_text, timestamp)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        await db.query(query, [restaurantId, userId, rating, feedbackText, timestamp]);
        
        res.status(201).json({ message: 'Feedback submitted successfully' });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ message: 'Error submitting feedback' });
    }
});

// Get feedback for a restaurant
router.get('/:restaurantId', async (req, res) => {
    try {
        const { restaurantId } = req.params;
        
        const query = `
            SELECT f.*, u.name as userName
            FROM feedback f
            JOIN users u ON f.user_id = u.id
            WHERE f.restaurant_id = ?
            ORDER BY f.timestamp DESC
        `;
        
        const [feedbacks] = await db.query(query, [restaurantId]);
        
        res.json(feedbacks);
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ message: 'Error fetching feedback' });
    }
});

module.exports = router; 