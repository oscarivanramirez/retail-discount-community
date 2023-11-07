import { expect } from 'chai';
import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../../index.js';
import User from '../../models/User.js'; 


chai.use(chaiHttp);

describe.only('PATCH /verification', () => {
    let authToken;

    before(async () => {
        // Perform authentication and get an authentication token
        const authResult = await chai.request(app)
            .post("/api/users/login")
            .send({
                email: "testuser@example.com",
                password: "Test@1234",
            });

        // Expectations to prove successful login
        expect(authResult.status).to.equal(200);
        expect(authResult.body).to.have.property('token');
        expect(authResult.body).to.have.property('user');
        expect(authResult.body.user.email).to.equal('testuser@example.com');
        authToken = authResult.body.token;
    });
    
    it.only('should update user successfully with valid JWT token', async () => {
        const response = await chai.request(app)
            .patch('/api/users/verification')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                IsRetailVerified: true,
                permanentAddress: {
                    street: "86-01 Broadway",
                    city: "Elmhurst",
                    state: "NY",
                    zip: "11373",
                    country: "USA"
                },
                phoneNumber: "1234567899",
                worksAt: "Nike"
            });
            console.log("Response Body:", response.body);
            console.log("Response Text:", response.text);
            console.log("Response Error:", response.error);

        expect(response.status).to.equal(200);
        expect(response.body.message).to.equal('User updated successfully!');
    });

    it('should fail when provided with a fake address', async () => {
        const response = await chai.request(app)
            .patch('/api/users/verification')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                IsRetailVerified: true,
                permanentAddress: {
                    street: "123 Fake St",
                    city: "Nowhere",
                    state: "ZZ",
                    zip: "99999",
                    country: "Nowhereland"
                },
                phoneNumber: "123456789",
                worksAt: "Nike"
            });
    
        // Adjust the expected response based on your server's error handling. 
        // For example, if you're sending a 400 status with an 'Invalid address' message:
        expect(response.status).to.equal(400);
        expect(response.body.message).to.equal('Invalid address provided');
    });

    it('should fail due to missing JWT token', async () => {
        const response = await chai.request(app).patch('/verification');

        expect(response.status).to.equal(401);
        expect(response.body.error).to.equal('No auth token provided');
    });

    it('should fail due to invalid JWT token', async () => {
        const response = await chai.request(app)
            .patch('/verification')
            .set('Authorization', 'Bearer invalidToken');

        expect(response.status).to.equal(401);
        expect(response.body.error).to.equal('Failed to authenticate token');
    });
    
    // Add more tests as needed...
});