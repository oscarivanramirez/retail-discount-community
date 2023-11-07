import { expect } from 'chai';
import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../../index.js'; // Replace with the correct path to your express app

chai.use(chaiHttp);

describe('Message Endpoint Tests', () => {
    let userToken;

    const testUserCredentials = {
        email: 'testuser@example.com',
        password: 'Test@1234',
    };

    // Log in user before the tests
    before(async () => {
        const loginResponse = await chai.request(app)
            .post('/api/users/login')
            .send(testUserCredentials);
        
        expect(loginResponse.status).to.equal(200);
        expect(loginResponse.body).to.have.property('token');
        userToken = loginResponse.body.token;
    });

    describe('GET /api/messages/between/:recipientId', () => {
        it('should retrieve all messages between the user and the recipient', async () => {
            const recipientId = '6547fb2689c3f91104e1c99d'; // Replace with a valid ObjectId from your database

            const response = await chai.request(app)
                .get(`/api/messages/between/${recipientId}`)
                .set('Authorization', `Bearer ${userToken}`); // Assuming you're using Bearer tokens

            expect(response.status).to.equal(200);
            console.log('RESPONSE',response.body);
            // Here you would check for the actual messages returned
            // The exact expectations will depend on what your API returns
        });

        // You can add more tests here to cover other scenarios
    });

    // Optionally, clean up after tests if needed
    after(async () => {
        // If you need to clean up database entries or other tasks after the tests
    });
});
