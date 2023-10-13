import { expect } from 'chai';
import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../index.js'; // Adjust this to point to your main server file
import User from '../models/User.js'; // Adjust this to point to your user model


chai.use(chaiHttp);

describe('User Registration', () => {

    // Clear the database before each test
    beforeEach(async () => {
        try {
            await User.deleteMany({});
            console.log('All users deleted.');
        } catch (err) {
            console.error('Error deleting users:', err);
        }
    });    

    const brands = ['adidas', 'puma', 'nike', 'gamestop'];

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
            permanentAddress: {
                street: '10239 47th Ave',
                city: 'Corona',
                state: 'NY',
                zip: '11368',
                country: 'USA'
            }
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

describe.only('GET /nearbyuser', () => {
    it('should find users near given latitude and longitude', (done) => {
        chai.request(app)
            .get('/api/users/nearby?latitude=40.7128&longitude=-74.0060&radius=10')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });

    it.only('should find users near given address', (done) => {
        chai.request(app)
            .get('/api/users/nearby?address=10239+47th+Ave,+Corona,+NY+11368&radius=5')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });
    it.only('should find users near given address', (done) => {
        chai.request(app)
            .get('/api/users/nearby?address=10239+47th+Ave,+Corona,+NY+11368&radius=5&brands=puma')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });

    it('should find users near given zipcode', (done) => {
        chai.request(app)
            .get('/api/users/nearby?zipcode=94043&radius=10')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });

    it('should filter users by brands', (done) => {
        chai.request(app)
            .get('/api/users/nearby?latitude=40.7128&longitude=-74.0060&radius=10&brands=nike,adidas')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                // Optionally, you can check if all returned users work at either 'nike' or 'adidas'
                res.body.forEach(user => {
                    expect(['nike', 'adidas']).to.include(user.worksAt);
                });
                done();
            });
    });

    it('should return an error if no location data is provided', (done) => {
        chai.request(app)
            .get('/api/users/nearby?radius=10')
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message', 'Provide latitude/longitude or address or zipcode.');
                done();
            });
    });

    // Additional test cases as needed...
});