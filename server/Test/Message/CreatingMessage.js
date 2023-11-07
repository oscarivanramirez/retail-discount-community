import { expect } from 'chai';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Message from '../../models/Message.js'; // Make sure this is the correct path to your Message model

dotenv.config();

describe('Message Model Tests', () => {
    // Using static IDs for test users
    const testUser1ID = '6547fb2589c3f91104e1c99a';
    const testUser2ID = '6547fb2689c3f91104e1c9a0';

    before(async () => {
        // Connect to the test database
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Database connected for testing.');

        // Optionally clear previous messages if necessary
        await Message.deleteMany({
            $or: [
                { senderId: testUser1ID, recipientId: testUser2ID },
                { senderId: testUser2ID, recipientId: testUser1ID },
            ],
        });
    });

    it('should create and save a new message from User 1 to User 3', async () => {
        const message1 = await Message.create({
            senderId: testUser1ID,
            recipientId: testUser2ID,
            content: 'Hi there User 3!',
            status: 'Sent',
        });

        expect(message1).to.have.property('content', 'Hi there User 3!');
        expect(message1).to.have.property('status', 'Sent');
        expect(message1.senderId.equals(testUser1ID)).to.be.true;
        expect(message1.recipientId.equals(testUser2ID)).to.be.true;
    });

    it('should create and save a new message from User 3 to User 1', async () => {
        const message2 = await Message.create({
            senderId: testUser2ID,
            recipientId: testUser1ID,
            content: 'Hi there User 1!',
            status: 'Sent',
        });

        expect(message2).to.have.property('content', 'Hi there User 1!');
        expect(message2).to.have.property('status', 'Sent');
        expect(message2.senderId.equals(testUser2ID)).to.be.true;
        expect(message2.recipientId.equals(testUser1ID)).to.be.true;
    });

    it('should create and save another new message from User 1 to User 3', async () => {
        const message3 = await Message.create({
            senderId: testUser1ID,
            recipientId: testUser2ID,
            content: 'You LAME!',
            status: 'Sent',
        });

        expect(message3).to.have.property('content', 'You LAME!');
        expect(message3).to.have.property('status', 'Sent');
        expect(message3.senderId.equals(testUser1ID)).to.be.true;
        expect(message3.recipientId.equals(testUser2ID)).to.be.true;
    });

    after(async () => {
        // Clean up: delete the test messages
        /*
        await Message.deleteMany({
            $or: [
                { senderId: testUser1ID, recipientId: testUser2ID },
                { senderId: testUser2ID, recipientId: testUser1ID },
            ],
        });
        */
        // Disconnect from the test database
        await mongoose.disconnect();
    });
});
