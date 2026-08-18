import { describe, it, expect, beforeEach } from 'vitest';
import { normalizeError } from '@/utils/errorNormalizer';
import { ApiError } from '@/api/httpClient';

describe('normalizeError', () => {
  beforeEach(() => {
    // Setup if needed
  });

  it('should return network error message for ApiError status 0', () => {
    const error = new ApiError(0, 'Some connection error');
    const result = normalizeError(error);
    expect(result).toEqual({
      title: 'Ulanish xatosi',
      message: 'Backendga ulanib bo\'lmadi. Tarmoqni tekshiring.',
    });
  });

  it('should return validation error for ApiError status 422', () => {
    // With detail array of messages
    const detailPayload = {
      detail: [
        { msg: 'Field required' },
        { msg: 'Must be an integer' },
      ],
    };
    const errorWithDetail = new ApiError(422, 'Unprocessable Entity', detailPayload);
    const resultWithDetail = normalizeError(errorWithDetail);
    expect(resultWithDetail).toEqual({
      title: 'Ma\'lumot xatosi',
      message: 'Field required, Must be an integer',
    });

    // Without detail array
    const errorNoDetail = new ApiError(422, 'Unprocessable Entity');
    const resultNoDetail = normalizeError(errorNoDetail);
    expect(resultNoDetail).toEqual({
      title: 'Ma\'lumot xatosi',
      message: 'Yuborilgan ma\'lumot noto\'g\'ri formatda.',
    });
  });

  it('should return bad request error message for ApiError status 400', () => {
    // Detail as string
    const errorStr = new ApiError(400, 'API Error: 400 Bad Request', 'Custom 400 error message');
    const resultStr = normalizeError(errorStr);
    expect(resultStr).toEqual({
      title: 'So\'rov xatosi',
      message: 'Custom 400 error message',
    });

    // Detail as object with message
    const errorObj = new ApiError(400, 'API Error: 400 Bad Request', { message: 'Object error message' });
    const resultObj = normalizeError(errorObj);
    expect(resultObj).toEqual({
      title: 'So\'rov xatosi',
      message: 'Object error message',
    });

    // No detail
    const errorNoDetail = new ApiError(400, 'Bad Request');
    const resultNoDetail = normalizeError(errorNoDetail);
    expect(resultNoDetail).toEqual({
      title: 'So\'rov xatosi',
      message: 'Bad Request', // falls back to error.message
    });
  });

  it('should return server error for ApiError status 500', () => {
    const error = new ApiError(500, 'Internal Server Error');
    const result = normalizeError(error);
    expect(result).toEqual({
      title: 'Server xatosi',
      message: 'Backend ichki xatolik yuz berdi. Birozdan keyin urinib ko\'ring.',
    });
  });

  it('should return generic error for Error instance', () => {
    const error = new Error('Database connection failed');
    const result = normalizeError(error);
    expect(result).toEqual({
      title: 'Xato',
      message: 'Database connection failed',
    });
  });

  it('should return unknown error for unknown error types', () => {
    const resultStr = normalizeError('Just a random string error');
    expect(resultStr).toEqual({
      title: 'Noma\'lum xato',
      message: 'Kutilmagan xato yuz berdi.',
    });

    const resultObj = normalizeError({ random: 'object' });
    expect(resultObj).toEqual({
      title: 'Noma\'lum xato',
      message: 'Kutilmagan xato yuz berdi.',
    });

    const resultNull = normalizeError(null);
    expect(resultNull).toEqual({
      title: 'Noma\'lum xato',
      message: 'Kutilmagan xato yuz berdi.',
    });
  });
});
