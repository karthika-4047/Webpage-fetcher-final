//server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config(); 
const app = express();
const port = process.env.PORT || 5000  // local port 5000

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',  // Updated to local frontend URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));



// Route imports
const extractUrls = require('./routes/extractUrls');
const linkDetails = require('./routes/linkDetails');
const imageDetails = require('./routes/imageDetails');
const videoDetails = require('./routes/videoDetails');
const pageProperties = require('./routes/pageProperties');
const headingHierarchy = require('./routes/headingHierarchy');
const allDetails = require('./routes/allDetails');

// Test route
app.get('/api/test', (req, res) => {
  res.send('Server is running correctly!');
});

// Route use
app.use('/api/extract-urls', extractUrls);
app.use('/api/link-details', linkDetails);
app.use('/api/image-details', imageDetails);
app.use('/api/video-details', videoDetails);
app.use('/api/page-properties', pageProperties);
app.use('/api/heading-hierarchy', headingHierarchy);
app.use('/api/all-details', allDetails);


app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Internal Server Error:', err.message);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
//complete