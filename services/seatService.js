const seat = require('../models/seat');

async function deleteOneSeat(seatId) {
    return seat.deleteOne({seatId: seatId});    
}

module.exports = { deleteOneSeat };
