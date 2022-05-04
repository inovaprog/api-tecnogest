import { HttpException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import DynamoDB from '../../../src/lib/aws/dynamodb';
import { Company } from '../../../src/lib/typeorm/entities/companies';
import { Player } from '../../../src/lib/typeorm/entities/players';
import { BrandRepository } from '../../../src/lib/typeorm/repositories/brand.repository';
import { MissionsRepository } from '../../../src/lib/typeorm/repositories/missions.repository';
import { UserRepository } from '../../../src/lib/typeorm/repositories/users.repository';
import { CompanyService } from '../../../src/modules/companies/company.service';

describe('Companies Service', () => {
    let service: CompanyService;
    const result = [];

    const mockUser = {
        Empresa: {
            S: '',
        },
    };

    const mockRepository = {
        getBrandByEmail: jest.fn(),
        find: jest.fn(),
        getBrandByCompanyName: jest.fn(),
    };

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                CompanyService,
                { provide: getRepositoryToken(BrandRepository), useValue: mockRepository },
                { provide: getRepositoryToken(Company), useValue: mockRepository },
                { provide: getRepositoryToken(Player), useValue: mockRepository },
                { provide: getRepositoryToken(MissionsRepository), useValue: mockRepository },
                { provide: UserRepository, useValue: mockRepository },
            ],
        }).compile();
        service = moduleRef.get<CompanyService>(CompanyService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return the Brand by email', async () => {
        mockRepository.getBrandByCompanyName.mockResolvedValueOnce(result);
        jest.spyOn(DynamoDB, 'getUser').mockResolvedValueOnce(mockUser);
        expect(await service.getBrandByEmail('test@test.com')).toStrictEqual(result);
    });

    it('should return the brands list', async () => {
        mockRepository.find.mockResolvedValueOnce(result);
        expect(await service.getCompanies()).toStrictEqual(result);
    });

    it('should not return the brand list', async () => {
        mockRepository.find.mockRejectedValueOnce(new Error('TestError'));
        try {
            await service.getCompanies();
        } catch (error) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error).toHaveProperty('message', 'TestError');
        }
    });

    it('should return the settings list by query', async () => {
        mockRepository.find.mockResolvedValueOnce(result);
        expect(await service.getCompanyByQuery({})).toStrictEqual(result);
    });

    it('should return the settings list by query with name', async () => {
        mockRepository.find.mockResolvedValueOnce(result);
        expect(await service.getCompanyByQuery({ name: 'test' })).toStrictEqual(result);
    });

    it('should return the error in settings search', async () => {
        mockRepository.find.mockRejectedValue(new Error('TestError'));
        try {
            await service.getCompanies();
        } catch (error) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error).toHaveProperty('message', 'TestError');
        }
    });

    it('should return the error in settings search by query', async () => {
        mockRepository.find.mockRejectedValue(new Error('TestErrorByQuery'));
        try {
            await service.getCompanyByQuery({});
        } catch (error) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error).toHaveProperty('message', 'TestErrorByQuery');
        }
    });
});
