// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const loginRoute =require('./services/Login');

// Initialize the Express application
const app = express();
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(express.json());

app.use('/login',loginRoute)



app.get('/', (req, res) => {
  res.send('Hello, your server is running!');
});

app.get("/login",(req,res)=>{
  res.render("login");
})

app.get("/register",(req,res)=>{
  res.render("register");
})


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
