const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const nodemailer = require('nodemailer');
const authMiddleware = require('./middlewares/authMiddleware');
const Lender = require('./models/lender'); 
const cors = require('cors');
const Borrower = require('./models/borrower'); // adjust the path as needed
const auths=require("./middlewares/auth");
const hell=require("./models/Response");
const Transaction = require('./models/transaction'); // adjust path as needed


// Initialize dotenv
dotenv.config();

const app = express();

app.use(express.urlencoded({ extended: true })); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Middleware
app.use(express.json());
app.use(cors()); // If you're using React as frontend, enable CORS
app.use(cors({
  origin: 'http://localhost:3000',  // Allow requests from localhost:3000
  methods: ['GET', 'POST'],        // Allow only GET and POST requests
  allowedHeaders: ['Content-Type'],
  credentials: true // Allow only Content-Type header
}));
const authRoutes = require('./routes/authRoutes');
const auth = require('./middlewares/auth');
const Response = require('./models/Response');
app.use('/api/auth', authRoutes);
// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Routes
// Backend API route for getting lenders within distance range
const calculateDistances = (lenderLocation, borrowerLocation) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (borrowerLocation.lat - lenderLocation.lat) * Math.PI / 180;
  const dLon = (borrowerLocation.lon - lenderLocation.lon) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lenderLocation.lat * Math.PI / 180) *
      Math.cos(borrowerLocation.lat * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km

  return distance;
};
app.post('/api/updateLocation', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { latitude, longitude } = req.body;
    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      isNaN(latitude) ||
      isNaN(longitude)
    ) {
      return res.status(400).json({ message: 'Invalid coordinates' });
    }

    await User.findByIdAndUpdate(userId, {
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
    });

    res.json({ message: 'Location updated successfully' });
  } catch (err) {
    console.error('Failed to update location:', err);
    res.status(500).json({ message: 'Server error updating location' });
  }
});

// Backend API route for getting lenders within distance range
app.post('/api/update-location',  authMiddleware, async (req, res) => {
  const { latitude, longitude } = req.body;

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ message: 'Invalid latitude or longitude' });
  }

  try {
    await User.findByIdAndUpdate(req.userId, {
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      }
    });

    res.status(200).json({ message: 'Location updated' });
  } catch (error) {
    console.error('Failed to update location', error);
    res.status(500).json({ message: 'Server error' });
  }
});
const transporter = nodemailer.createTransport({
  service: 'gmail', // Or use another email service
  auth: {
    user: process.env.EMAIL_USER, // Your email (sender email)
    pass: process.env.EMAIL_PASS, // Your email password
  },
});
const sendLendingOfferToBorrower = async (borrower, lenderOffer) => {
  try {
    // Construct the email message
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to: borrower.email, // Receiver address (borrower's email)
      subject: 'New Lending Offer for You!', // Email subject
      text: `
        Hello ${borrower.name},
        
        You have received a new lending offer:
        
        - Amount: ${lenderOffer.amount}
        - Interest: ${lenderOffer.interest}%
        - Duration: ${lenderOffer.duration} months
        
        Distance from you: ${lenderOffer.distance} km
        
        If you are interested in this offer, please respond accordingly.
        
        Best regards,
        Lendify Team
      `,
    };

    // Send email to borrower
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending lending offer email:', error);
  }
};
app.post('/api/lenders', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(400).json({ message: 'Token is required' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const lenderUser = await User.findById(userId);
    if (!lenderUser || !lenderUser.location?.coordinates?.length) {
      return res.status(400).json({ message: 'Your location is not set properly' });
    }

    const [latitude, longitude] = lenderUser.location.coordinates;
    const { amount, interest, duration } = req.body;

    const lenderOffer = new Lender({
      amount,
      interest,
      duration,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      userId,
    });

    await lenderOffer.save();

    const borrowers = await Borrower.find({
      'location.coordinates.0': { $exists: true },
      'location.coordinates.1': { $exists: true }
    });

    for (const b of borrowers) {
      const coords = b.location?.coordinates;
      if (!Array.isArray(coords) || coords.length < 2) continue;

      const [bLon, bLat] = coords;
      const distKm = calculateDistance(bLat, bLon, latitude, longitude);

      if (distKm <= 4) {
        let rangeLabel;
        if (distKm < 0.5)        rangeLabel = '<500m';
        else if (distKm < 1)     rangeLabel = '1km';
        else if (distKm < 2)     rangeLabel = '2km';
        else if (distKm < 3)     rangeLabel = '3km';
        else if (distKm < 4)     rangeLabel = '4km';
        else                     rangeLabel = '>4km';
      
        sendLendingOfferToBorrower(b, {
          ...lenderOffer.toObject(),
          distance: distKm,
          range: rangeLabel,
        });
      
        lenderOffer.sentTo = lenderOffer.sentTo || [];
        lenderOffer.sentTo.push(b._id);
      }
      
    }

    await lenderOffer.save();

    // ✅ Only send ONE response after processing
    res.status(201).json({ message: 'Lend offer sent to eligible borrowers' });

  } catch (err) {
    console.error('Error lending money:', err);

    // ✅ Only send one error response if something fails
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error while lending money' });
    }
  }
});
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers

  return distance; // Returns the distance in km
}

