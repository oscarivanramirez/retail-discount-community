import Message from '../models/Message.js';

// Get all messages between the authenticated user and another user
export const getMessagesBetweenUsers = async (req, res) => {
    try {
        const userId = req.user._id; // From the authentication middleware
        const { recipientId } = req.params; // The other user's ID is passed as a parameter
        
        const messages = await Message.find({
            $or: [
                { senderId: userId, recipientId },
                { senderId: recipientId, recipientId: userId }
            ]
        }).sort({ timestamp: -1 });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Send a message. ALREADY HAVE WEBSOCKET SO REDUNDANT
/*
export const sendMessage = async (req, res) => {
    try {
        const message = new Message(req.body);
        const savedMessage = await message.save();
        res.status(201).json(savedMessage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
*/