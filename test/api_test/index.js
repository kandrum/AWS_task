// Import necessary modules
require('dotenv').config(); // Make sure this is at the top

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import the cors package

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

// Define a test schema and model
const TestSchema = new mongoose.Schema({ name: String });
const TestModel = mongoose.model('Test', TestSchema);

// Use combined route
app.use('/', loginRoute);
app.use('/route53', route53Route);

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

// Test route to create a document
app.post('/test', async (req, res) => {
  const { name } = req.body;
  try {
    const doc = new TestModel({ name });
    await doc.save();
    res.status(201).json({ message: 'Document created', doc });
  } catch (error) {
    res.status(500).json({ message: 'Error creating document', error: error.message });
  }
});

// Test route to fetch documents
app.get('/test', async (req, res) => {
  try {
    const docs = await TestModel.find();
    res.status(200).json(docs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents', error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
