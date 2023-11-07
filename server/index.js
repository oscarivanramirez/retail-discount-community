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
import http from 'http';
import { Server } from 'socket.io';
import Message from './models/Message.js';
import messageRoutes from './routes/Message.js';
import authenticateUser from './middlewares/auth.js';
import sharedsession from 'express-socket.io-session';
import jwt from 'jsonwebtoken';
import inboxRoutes from './routes/Inbox.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware
app.use(express.json());
app.use(helmet());
app.use(morgan('common'));
app.use(cors({
    origin: 'http://localhost:3000', // Your frontend's origin
    credentials: true,
}));


// Session Configuration for OAuth  // <-- Added for session handling
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false
});

app.use(sessionMiddleware);

io.use(sharedsession(sessionMiddleware, {
    autoSave: true
}));

// Passport middleware initialization for OAuth  // <-- Added for passport
app.use(passport.initialize());
app.use(passport.session());

// Set up passport strategies
setUpGoogleStrategy();

// Use the user routes
app.use('/api/users', userRoutes);
app.use('/api/messages', authenticateUser, messageRoutes);
app.use('/api/inbox', authenticateUser, inboxRoutes);


io.use((socket, next) => {
    // JWT Authentication
    const token = socket.handshake.query.token;
    if (token) {
        jwt.verify(token, 'YOUR_JWT_SECRET', (err, decoded) => {
            if (err) return next(new Error('JWT Authentication error'));

            socket.decoded = decoded;
            return next();
        });
    } 
    // Session-based Authentication (for OAuth)
    else if (socket.handshake.session && socket.handshake.session.passport && socket.handshake.session.passport.user) {
        socket.user = socket.handshake.session.passport.user;
        return next();
    } else {
        return next(new Error('Authentication error'));
    }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    if (socket.decoded) {
        console.log("JWT Authenticated user:", socket.decoded);
    }
    
    if (socket.user) {
        console.log("Session Authenticated user:", socket.user);
    }
    const userId = socket.decoded ? socket.decoded._id : (socket.user ? socket.user._id : null);

    if (userId) {
        userSocketIdMap[userId] = socket.id;

        // You can now use userId to track the user throughout their socket session
    } else {
        // Handle the case where the userId is not available due to failed authentication
        if (!userId) {
            throw new Error('User ID not found in socket session');
        }
    }
    socket.on('sendMessage', async (data) => {
        try {
            // Check where the user info is stored and get the user ID accordingly
            //const userId = socket.decoded ? socket.decoded._id : (socket.user ? socket.user._id : null);
            
            

            // Add the sender's user ID to the message data
            const messageData = {
                ...data,
                senderId: userId
            };

            const newMessage = new Message(messageData);
            const savedMessage = await newMessage.save();

            // Emit the message to the recipient only
            // Note: This requires you to maintain a map of user IDs to socket IDs
            // socket.to(userSocketIdMap[savedMessage.recipientId.toString()]).emit('receiveMessage', savedMessage);

            // For now, just broadcast to all clients, but in production, you would target specific users
            // This will send to all clients, including the sender
            // io.emit('receiveMessage', savedMessage);

            // If you want to send to all clients except the sender
            // socket.broadcast.emit('receiveMessage', savedMessage);

            // If you want to send to a specific user, find their socket ID from the user ID
            const recipientSocketId = userSocketIdMap[data.recipientId];
            if (recipientSocketId) {
                // This sends to the recipient user only
                io.to(recipientSocketId).emit('receiveMessage', savedMessage);
            }

            // Optionally, confirm to the sender that the message was sent by emitting back to sender's socket
            socket.emit('messageSent', savedMessage);

        } catch (error) {
            console.error('Error sending message:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        if (userId) {
            delete userSocketIdMap[userId];
        }
    });
});

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
server.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});

export default app;
