require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const loginRoute = require('./services/Login');
const route53Route = require('./services/route53');

const app = express();

const corsOptions = {
  origin: "*", // Allows all origins
  methods: "*", // Allows all HTTP methods
  allowedHeaders: "*", // Allows all headers
};

app.use(cors(corsOptions));
app.use(express.json());

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

const TestSchema = new mongoose.Schema({ name: String });
const TestModel = mongoose.model('Test', TestSchema);

app.use('/', loginRoute);
app.use('/route53', route53Route);

app.get('/', (req, res) => {
  res.send('Hello, your server is running!');
});

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

app.get('/test', async (req, res) => {
  try {
    const docs = await TestModel.find();
    res.status(200).json(docs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents', error: error.message });
  }
});

module.exports = app;
