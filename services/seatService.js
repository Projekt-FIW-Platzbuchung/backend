/**
 * @module seatService
 * @description Service module to handle seat-related operations.
 */

const Seat = require('../models/seat');
const bookings = require('../models/bookings');
const mongoose = require('mongoose');

/**
 * Deletes a seat and all associated bookings from the database.
 * @async
 * @function deleteOneSeat
 * @param {string} seatId - The ID of the seat to delete.
 * @returns {Promise<Object>} - The result of the delete operation, including deletedCount.
 * @throws Will throw an error if the operation fails.
 */
async function deleteOneSeat(seatId) {                     
    console.log(`Starting deleteOneSeat with seatId: ${seatId}`);
    console.log(`Seat ID to delete: ${seatId}`);

    try {
        // find seat
        const seat = await Seat.findOne({ seatId: seatId });
        console.log(`Seat ID to delete2: ${seatId}`);
        console.log(`Seat queried: ${seat}`);

        // if no seat was found
        if (!seat) {
            console.log(`No seat found with ID: ${seatId}`);
            return { deletedCount: 0 };
        } else {
            console.log(`Found seat: ${seat}`);
        }
        console.log(`Seat ID to delete3: ${seatId}`);
        console.log(`Seat found: ${JSON.stringify(seat)}`);
    
        
        await bookings.deleteMany({ seatId: seat.seatId });
        console.log(`Seat ID to delete4: ${seatId}`);
        console.log(`Deleted bookings for seatId: ${seat.seatId}`);
    
        
        const result = await seat.deleteOne({ seatId: seat.seatId });
        console.log(`Seat ID to delete5: ${seatId}`);
        console.log(`Deleted seat result: ${JSON.stringify(result)}`);
    
        return result;
    } catch (error) {
        console.error('Error in deleteOneSeat:', error);
        throw error; 
    }
}

/**
 * Finds a seat by its ID.
 * @async
 * @function findSeat
 * @param {string} seatId - The ID of the seat to find.
 * @returns {Promise<Object|null>} - The seat object if found, or null if not.
 */
async function findSeat(seatId) {
    return Seat.findOne({ seatId: seatId }); 
}

module.exports = { deleteOneSeat, findSeat };
