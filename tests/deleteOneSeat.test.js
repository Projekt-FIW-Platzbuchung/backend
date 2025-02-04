const mongoose = require('mongoose');
const Seat = require('../models/seat');
const Bookings = require('../models/bookings');
const { deleteOneSeat } = require('../services/seatService');

jest.mock('../models/seat');
jest.mock('../models/bookings');

describe('Seat Service', () => {
  describe('deleteOneSeat', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should delete seat and its bookings when the seat exists', async () => {
      const seatIdMock = '123';
      const mockSeat = { seatId: seatIdMock, deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }) };

      Seat.findOne.mockResolvedValue(mockSeat);
      Bookings.deleteMany.mockResolvedValue({ deletedCount: 1 });

      const result = await deleteOneSeat(seatIdMock);

      expect(Seat.findOne).toHaveBeenCalledWith({ seatId: seatIdMock });
      expect(Bookings.deleteMany).toHaveBeenCalledWith({ seatId: seatIdMock });
      expect(mockSeat.deleteOne).toHaveBeenCalled();
      expect(result).toEqual({ deletedCount: 1 });
    });

    it('should return deletedCount 0 when the seat does not exist', async () => {
      const seatIdMock = '123';

      Seat.findOne.mockResolvedValue(null);

      const result = await deleteOneSeat(seatIdMock);

      expect(Seat.findOne).toHaveBeenCalledWith({ seatId: seatIdMock });
      expect(Bookings.deleteMany).not.toHaveBeenCalled();
      expect(result).toEqual({ deletedCount: 0 });
    });
  });
});
