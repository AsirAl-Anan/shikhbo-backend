import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';

export const protectedRoute = async (req, res, next) => {
  try {
    // Get tokens from cookies
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken && !refreshToken) {
      console.log("No token found in cookies");
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    let tokenToVerify = accessToken || refreshToken;
    let secret = accessToken ? process.env.JWT_ACCESS_SECRET : process.env.JWT_REFRESH_SECRET;

    // Verify whichever token is available
    const decoded = await jwt.verify(tokenToVerify, secret);

    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      console.log("Invalid token");
      console.log(error);
      return res.status(401).json({ message: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      console.log("Token expired");
      console.log(error);
      return res.status(401).json({ message: 'Token expired' });
    }

    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
