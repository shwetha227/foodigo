const express = require('express');
const app = express();
const feedbackRoutes = require('./routes/feedback');
const orderRoutes = require('./routes/orders');

// Routes
app.use('/api/feedback', feedbackRoutes);
app.use('/api/orders', orderRoutes);

// ... rest of the server code ... 