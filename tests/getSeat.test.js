const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect
const baseUrl = "localhost:4000/"

chai.use(chaiHttp);
describe("getSeat Test", function(){
it('server is live', function(done) {
        chai.request(baseUrl)
        .get('/')
        .end(function (err, res) {
            expect(res).to.have.status(200);
            expect(res.text).to.equal("Hurray! Its live.");
            done();
        });
    })
})