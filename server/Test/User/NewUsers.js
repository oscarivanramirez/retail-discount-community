import { expect } from 'chai';
import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../../index.js';
import User from '../../models/User.js'; 


chai.use(chaiHttp);

describe('User Registration', () => {

    // Clear the database before each test
    /*beforeEach(async () => {
        try {
            await User.deleteMany({});
            console.log('All users deleted.');
        } catch (err) {
            console.error('Error deleting users:', err);
        }
    });*/  

    const testUsers = [
        {
            username: 'testUser',
            email: 'testuser@example.com',
            password: 'Test@1234',
            firstname: 'Test',
            lastname: 'User',
        },
        {
            username: 'testUser2',
            email: 'testuser2@example.com',
            password: 'Test@1234',
            firstname: 'Test2',
            lastname: 'User2',
        },
        {
            username: 'testUser3',
            email: 'testuser3@example.com',
            password: 'Test@1234',
            firstname: 'Test3',
            lastname: 'User3',
        },
        {
            username: 'testUser4',
            email: 'testuser4@example.com',
            password: 'Test@1234',
            firstname: 'Test4',
            lastname: 'User4',
        },
        {
            username: 'testUser5',
            email: 'testuser5@example.com',
            password: 'Test@1234',
            firstname: 'Test5',
            lastname: 'User5',
        }
    ];

    it('should register multiple users sequentially', async function() {
        this.timeout(10000);  // Increase timeout for this test as we're handling multiple async operations

        for (let user of testUsers) {
            await new Promise((resolve, reject) => {
                chai.request(app)
                    .post('/api/users/register')
                    .send(user)
                    .end((err, res) => {
                        if (err) {
                            console.error("Error:", err);
                            reject(err);
                        } else {
                            console.log("Response body:", res.body);
                            expect(res).to.have.status(201);
                            expect(res.body).to.be.an('object');
                            expect(res.body).to.have.property('username').eql(user.username);
                            resolve();
                        }
                    });
            });
        }
    });
    /*
    it('should not register a user with existing email', (done) => {
        const newUser = {
            username: 'testUser',
            email: 'testuser@example.com',
            password: 'Test@1234',
            firstname: 'Test',
            lastname: 'User',
        };

        // First register a user
        chai.request(app)
            .post('/api/users/register')
            .send(newUser)
            .end((err, res) => {
                // Try registering again with the same email
                chai.request(app)
                    .post('/register')
                    .send(newUser)
                    .end((err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property('message').eql('User already exists!');
                        done();
                    });
            });
    });
    */
    // Add more test cases as needed
});