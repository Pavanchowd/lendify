const express = require('express');
const { registerUser, login, getUserProfile, updateUserProfile } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    // Create directory if missing
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

router.get('/user', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id); // Fetching the user based on the ID from the token
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    res.send(user); // Send the user data back as a response
  } catch (err) {
    res.status(500).send({ message: 'Server Error' });
  }
});
// Register route
router.post('/register', registerUser);
router.post('/login', login);
  // Profile routes (protected)
router.get('/profile', authMiddleware, getUserProfile);  // Get user profile
router.put('/profile', authMiddleware, upload.single('profilePic'), updateUserProfile)
module.exports = router;
