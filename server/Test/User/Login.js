import { expect } from 'chai';
import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../../index.js';
import User from '../../models/User.js'; 


chai.use(chaiHttp);


describe.only('User Authentication Tests', () => {

    describe('POST /api/users/login', () => {
        
        it('should login successfully with correct credentials', async () => {
            const response = await chai.request(app)
                .post('/api/users/login')
                .send({
                    email: 'testuser@example.com',
                    password: 'Test@1234',
                });
            
            console.log("Response Body:", response.body);
            console.log("Response Text:", response.text);
            console.log("Response Error:", response.error);

            
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('token');
            expect(response.body).to.have.property('user');
            expect(response.body.user.email).to.equal('testuser@example.com');
        });

        it('should return 400 for incorrect credentials', async () => {
            const response = await chai.request(app)
                .post('/api/users/login')
                .send({
                    email: 'testuser@example.com',
                    password: 'WrongPassword',
                });

            expect(response.status).to.equal(400);
            expect(response.body.message).to.equal('Incorrect password!');
        });

        it('should return 400 for non-existent user', async () => {
            const response = await chai.request(app)
                .post('/api/users/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'Test@1234',
                });

            expect(response.status).to.equal(400);
            expect(response.body.message).to.equal('User not found!');
        });

    });

});

