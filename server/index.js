import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import userRoutes from './routes/User.js';  // adjust the path if necessary
import { setUpGoogleStrategy } from './controllers/User.js';
import passport from 'passport';
import session from 'express-session';  // <-- Added for session handling

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(helmet());
app.use(morgan('common'));
app.use(cors());

// Session Configuration for OAuth  // <-- Added for session handling
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret', // Preferably from environment variable
    resave: false,
    saveUninitialized: true
}));

// Passport middleware initialization for OAuth  // <-- Added for passport
app.use(passport.initialize());
app.use(passport.session());

// Set up passport strategies
setUpGoogleStrategy();

// Use the user routes
app.use('/api/users', userRoutes);

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

// Test route
app.get('/', (req, res) => {
    res.send('Server is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});

export default app;
