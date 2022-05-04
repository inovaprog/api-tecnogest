import { HttpException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Company } from '../../../src/lib/typeorm/entities/companies';
import { UserRepository } from '../../../src/lib/typeorm/repositories/users.repository';
import CompanyFunctions from '../../../src/lib/utils/company-functions';

describe('Company Functions', () => {
    let companyFunctions: CompanyFunctions;

    const mockRepository = {
        countUsers: jest.fn(),
    };

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [CompanyFunctions, { provide: UserRepository, useValue: mockRepository }],
        }).compile();
        companyFunctions = moduleRef.get<CompanyFunctions>(CompanyFunctions);
    });

    it('should return true', async () => {
        const company = { id: 1, seats: 11 } as Company;
        mockRepository.countUsers.mockResolvedValueOnce([{ count: 10 }]);
        expect(await companyFunctions.hasFreeSeats(company)).toStrictEqual(true);
    });

    it('should return true', async () => {
        const company = { id: 1, seats: null } as Company;
        mockRepository.countUsers.mockResolvedValueOnce([{ count: 10 }]);
        expect(await companyFunctions.hasFreeSeats(company)).toStrictEqual(true);
    });

    it('should return false', async () => {
        const company = { id: 1, seats: 10 } as Company;
        mockRepository.countUsers.mockResolvedValueOnce([{ count: 10 }]);
        expect(await companyFunctions.hasFreeSeats(company)).toStrictEqual(false);
    });

    it('should return false', async () => {
        const company = { id: 1, seats: 10 } as Company;
        mockRepository.countUsers.mockRejectedValue(new Error('Count error'));
        try {
            expect(await companyFunctions.hasFreeSeats(company)).toStrictEqual(false);
        } catch (error) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error).toHaveProperty('message', 'Count error');
        }
    });
});
