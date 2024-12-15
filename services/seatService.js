const seat = require('../models/seat');

async function deleteOneSeat(seatId) {
    return seat.deleteOne({seatId: seatId});    
}

async function findSeat(seatId) {
    return seat.findOne({ seatId: seatId }); 
}

module.exports = { deleteOneSeat, findSeat };
