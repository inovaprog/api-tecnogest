import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { CanActivate, HttpException, HttpStatus, INestApplication } from '@nestjs/common';
import { setNestGlobalConfig } from '../../../../../src/lib/server/nest-server-config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserModule } from '../../../../../src/modules/users/users.module';
import { UserRepository } from '../../../../../src/lib/typeorm/repositories/users.repository';
import { Group } from '../../../../../src/lib/typeorm/entities/groups';
import { Address } from '../../../../../src/lib/typeorm/entities/addresses';
import { PlayerRepository } from '../../../../../src/lib/typeorm/repositories/player.repository';
import { EventRepository } from '../../../../../src/lib/typeorm/repositories/events.repository';
import { JwtAuthGuard } from '../../../../../src/modules/auth/guards/jwt-auth.guard';
import { Company } from '../../../../../src/lib/typeorm/entities/companies';

describe('Users', () => {
    let nestApp: INestApplication;

    const mockToken =
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb2duaXRvOmdyb3VwcyI6WyJzeXNhZG1pbiJdfQ.zT-yOZj395j9kGNeukHbBORwR5J0IFfpLeUaE3R3DGs';

    const mockedUsersList = [
        {
            id: 1,
            status: 'A',
            name: 'User 1',
            email: 'user1@user.com',
            dateOfBirth: '01/01/2000',
            documentType: 'cpf',
            documentValue: '111111111111',
            gender: 'M',
            plan: 'free',
            phone: '99999999999',
            referenceId: '1',
        },
        {
            id: 2,
            status: 'A',
            name: 'User 2',
            email: 'user2@user.com',
            dateOfBirth: '02/02/2000',
            documentType: 'cpf',
            documentValue: '222222222222',
            gender: 'M',
            plan: 'free',
            phone: '99999999999',
            referenceId: '2',
        },
    ];

    const mockUsersRepository = {
        find: jest.fn(),
        findOne: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        softDelete: jest.fn(),
    };
    const mockCustomRepository = {};
    const mockGuard: CanActivate = { canActivate: jest.fn(() => true) };
    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [UserModule],
        })
            .overrideProvider(getRepositoryToken(Group))
            .useValue(mockUsersRepository)
            .overrideProvider(getRepositoryToken(UserRepository))
            .useValue(mockUsersRepository)
            .overrideProvider(getRepositoryToken(Company))
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

    it(`/updateUser`, async () => {
        const newUser = {
            id: 1,
            status: 'I',
            name: 'User 1',
            email: 'user1@user.com',
            dateOfBirth: '01/01/2000',
            documentType: 'cpf',
            documentValue: '111111111111',
            gender: 'M',
            plan: 'free',
            phone: '99999999999',
            referenceId: '1',
        };
        mockUsersRepository.update.mockResolvedValueOnce(newUser);
        mockUsersRepository.findOne.mockResolvedValueOnce(newUser);
        const updateUser = await request(nestApp.getHttpServer())
            .put(`/v2/users/${mockedUsersList[0].id}`)
            .set('Authorization', mockToken)
            .expect(200);
        expect(updateUser.body.data).toEqual(newUser);
        expect(newUser.id).toEqual(mockedUsersList[0].id);
    });

    it(`get User error`, async () => {
        mockUsersRepository.find.mockRejectedValueOnce(
            new HttpException('errorTest', HttpStatus.INTERNAL_SERVER_ERROR),
        );
        try {
            await request(nestApp.getHttpServer()).get(`/v2/users`).set('Authorization', mockToken);
        } catch (error) {
            expect(error.message).toEqual('errorTest');
        }
    });

    it(`update User error`, async () => {
        mockUsersRepository.update.mockRejectedValueOnce(
            new HttpException('errorTest', HttpStatus.INTERNAL_SERVER_ERROR),
        );
        try {
            await request(nestApp.getHttpServer())
                .put(`/v2/users/${mockedUsersList[0].id}`)
                .set('Authorization', mockToken);
        } catch (error) {
            expect(error.message).toEqual('errorTest');
        }
    });

    it(`delete User error`, async () => {
        mockUsersRepository.softDelete.mockRejectedValueOnce(
            new HttpException('errorTest', HttpStatus.INTERNAL_SERVER_ERROR),
        );
        try {
            await request(nestApp.getHttpServer())
                .delete(`/v2/users/${mockedUsersList[0].id}`)
                .set('Authorization', mockToken);
        } catch (error) {
            expect(error.message).toEqual('errorTest');
        }
    });

    afterAll(async () => {
        await nestApp.close();
    });
});
