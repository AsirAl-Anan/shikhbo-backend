
import jwt from 'jsonwebtoken';

// Generate access token (short-lived)
export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_ACCESS_SECRET,
    
  );
};

// Generate refresh token (long-lived)
export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_REFRESH_SECRET,
   
  );
};
