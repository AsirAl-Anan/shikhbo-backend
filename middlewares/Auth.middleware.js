import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';
export const protectedRoute = async (req, res, next) => {
  try {
      
    // Get token from cookies
    const token = req.cookies.accessToken;

    if (!token) {
     console.log("No token found in cookies")
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
 
    // if(!token && req.cookies.refreshToken) {
    
    //   const refreshToken = req.cookies.refreshToken;
     
    //   const decoded =await jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    //   const user = await User.findById(decoded.id).select('-password');
    //   console.log("user", user)
    //   const newAccessToken = generateAccessToken(user);
    // }

    // Verify token
    const decoded =await jwt.verify(token, process.env.JWT_ACCESS_SECRET);
   

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
      console.log("Invalid token")
      console.log(error)
      return res.status(401).json({ message: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      console.log("Token expired")
      console.log(error)
      return res.status(401).json({ message: 'Token expired' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

