//App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import { Home } from './components/Home';
import { Records } from './components/Records';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/records/:domainName" element={<Records />} />
      </Routes>
    </Router>
  );
};

export default App;
