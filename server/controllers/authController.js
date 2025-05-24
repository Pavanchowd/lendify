const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const haversine = require('haversine');


const registerUser = async (req, res) => {
  const { name, phoneNumber, email, password, confirmPassword } = req.body;

  // Check if all fields are provided
  if (!name || !phoneNumber || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Please fill all the fields' });
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]{3,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }
  // Check if password and confirm password match
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    // Check if the user already exists
    const userExists = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email or phone number already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Hashed password during registration:', hashedPassword);

    // Create a new user
    const user = new User({
      name,
      phoneNumber,
      email,
      password: hashedPassword,
    });
    
    // Save the user to the database
    await user.save();
    console.log('Saved user ID:', user._id);
    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ message: 'User created successfully', token, userId: user._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
 
  try {
    if (!req.body) {
      return res.status(400).json({ message: 'Request body is missing' });
    }
    const { email, password } = req.body;
    console.log(req.body);
    const user = await User.findOne( { email });
   
    if (!user) {
      console.log('Login attempt - User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
     
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Login attempt - Password mismatch for:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
     console.log(user.password);
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Successful login for:', email);
    res.json({
      message: 'Login successful',
      token,
      userId: user._id,
      name: user.name
      
    });

  } catch (err) {
    console.error('Login error details:');
    console.error('Error message:', err.message);
    console.error('Stack trace:', err.stack);
    console.error('Request body:', req.body);
    res.status(500).json({ message: 'Server error' });
  }
};

// Fetch user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  const { name, phoneNumber } = req.body;

  if (!name || !phoneNumber) {
    return res.status(400).json({ message: 'Name and phone number are required' });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name;
    user.phoneNumber = phoneNumber;

    if (req.file) {
      user.profilePic = req.file.path; // ✅ Match the field name with your model
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      name: user.name,
      phoneNumber: user.phoneNumber,
      profilePic: user.profilePic,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
// Sample request to save lender details in the backend
const handleLendMoney = async () => {
  if (!amount || !interest || !duration || !location) {
    setError('Please fill out all fields before lending.');
    return;
  }
}
  // Save lender details to backend
  const handleLendClick = async () => {
    const lenderData = {
      amount,
      interest,
      duration,
      location: { latitude, longitude }, // obtained from geolocation
    };
  
    try {
      const response = await fetch('/api/lenders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lenderData),
      });
  
      if (response.ok) {
        console.log('Offer successfully submitted');
      }
    } catch (error) {
      console.log('Error submitting offer:', error);
    }
  };
  const handleBorrowClick = async () => {
    const borrowerLocation = { latitude, longitude }; // From geolocation
    const distance = selectedRange; // From UI dropdown
  
    try {
      const response = await fetch(`/api/borrowers/${borrowerId}/offers?distance=${distance}`, {
        method: 'GET',
      });
  
      if (response.ok) {
        const data = await response.json();
        setLenders(data);
      }
    } catch (error) {
      console.log('Error fetching lenders:', error);
    }
  };
  
  const handleRequestLoan = async (lenderId) => {
    const loanData = {
      lenderId,
      borrowerId,
      amount,
      interest,
      duration,
    };
  
    try {
      const response = await fetch('/api/loan-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loanData),
      });
  
      if (response.ok) {
        alert('Loan request sent!');
      }
    } catch (error) {
      console.log('Error sending loan request:', error);
    }
  };
  
const getLendersWithinDistance = async (borrowerLocation, maxDistance) => {
  const lenders = await LenderModel.find(); // Fetch all lenders from the database

  const nearbyLenders = lenders.filter((lender) => {
    const lenderLocation = { latitude: lender.latitude, longitude: lender.longitude };
    const distance = haversine(borrowerLocation, lenderLocation, { unit: 'km' });

    return distance <= maxDistance; // Only include lenders within the max distance
  });

  return nearbyLenders;
};

module.exports = { registerUser,login,getUserProfile,updateUserProfile };
