import express from 'express';
import { register, login, nearbyUser, verification, googleCallback, setUsername } from '../controllers/User.js';
import passport from 'passport';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/nearby', nearbyUser);
//need to include verification of user middleware. from verified.js
router.patch('/verification/:id', verification);

router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', 
    passport.authenticate('google', { session: false }),//{ session: false, failureFlash: true }),
    googleCallback
);



router.post('/set-username', setUsername);


export default router;
