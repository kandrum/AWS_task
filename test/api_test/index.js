// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import the cors package
require('dotenv').config();

const loginRoute = require('./services/Login'); // Import the combined route
const route53Route = require('./services/route53'); 

// Initialize the Express application
const app = express();

// Enable CORS for all origins
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware to parse JSON bodies
app.use(express.json());

// Use combined route
app.use('/', loginRoute);
app.use('/route53',route53Route);

// Define other routes
app.get('/', (req, res) => {
  res.send('Hello, your server is running!');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
