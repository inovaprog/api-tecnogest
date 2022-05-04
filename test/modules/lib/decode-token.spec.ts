import { HttpException } from '@nestjs/common';
import DecodeToken from '../../../src/lib/decode-token';

describe('Settings Service', () => {
    const input =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb2duaXRvOmdyb3VwcyI6WyJzeXNhZG1pbiJdfQ.zT-yOZj395j9kGNeukHbBORwR5J0IFfpLeUaE3R3DGs';
    const result = { 'cognito:groups': ['sysadmin'] };

    it('should be defined', () => {
        expect(DecodeToken).toBeDefined();
    });

    it('should return the token decoded', async () => {
        expect(DecodeToken.decodeToken(input)).toStrictEqual(result);
    });

    it('should not return the token decoded', async () => {
        try {
            expect(DecodeToken.decodeToken(null)).toStrictEqual(result);
        } catch (error) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error).toHaveProperty('message', 'Token is required');
        }
    });
});
