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

    const brands = ['Adidas', 'Puma', 'Nike', 'Gamestop'];

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

/*
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
*/

/*
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
*/

describe('PATCH /verification', () => {
    let authToken;

    before(async () => {
        // Perform authentication and get an authentication token
        const authResult = await chai.request(app)
            .post("/api/users/login")
            .send({
                email: "testuser2@example.com",
                password: "Test@1234",
            });

        // Expectations to prove successful login
        expect(authResult.status).to.equal(200);
        expect(authResult.body).to.have.property('token');
        expect(authResult.body).to.have.property('user');
        expect(authResult.body.user.email).to.equal('testuser2@example.com');
        authToken = authResult.body.token;
    });
    
    it('should update user successfully with valid JWT token', async () => {
        const response = await chai.request(app)
            .patch('/api/users/verification')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                IsRetailVerified: true,
                permanentAddress: {
                    street: "102-35 47th Ave",
                    city: "Corona",
                    state: "NY",
                    zip: "11368",
                    country: "USA"
                },
                phoneNumber: "4512367899",
                worksAt: "Nike"
            });
            console.log("Response Body:", response.body);
            console.log("Response Text:", response.text);
            console.log("Response Error:", response.error);

        expect(response.status).to.equal(200);
        expect(response.body.message).to.equal('User updated successfully!');
    });
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
            .get('/api/users/nearby?address=102-39+47th+Ave,+Queens,+NY+11368,+USA&zipcode=&radius=5&usedCurrentLocation=false')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });
    it('should find users near given address', (done) => {
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