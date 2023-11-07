import express from 'express';
import { getMessagesBetweenUsers } from '../controllers/Message.js';

const router = express.Router();

// Get messages between two users
router.get('/between/:recipientId', getMessagesBetweenUsers);

// Send a message ALREADY HAVE WEBSOCKET SO REDUNDANT
//router.post('/', sendMessage);

// ... Add routes for other operations like updating, deleting, marking as read, etc.

export default router;
