import Message from "../models/Message.js";

export const getInboxSummary = async (req, res) => {
    try {
        const userId = req.user._id; // From the authentication middleware

        console.log(`Type of userId: ${typeof userId}, Value of userId: ${userId}`);
        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [{ senderId: userId }, { recipientId: userId }],
                },
            },
            {
                $sort: { timestamp: -1 },
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$senderId", userId] },
                            "$recipientId",
                            "$senderId",
                        ],
                    },
                    lastMessage: { $first: "$$ROOT" },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { $and: [{ $eq: ["$recipientId", userId] }, { $eq: ["$status", "Sent"] }] },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'counterpart',
                },
            },
            {
                $unwind: "$counterpart",
            },
            {
                $project: {
                    _id: 0,
                    counterpart: {
                        _id: 1,
                        username: 1, // Adjust based on what user information you want to send
                        // Add any other user info you want to include
                    },
                    lastMessage: 1,
                    unreadCount: 1,
                },
            },
        ]);

        res.status(200).json(conversations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
