 import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard'; // This would be your post-login page
import Profile from './components/Profile'
import Borrow from './components/Borrow';
import Lend from './components/Lend';
import Transactions from './components/Transactions';
const App = () => {
  return (
    <Router>
      <CssBaseline />
        {/* Optional: Include a navbar if needed */}

      <Routes>
        {/* Define the route paths for Login and Register */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected route after login */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/borrow" element={<Borrow />} />
        <Route path="/lend" element={<Lend />} />
        <Route path="/transactions" element={<Transactions/>}/>
      </Routes>
    </Router>
  );
};

export default App;
 
