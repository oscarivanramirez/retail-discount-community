import express from 'express';
import { register, login, nearbyUser, verification, 
  googleCallback, setUsername, followUser,
  unfollowUser, getAllFollowing, getAllFollowers, meData,
  logout} from '../controllers/User.js';
import passport from 'passport';
import authenticateUser from '../middlewares/auth.js'

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/nearby', nearbyUser);

//need to include verification of user middleware. from verified.js
// Follow another user
router.post('/follow/:userId', authenticateUser, followUser);

// Unfollow a user
router.post('/unfollow/:userId', authenticateUser, unfollowUser);

// Get all users that the current user is following
router.get('/following', authenticateUser, getAllFollowing);

// Get all users that are following the current user
router.get('/followers', authenticateUser, getAllFollowers);

//i dont need /:id because i have access to req.user
router.patch('/verification', authenticateUser, verification);
//router.patch('/verification/:id', verification);

router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', 
    passport.authenticate('google'),
    googleCallback
);

router.get('/me', authenticateUser, meData);

router.post('/set-username', setUsername);


export default router;