function deg2rad(deg) {
  return deg * (Math.PI / 180); // Converts degrees to radians
}

app.get('/api/borrower/responses/:range', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    const { range } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const borrowerId = decoded.userId;
     

    const responses = await Lender.find({ 
      sentTo: borrowerId 
    }).populate('userId', 'email');

    const filtered = responses.filter(lender => {
      const dist = lender.distance || 0;

      switch (range) {
        case '<500m': return dist < 0.5;
        case '1km':   return dist < 1;
        case '2km':   return dist < 2;
        case '3km':   return  dist < 3;
        case '4km':   return  dist < 4;
        case '>4km':  return dist >= 4;
        default:      return true;
      }
    });

    res.status(200).json(filtered);
  } catch (err) {
    console.error('Error getting borrower responses:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

 // // GET /api/lenders/responses
app.get('/api/lenders/responses', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(400).json({ message: 'Token is required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const lenderId = decoded.userId; // The current lender's ID

    // Find all lenders' offers that have been sent to the lender's borrowers
    const lenderOffers = await Lender.find({ userId: lenderId });

    if (!lenderOffers || lenderOffers.length === 0) {
      return res.status(404).json({ message: 'No responses found for this lender' });
    }

    // Find borrowers for each lender offer
    const responses = [];
    for (const offer of lenderOffers) {
      const borrowerDetails = await User.find({ '_id': { $in: offer.sentTo } });

      responses.push({
        offer,
        borrowers: borrowerDetails,
      });
    }
    let rangeLabel;
    if (distKm < 0.5)        rangeLabel = '<500m';
    else if (distKm < 1)     rangeLabel = '1km';
    else if (distKm < 2)     rangeLabel = '2km';
    else if (distKm < 3)     rangeLabel = '3km';
    else if (distKm < 4)     rangeLabel = '4km';
    else                     rangeLabel = '>4km';

    res.status(200).json(responses); // Return the lender offers and corresponding borrowers
  } catch (err) {
    console.error('Error fetching lender responses:', err);
    res.status(500).json({ message: 'Server error while fetching lender responses' });
  }
});

 

app.post('/api/loan-requests', async (req, res) => {
  try {
    const { lenderId, borrowerId, amount, interest, duration } = req.body;

    const loanRequest = new LoanRequest({
      lender: lenderId,
      borrower: borrowerId,
      amount,
      interest,
      duration,
      status: 'Pending', // or whatever status you'd like to assign
    });

    await loanRequest.save();
    res.status(200).send('Loan request sent.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating loan request.');
  }
});
// Example of backend route to store lender's offer
const getDistance = (lat1, lon1, lat2, lon2) => {
  // Radius of the Earth in kilometers
  const R = 6371;

  // Convert degrees to radians
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  // Haversine formula
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Distance in kilometers
  const distance = R * c;

  return distance; // returns the distance in kilometers
};

//Correct route definition
 
app.get("/api/borrower/offers", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
   
    const borrower = await User.findById(decoded.userId);
    if (!borrower) return res.status(404).json({ message: "Borrower not found" });

    const borrowerLat = parseFloat(req.query.latitude);
    const borrowerLon = parseFloat(req.query.longitude);
    const range = req.query.range;

    // Distance mapping (in kilometers)
    const rangeMap = {
      '<500m': 0.5,
      '1km': 1,
      '2km': 2,
      '3km': 3,
      '4km': 4,
      '>4km': 100
    };

    const maxDistance = rangeMap[range] || 5;

    const nearbyLenders = await Lender.find({
      userId: { $ne: borrower },
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates:  [borrowerLat, borrowerLon]
          },
          $maxDistance: maxDistance * 1000 // Convert km to meters
        }
      }
    }).populate({
      path: 'userId',  // Was 'user' previously
      select: 'name profilePic'
    });

    res.status(200).json(nearbyLenders);
    
  } catch (err) {
    console.error("Error fetching offers:", err);
    res.status(500).json({ message: "Server error" });
  }
});
app.post('/api/send-response', auth, async (req, res) => {
  const { lenderId, amount, interest, duration } = req.body;
  const borrowerId = req.user.userId;
  console.log(borrowerId);

  try {
    const response = new Response({
      lenderId,
      borrowerId,
      amount,
      interest,
      duration
    });
console.log(response);
    await response.save();
    await Response.findByIdAndUpdate(lenderId, {
      $push: { responses: response._id }
    });
    res.status(201).json({ message: 'Response sent successfully', response });
  } catch (error) {
    console.error('Error saving response:', error);
    res.status(500).json({ message: 'Server error while sending response' });
  }
});

