const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // No `.js` needed in CommonJS
const dotenv = require('dotenv');

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const googleAuthCallback = async (req, res) => {
  const { id_token } = req.body;

  if (!id_token) {
    return res.status(400).json({ message: 'No ID token provided' });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.sub || !payload.email || !payload.name) {
      return res.status(401).json({ message: 'Invalid Google token payload' });
    }

    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      user = await User.create({
        googleId,
        email,
        name,
        picture,
      });
    }

    const token = generateToken(user._id.toString());

    res.status(200).json({
      message: 'Google login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error('Google Auth Error:', error.message);
    res.status(500).json({ message: 'Google authentication failed', error: error.message });
  }
};
const verifyToken = async (req, res) => {
  try {
    // The auth middleware already verified the token
    res.status(200).json({ 
      user: req.user 
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
// Export function using CommonJS syntax
module.exports = { googleAuthCallback, verifyToken };

