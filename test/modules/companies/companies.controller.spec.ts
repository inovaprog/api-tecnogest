import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Brand } from '../../../src/lib/typeorm/entities/brands';
import { Company } from '../../../src/lib/typeorm/entities/companies';
import { BrandRepository } from '../../../src/lib/typeorm/repositories/brand.repository';
import { CompanyService } from '../../../src/modules/companies/company.service';
import { CompanyController } from '../../../src/modules/companies/company.controller';
import { UserRepository } from '../../../src/lib/typeorm/repositories/users.repository';
import { MissionsRepository } from '../../../src/lib/typeorm/repositories/missions.repository';
import { GetCompanyDto } from '../../../src/modules/companies/dto/getCompany.dto';
import { UserService } from '../../../src/modules/users/users.service';
import { Group } from '../../../src/lib/typeorm/entities/groups';
import { Address } from '../../../src/lib/typeorm/entities/addresses';
import { PlayerRepository } from '../../../src/lib/typeorm/repositories/player.repository';
import UsersFunctions from '../../../src/lib/utils/users-functions';
import { EventRepository } from '../../../src/lib/typeorm/repositories/events.repository';
import CompanyFunctions from '../../../src/lib/utils/company-functions';

describe('Company Controller', () => {
    let service: CompanyService;
    let controller: CompanyController;
    const result: Company[] = [new Company()];
    const mockRepository = {
        find: jest.fn().mockResolvedValueOnce(result),
    };

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [CompanyController],
            providers: [
                BrandRepository,
                CompanyService,
                UserService,
                UsersFunctions,
                CompanyFunctions,
                { provide: getRepositoryToken(Brand), useValue: mockRepository },
                { provide: getRepositoryToken(Company), useValue: mockRepository },
                { provide: getRepositoryToken(Group), useValue: mockRepository },
                { provide: getRepositoryToken(Address), useValue: mockRepository },
                { provide: getRepositoryToken(PlayerRepository), useValue: mockRepository },
                { provide: getRepositoryToken(MissionsRepository), useValue: mockRepository },
                { provide: getRepositoryToken(EventRepository), useValue: mockRepository },
                { provide: UserRepository, useValue: mockRepository },
            ],
        }).compile();
        service = moduleRef.get<CompanyService>(CompanyService);
        controller = moduleRef.get<CompanyController>(CompanyController);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return an brand', async () => {
        const result: Brand = new Brand();
        jest.spyOn(service, 'getBrandByCompanyId').mockResolvedValueOnce(result);

        expect(await controller.getBrand('1')).toBe(result);
    });

    it('should return an array of companies', async () => {
        const query = {} as GetCompanyDto;
        jest.spyOn(service, 'getCompanies').mockResolvedValueOnce(result);

        expect(await controller.find(query)).toBe(result);
    });

    it('should return an array of companies by query', async () => {
        const query = {} as GetCompanyDto;
        jest.spyOn(service, 'getCompanyByQuery').mockResolvedValueOnce(result);

        expect(await controller.find(query)).toBe(result);
    });
});
