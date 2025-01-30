import * as chai from 'chai';
import chaiHttp from 'chai-http';

const baseUrl = "http://localhost:4000";

chai.use(chaiHttp);

describe("getSeat Test", function() {
  it('server is live', function(done) {
    chai.request(baseUrl)
      .get('/seat')
      .end(function(err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        done();
      });
  });

  it('should return a specific seat by ID', function(done) {
    const seatId = 1; // Beispiel-ID, anpassen je nach vorhandenen Daten
    chai.request(baseUrl)
      .get(`/seat/${seatId}`)
      .end(function(err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('seatId', seatId);
        expect(res.body).to.have.property('properties');
        expect(res.body).to.have.property('coordinates');
        done();
      });
  });

  it('should return seat details by coordinates', function(done) {
    const x = 20; // Beispielkoordinaten, anpassen je nach vorhandenen Daten
    const y = 30;
    chai.request(baseUrl)
      .get(`/seat/by-coordinates?x=${x}&y=${y}`)
      .end(function(err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('seatId');
        expect(res.body).to.have.property('properties');
        expect(res.body).to.have.property('coordinates');
        done();
      });
  });
});