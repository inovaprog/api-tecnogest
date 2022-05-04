import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { CanActivate, HttpException, HttpStatus, INestApplication } from '@nestjs/common';
import { CompanyModule } from '../../../../../src/modules/companies/company.module';
import { setNestGlobalConfig } from '../../../../../src/lib/server/nest-server-config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MissionsRepository } from '../../../../../src/lib/typeorm/repositories/missions.repository';
import { CompanyStatus } from '../../../../../src/lib/enum/status.enum';
import { UserRepository } from '../../../../../src/lib/typeorm/repositories/users.repository';
import { BrandRepository } from '../../../../../src/lib/typeorm/repositories/brand.repository';
import { Group } from '../../../../../src/lib/typeorm/entities/groups';
import { Address } from '../../../../../src/lib/typeorm/entities/addresses';
import { PlayerRepository } from '../../../../../src/lib/typeorm/repositories/player.repository';
import { EventRepository } from '../../../../../src/lib/typeorm/repositories/events.repository';
import { JwtAuthGuard } from '../../../../../src/modules/auth/guards/jwt-auth.guard';
import { Company } from '../../../../../src/lib/typeorm/entities/companies';

describe('Companies', () => {
    let nestApp: INestApplication;

    const mockToken =
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb2duaXRvOmdyb3VwcyI6WyJzeXNhZG1pbiJdfQ.zT-yOZj395j9kGNeukHbBORwR5J0IFfpLeUaE3R3DGs';

    const mockedCompaniesList = [
        {
            id: 1,
            name: 'Company 1',
            status: CompanyStatus.Active,
        },
        {
            id: 2,
            name: 'Company 2',
            status: CompanyStatus.Active,
        },
    ];

    const mockCompanyRepository = {
        find: jest.fn(),
        findOne: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        softDelete: jest.fn(),
    };
    const userService = { find: () => ['user'] };
    const brandService = { find: () => ['band'] };
    const mockCustomMissionsRepository = {};
    const mockCustomRepository = {};
    const mockGuard: CanActivate = { canActivate: jest.fn(() => true) };
    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [CompanyModule],
        })
            .overrideProvider(getRepositoryToken(Company))
            .useValue(mockCompanyRepository)
            .overrideProvider(getRepositoryToken(UserRepository))
            .useValue(userService)
            .overrideProvider(getRepositoryToken(BrandRepository))
            .useValue(brandService)
            .overrideProvider(getRepositoryToken(MissionsRepository))
            .useValue(mockCustomMissionsRepository)
            .overrideProvider(getRepositoryToken(Group))
            .useValue(mockCustomRepository)
            .overrideProvider(getRepositoryToken(Address))
            .useValue(mockCustomRepository)
            .overrideProvider(getRepositoryToken(PlayerRepository))
            .useValue(mockCustomRepository)
            .overrideProvider(getRepositoryToken(EventRepository))
            .useValue(mockCustomRepository)
            .overrideGuard(JwtAuthGuard)
            .useValue(mockGuard)
            .compile();
        nestApp = moduleRef.createNestApplication();
        setNestGlobalConfig(nestApp);
        await nestApp.init();
    });

    it(`/postCompanies`, async () => {
        const newCompany = { name: 'Company 13' };
        mockCompanyRepository.findOne.mockResolvedValueOnce(null);
        mockCompanyRepository.save.mockResolvedValueOnce(mockedCompaniesList[0]);
        const createCompany = await request(nestApp.getHttpServer())
            .post('/v2/companies')
            .send(newCompany)
            .set({ authorization: mockToken })
            .expect(201);
        expect(createCompany.body.data).toEqual(mockedCompaniesList[0]);
    });

    it(`/getCompanyByQuery`, async () => {
        mockCompanyRepository.find.mockResolvedValueOnce(mockedCompaniesList[0]);
        const getCompanyByQuery = await request(nestApp.getHttpServer())
            .get(`/v2/companies/?id=1`)
            .set({ authorization: mockToken })
            .expect(200);
        expect(getCompanyByQuery.body.data).toEqual(mockedCompaniesList[0]);
    });

    it(`/getCompany`, async () => {
        mockCompanyRepository.find.mockResolvedValueOnce(mockedCompaniesList);
        const getCompany = await request(nestApp.getHttpServer())
            .get(`/v2/companies`)
            .set({ authorization: mockToken })
            .expect(200);
        expect(getCompany.body.data).toEqual(mockedCompaniesList);
    });

    it(`/updateCompany`, async () => {
        const newCompany = {
            id: 1,
            name: 'Company 1',
            status: 'I',
        };
        mockCompanyRepository.update.mockResolvedValueOnce(newCompany);
        mockCompanyRepository.findOne.mockResolvedValueOnce(newCompany);
        const updateCompany = await request(nestApp.getHttpServer())
            .put(`/v2/companies/${mockedCompaniesList[0].id}`)
            .set({ authorization: mockToken })
            .expect(200);
        expect(updateCompany.body.data).toEqual(newCompany);
        expect(newCompany.id).toEqual(mockedCompaniesList[0].id);
    });

    it(`/deleteCompany`, async () => {
        const newMockedCompanyList = [
            {
                id: 2,
                name: 'Company 2',
                status: 'A',
            },
        ];
        mockCompanyRepository.softDelete.mockResolvedValueOnce(newMockedCompanyList);
        await request(nestApp.getHttpServer())
            .delete(`/v2/companies/${mockedCompaniesList[0].id}`)
            .set({ authorization: mockToken })
            .expect(200);
        expect(newMockedCompanyList).not.toContain(mockedCompaniesList[0]);
    });

    it(`post company registered error`, async () => {
        mockCompanyRepository.findOne.mockResolvedValueOnce(mockedCompaniesList[0]);
        try {
            await request(nestApp.getHttpServer()).post(`/v2/companies`).set({ authorization: mockToken });
            throw new HttpException('Request error. Company already registered', HttpStatus.BAD_REQUEST);
        } catch (error) {
            expect(error.message).toEqual('Request error. Company already registered');
        }
    });

    it(`post company error`, async () => {
        mockCompanyRepository.findOne.mockRejectedValueOnce(
            new HttpException('errorTest', HttpStatus.INTERNAL_SERVER_ERROR),
        );
        try {
            await request(nestApp.getHttpServer()).post(`/v2/companies`).set({ authorization: mockToken });
        } catch (error) {
            expect(error.message).toEqual('errorTest');
        }
    });

    it(`get company error`, async () => {
        mockCompanyRepository.find.mockRejectedValueOnce(
            new HttpException('errorTest', HttpStatus.INTERNAL_SERVER_ERROR),
        );
        try {
            await request(nestApp.getHttpServer()).get(`/v2/companies`).set({ authorization: mockToken });
        } catch (error) {
            expect(error.message).toEqual('errorTest');
        }
    });

    it(`update company error`, async () => {
        mockCompanyRepository.update.mockRejectedValueOnce(
            new HttpException('errorTest', HttpStatus.INTERNAL_SERVER_ERROR),
        );
        try {
            await request(nestApp.getHttpServer())
                .put(`/v2/companies/${mockedCompaniesList[0].id}`)
                .set({ authorization: mockToken });
        } catch (error) {
            expect(error.message).toEqual('errorTest');
        }
    });

    it(`delete company error`, async () => {
        mockCompanyRepository.softDelete.mockRejectedValueOnce(
            new HttpException('errorTest', HttpStatus.INTERNAL_SERVER_ERROR),
        );
        try {
            await request(nestApp.getHttpServer())
                .delete(`/v2/companies/${mockedCompaniesList[0].id}`)
                .set({ authorization: mockToken });
        } catch (error) {
            expect(error.message).toEqual('errorTest');
        }
    });

    afterAll(async () => {
        await nestApp.close();
    });
});
