const Seat = require('../models/seat');
const { findSeat } = require('../services/seatService');

jest.mock('../models/seat');

describe('Seat Service', () => {
  describe('findSeat', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return the seat when it exists', async () => {
      const seatIdMock = '123';
      const mockSeat = { seatId: seatIdMock, name: 'Premium Seat' };

      Seat.findOne.mockResolvedValue(mockSeat);

      const result = await findSeat(seatIdMock);

      expect(Seat.findOne).toHaveBeenCalledWith({ seatId: seatIdMock });
      expect(result).toEqual(mockSeat);
    });

    it('should return null when the seat does not exist', async () => {
      const seatIdMock = '123';

      Seat.findOne.mockResolvedValue(null);

      const result = await findSeat(seatIdMock);

      expect(Seat.findOne).toHaveBeenCalledWith({ seatId: seatIdMock });
      expect(result).toBeNull();
    });
  });
});
