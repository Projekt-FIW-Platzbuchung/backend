const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server'); // Ersetzen Sie '../app' mit dem Pfad zu Ihrem Server
const { expect } = chai;

chai.use(chaiHttp);

describe('POST /booking', () => {
    it('should create a new booking', (done) => {
        chai.request(app)
            .post('/booking')
            .send({
                bookingsId: 123,
                userId: 1,
                seatId: 45,
                date: "2024-11-20T14:30:00.000Z"
            })
            .end((err, res) => {
                expect(res).to.have.status(201);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('bookingsId', 123);
                expect(res.body).to.have.property('userId', 1);
                expect(res.body).to.have.property('seatId', 45);
                expect(new Date(res.body.date)).to.eql(new Date("2024-11-20T14:30:00.000Z"));
                done();
            });
    });
});