// routes/response.js
app.get('/api/lender-responses', auth, async (req, res) => {
  const lenderId = req.user.id;

  try {
    const responses = await Response.find({ lenderId })
      .populate('borrowerId', 'name email location') // get borrower details
      .sort({ timestamp: -1 });

    res.status(200).json(responses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch responses' });
  }
});

app.get('/api/borrower/profile', auth, async (req, res) => {
  try {
    // Assuming the authenticated user's ID is available in req.user.id (from the JWT token)
    const userId = req.user.userId;
    console.log(userId)
    // Fetch the user's data from the database
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Only send back relevant borrower information (e.g., amount, interest, duration)
    return res.json({
      borrowerId: user._id,
      amount: user.borrowerAmount,  // Example field for the borrower's loan amount
      interest: user.borrowerInterest,  // Example field for interest rate
      duration: user.borrowerDuration,  // Example field for loan duration
    });
    
  } catch (error) {
    console.error('Error fetching borrower data:', error);
    res.status(500).json({ message: 'Error fetching borrower data' });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get("/response",auth,async(req,res)=>{
  try {
    const userId = req.user.userId
    
    const responses = await Response.find({
      lenderId:userId,
    }).populate("borrowerId", "name phoneNumber profilePic");
    console.log("Fetched responses:", responses);

    res.status(200).json(responses);
  } catch (error) {
    console.error('Error fetching borrower data:', error);
    res.status(500).json({ message: 'Error fetching borrower data' }); 
  }
})
// Ensure you have this route in your server
app.delete('/api/requests/:id/reject', auth, async (req, res) => {
  try {
    const response = await Response.findByIdAndDelete(
      req.params.id
       
    );
    
    if (!response) {
      return res.status(404).json({ message: 'Response not found' });
    }
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
 app.get('/api/transactions', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find all transactions where the user is lender or borrower
    const transactions = await Transaction.find({
      $or: [{ lenderId: userId }, { borrowerId: userId }]
    })
    .populate('lenderId', 'name phoneNumber profilePic')  // populate only needed fields
    .populate('borrowerId', 'name phoneNumber profilePic')
    .sort({ createdAt: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
app.post('/api/requests/:id/accept', auth, async (req, res) => {
  try {
    const requestId = req.params.id;
    console.log(requestId);
    
    const response = await Response.findById(requestId);
    if (!response) return res.status(404).json({ message: "Request not found" });

    // Create a transaction with necessary fields
    const transaction = new Transaction({
      lenderId: response.lenderId,
      borrowerId: response.borrowerId,
      amount: response.amount,
      interest: response.interest,
      duration: response.duration,
    });

    await transaction.save();

    // Optionally, delete or update the response/request to mark it as accepted
    await Response.findByIdAndDelete(requestId);

    res.status(200).json({ message: "Request accepted and transaction created", transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
// DELETE /api/lenders/:id
app.delete('/api/lenders/:id', async (req, res) => {
  try {
    const lenderId = req.params.id;
    await Lender.findByIdAndDelete(lenderId);
    res.status(200).json({ message: "Lender deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting lender" });
  }
});
 app.get('/name', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('name');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ name: user.name });
  } catch (error) {
    console.error('Error fetching user name:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

