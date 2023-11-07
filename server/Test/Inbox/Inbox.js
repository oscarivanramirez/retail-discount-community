import { expect } from 'chai';
import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../../index.js'; // Ensure this path leads to your server's entry point file

chai.use(chaiHttp);

describe('GET /api/inbox/summary', () => {
    let authToken;

    before(async () => {

        const authResult = await chai.request(app)
            .post("/api/users/login")
            .send({
                email: "testuser@example.com",
                password: "Test@1234",
            });

        expect(authResult.status).to.equal(200);
        expect(authResult.body).to.have.property('token');
        authToken = authResult.body.token;

        // You should also create a couple of messages here involving the test user
        // to ensure that there is data to fetch from the /api/inbox/summary endpoint.
    });

    after(async () => {
        // Clean up: delete test user and messages
        // Ensure that your tests clean up after themselves so that test runs are independent
    });

    it('should get the inbox summary for the authenticated user', async () => {
        const response = await chai.request(app)
            .get('/api/inbox/summary')
            .set('Authorization', `Bearer ${authToken}`);

        console.log("Response Body:", response.body);

        expect(response.status).to.equal(200);
        // The actual tests will depend on the data structure you are expecting back
        // For example:
        // expect(response.body).to.be.an('array');
        // expect(response.body[0]).to.have.all.keys('counterpart', 'lastMessage', 'unreadCount');
        // More assertions can be added here to validate the response further
    });

    // Add additional it() blocks for more tests as needed, such as error handling for unauthorized access

    // ... 
});
