import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { setNestGlobalConfig } from '../../../../../src/lib/server/nest-server-config';
import { IntegrationsModule } from '../../../../../src/modules/integrations/integrations.module';
import { User } from '../../../../../src/lib/typeorm/entities/users';
import { Company } from '../../../../../src/lib/typeorm/entities/companies';
import { UserStatus } from '../../../../../src/lib/enum/status.enum';
import { UserRepository } from '../../../../../src/lib/typeorm/repositories/users.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PlayerRepository } from '../../../../../src/lib/typeorm/repositories/player.repository';
import { Group } from '../../../../../src/lib/typeorm/entities/groups';
import { Address } from '../../../../../src/lib/typeorm/entities/addresses';
import { EventRepository } from '../../../../../src/lib/typeorm/repositories/events.repository';
import { BrandRepository } from '../../../../../src/lib/typeorm/repositories/brand.repository';
import { MissionsRepository } from '../../../../../src/lib/typeorm/repositories/missions.repository';
import CompanyFunctions from '../../../../../src/lib/utils/company-functions';

describe('Integrations Module test', () => {
    let nestApp: INestApplication;
    const mockUsersRepository = {
        save: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
    };

    const mockRepository = {};

    const mockCompanyRepository = {
        findOne: jest.fn(),
    };

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [IntegrationsModule],
        })
            .overrideProvider(getRepositoryToken(UserRepository))
            .useValue(mockUsersRepository)
            .overrideProvider(getRepositoryToken(CompanyFunctions))
            .useValue(mockRepository)
            .overrideProvider(getRepositoryToken(Group))
            .useValue(mockRepository)
            .overrideProvider(getRepositoryToken(Address))
            .useValue(mockRepository)
            .overrideProvider(getRepositoryToken(PlayerRepository))
            .useValue(mockRepository)
            .overrideProvider(getRepositoryToken(EventRepository))
            .useValue(mockRepository)
            .overrideProvider(getRepositoryToken(Company))
            .useValue(mockCompanyRepository)
            .overrideProvider(getRepositoryToken(BrandRepository))
            .useValue(mockRepository)
            .overrideProvider(getRepositoryToken(MissionsRepository))
            .useValue(mockRepository)
            .compile();
        nestApp = moduleRef.createNestApplication();
        setNestGlobalConfig(nestApp);
        await nestApp.init();
    });

    const mockUser: User = {
        id: 1,
        email: 'test@test.com',
        company: {
            id: 1,
            name: 'Gympass',
        } as Company,
        name: 'Testador dos testes',
        status: UserStatus.Inactive,
    } as User;

    it(`should receive request and add new user to Gympass`, () => {
        jest.spyOn(CompanyFunctions.prototype, 'hasFreeSeats').mockResolvedValueOnce(true);
        mockUsersRepository.save.mockResolvedValue(mockUser);
        mockUsersRepository.create.mockResolvedValue(mockUser);
        mockCompanyRepository.findOne.mockResolvedValue({
            id: 1,
            name: 'Gympass',
        } as Company);
        return request(nestApp.getHttpServer())
            .post('/v2/integrations/gympass/add')
            .send({
                email: 'test@test.com',
                name: 'Testador dos testes',
                gpw_id: 'gpw-5vs3bf0a-3add-468d-85ff-a358a1befe9a',
            })
            .set('x-api-key', 'g028MhzzLOaSXXtkMBZJS6cp1wuvhRD29iZ8FYhr')
            .expect(200)
            .expect({
                statusCode: 200,
                data: mockUser,
            });
    });

    it(`should return error: invalid api key`, () => {
        mockUsersRepository.save.mockResolvedValue(mockUser);
        mockUsersRepository.create.mockResolvedValue(mockUser);
        mockCompanyRepository.findOne.mockResolvedValue({
            id: 1,
            name: 'Gympass',
        } as Company);
        return request(nestApp.getHttpServer())
            .post('/v2/integrations/gympass/add')
            .send({
                email: 'test@test.com',
                name: 'Testador dos testes',
                gpw_id: 'gpw-5vs3bf0a-3add-468d-85ff-a358a1befe9a',
            })
            .set('x-api-key', 'fakeAPIKey')
            .expect(403)
            .expect({
                statusCode: 403,
                message: 'Forbidden resource',
                error: 'Forbidden',
            });
    });

    it('should move user to b2c', () => {
        mockUsersRepository.save.mockResolvedValue(mockUser);
        mockUsersRepository.findOne.mockResolvedValue(mockUser);
        const body = {
            user_id: 'gpw-5vs3bf0a-3add-468d-85ff-a358a1befe9a',
            plan_id: '0',
            event_time: 1560983373378,
            event_id: '7e8cbb0f-9681-4d3e-8c36-2b3dd6ecbadb',
            event_type: 'wellness-user-plan-canceled',
        };

        return request(nestApp.getHttpServer())
            .post('/v2/integrations/gympass/cancel')
            .send(body)
            .set('X-Gympass-Signature', 'BE71011B8A9F1ABE344E1BBE7919362D703A4BEC')
            .expect(200)
            .expect({
                statusCode: 200,
                data: mockUser,
            });
    });

    it('should return error: invalid signature', () => {
        mockUsersRepository.save.mockResolvedValue(mockUser);
        mockUsersRepository.findOne.mockResolvedValue(mockUser);
        const body = {
            user_id: 'gpw-5vs3bf0a-3add-468d-85ff-a358a1befe9a',
            plan_id: '0',
            event_time: 1560983373378,
            event_id: '7e8cbb0f-9681-4d3e-8c36-2b3dd6ecbadb',
            event_type: 'wellness-user-plan-canceled',
        };

        return request(nestApp.getHttpServer())
            .post('/v2/integrations/gympass/cancel')
            .send(body)
            .set('X-Gympass-Signature', 'fakeSignature')
            .expect(403)
            .expect({
                statusCode: 403,
                message: 'Forbidden resource',
                error: 'Forbidden',
            });
    });

    afterAll(async () => {
        await nestApp.close();
    });
});
