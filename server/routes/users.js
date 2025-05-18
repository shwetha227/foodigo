const express = require('express');
const router = express.Router();

// Example test route
router.get('/test', (req, res) => {
    res.send('User route working!');
});

module.exports = router; 