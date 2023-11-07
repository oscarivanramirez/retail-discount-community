import { expect } from 'chai';
import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../../index.js';
import User from '../../models/User.js'; 


chai.use(chaiHttp);

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