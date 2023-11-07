import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authenticateUser = (req, res, next) => {
  // JWT authentication
  console.log("MIDDLEWARE REQ SESSION", req.session, "REQ", req.headers);
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    const token = req.headers.authorization.split(' ')[1];
    
    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
        if (err) {
          return res.status(401).json({ error: 'Failed to authenticate token' });
        } else {
          try {
            // Fetch the user from the database based on ID in the JWT
            console.log("DECODEDTOKEN FROM MIDDLEWARE", decodedToken);
            const user = await User.findById(decodedToken.userId);
  
            if (!user) {
              return res.status(401).json({ error: 'User not found' });
            }
  
            req.user = user;
            next();
          } catch (dbError) {
            return res.status(500).json({ error: 'Error fetching user from database' });
          }
        }
    });
  } 
  // Google OAuth authentication
  else if (req.session && req.session.passport && req.session.passport.user) {
    next();
  } 
  // No authentication provided
  else {
    return res.status(401).json({ error: 'No auth token provided' });
  }
};

export default authenticateUser;
