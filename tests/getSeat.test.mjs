const chai = import("chai");
const chaiHttp = import("chai-http");
const expect = chai.expect
const baseUrl = "localhost:4000/"

chai.use(chaiHttp);

const mockSeats = [
    { 
      seatId: 1, 
      properties: {table: { type: 'string', required: false },
      monitor: { type: 'string', required: false },
      windowSeat: { type: 'string', required: false }}, 
      coordinates: { x: 10, y: 20 }
    },
    { 
      seatId: 2, 
      properties: {tableType: { type: 'string', required: false },
      accessibility: { type: 'string', required: false },
      acoustics: { type: 'string', required: false }}, 
      coordinates: { x: 15, y: 25 }
    },
    { 
      seatId: 3, 
      properties: {workTop: { type: 'string', required: false },
      chair: { type: 'string', required: false }}, 
      coordinates: { x: 20, y: 30 }
    }
  ];

  
  
describe("getSeat Test", function(){
it('server is live', function(done) {
        chai.request(baseUrl)
        .get('/seat')
        .end(function (err, res) {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("array");
            expect(res.body).to.deep.equal(mockSeats);
            done();
        });
    })
})