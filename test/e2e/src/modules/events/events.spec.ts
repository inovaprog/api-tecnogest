import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { CanActivate, HttpException, HttpStatus, INestApplication } from '@nestjs/common';
import { setNestGlobalConfig } from '../../../../../src/lib/server/nest-server-config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventModule } from '../../../../../src/modules/events/events.module';
import { Address } from '../../../../../src/lib/typeorm/entities/addresses';
import { EventRepository } from '../../../../../src/lib/typeorm/repositories/events.repository';
import { MissionsRepository } from '../../../../../src/lib/typeorm/repositories/missions.repository';
import { RankingRepository } from '../../../../../src/lib/typeorm/repositories/ranking.repository';
import { PlayerRepository } from '../../../../../src/lib/typeorm/repositories/player.repository';
import { UserRepository } from '../../../../../src/lib/typeorm/repositories/users.repository';
import { JwtAuthGuard } from '../../../../../src/modules/auth/guards/jwt-auth.guard';
import { Company } from '../../../../../src/lib/typeorm/entities/companies';

describe('Events', () => {
    let nestApp: INestApplication;

    const mockToken =
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb2duaXRvOmdyb3VwcyI6WyJzeXNhZG1pbiJdfQ.zT-yOZj395j9kGNeukHbBORwR5J0IFfpLeUaE3R3DGs';

    const mockedEventsList = [
        {
            id: 1,
            name: 'Evento Teste1',
            vacancies: 100,
            fee: 20,
            startRegistration: '2021-09-26 03:00:00',
            startEvent: '2021-10-20 03:00:00',
            endEvent: '2021-11-03 23:59:59',
            startResult: '2021-11-04 00:00:00',
            endResult: '2021-12-10 03:00:00',
            rewards: { reward: 'reward 1' },
            subscriptionRequired: true,
            acceptedCountries: ['Brasil'],
            company: 19,
        },
        {
            id: 2,
            name: 'Evento Teste2',
            vacancies: 50,
            fee: 30,
            startRegistration: '2021-09-26 03:00:00',
            startEvent: '2021-10-20 03:00:00',
            endEvent: '2021-11-03 23:59:59',
            startResult: '2021-11-04 00:00:00',
            endResult: '2021-12-10 03:00:00',
            rewards: { reward: 'reward 2' },
            subscriptionRequired: true,
            acceptedCountries: ['Brasil', 'Espanha'],
            company: 8,
        },
        {
            id: 3,
            name: 'Evento Teste3',
            vacancies: 70,
            fee: 25,
            startRegistration: '2021-09-26 03:00:00',
            startEvent: '2021-10-20 03:00:00',
            endEvent: '2021-11-03 23:59:59',
            startResult: '2021-11-04 00:00:00',
            endResult: '2021-12-10 03:00:00',
            rewards: { reward: 'reward 3' },
            subscriptionRequired: true,
            acceptedCountries: ['Brasil', 'Espanha'],
            company: 19,
        },
    ];

    const mockCompanyRepository = {
        findOne: jest.fn(),
    };

    const mockAddressRepository = {
        findOne: jest.fn(),
    };

    const mockEventRepository = {
        find: jest.fn(),
        findOne: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        softDelete: jest.fn(),
        getAllowedEvents: jest.fn(),
    };

    const mockGuard: CanActivate = { canActivate: jest.fn(() => true) };

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [EventModule],
        })
            .overrideProvider(getRepositoryToken(Address))
            .useValue(mockAddressRepository)
            .overrideProvider(getRepositoryToken(Company))
            .useValue(mockCompanyRepository)
            .overrideProvider(getRepositoryToken(RankingRepository))
            .useValue(mockEventRepository)
            .overrideProvider(getRepositoryToken(EventRepository))
            .useValue(mockEventRepository)
            .overrideProvider(getRepositoryToken(PlayerRepository))
            .useValue(mockEventRepository)
            .overrideProvider(getRepositoryToken(MissionsRepository))
            .useValue(mockEventRepository)
            .overrideProvider(getRepositoryToken(UserRepository))
            .useValue(mockEventRepository)
            .overrideGuard(JwtAuthGuard)
            .useValue(mockGuard)
            .compile();
        nestApp = moduleRef.createNestApplication();
        setNestGlobalConfig(nestApp);
        await nestApp.init();
    });

    it(`/postEvent`, async () => {
        const newEvent = {
            name: 'Evento Teste1',
            fee: 20,
            vacancies: 100,
            startRegistration: '2021-09-26 03:00:00',
            startEvent: '2021-10-20 03:00:00',
            endEvent: '2021-11-03 23:59:59',
            startResult: '2021-11-04 00:00:00',
            endResult: '2021-12-10 03:00:00',
            rewards: { reward: 'reward 1' },
            subscriptionRequired: true,
            acceptedCountries: ['Brasil'],
            company: 19,
        };
        mockEventRepository.findOne.mockResolvedValueOnce(null);
        mockEventRepository.save.mockResolvedValueOnce(mockedEventsList[0]);
        const createEvent = await request(nestApp.getHttpServer())
            .post('/v2/events')
            .send(newEvent)
            .set('Authorization', mockToken)
            .expect(201);
        expect(createEvent.body.data).toEqual(mockedEventsList[0]);
    });

    it(`/getEventByQuery`, async () => {
        mockEventRepository.find.mockResolvedValueOnce(mockedEventsList[0]);
        const getEventByQuery = await request(nestApp.getHttpServer())
            .get(`/v2/events/?${mockedEventsList[0]}`)
            .expect(200);
        expect(getEventByQuery.body.data).toEqual(mockedEventsList[0]);
    });

    it(`/getEventById`, async () => {
        const id = mockedEventsList[0].id;
        mockEventRepository.findOne.mockResolvedValueOnce(mockedEventsList[0]);
        const getEventById = await request(nestApp.getHttpServer())
            .get(`/v2/events/${id}`)
            .set('Authorization', mockToken)
            .expect(200);
        expect(getEventById.body.data).toEqual(mockedEventsList[0]);
    });

    it(`/getEventById`, async () => {
        try {
            const eventById = mockEventRepository.findOne.mockResolvedValueOnce(null);
            if (!eventById) throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
            await request(nestApp.getHttpServer()).get(`/v2/events/id`).set('Authorization', mockToken).expect(404);
        } catch (error) {
            expect(error.message).toEqual('errorTest');
        }
    });

    it(`/getEvent`, async () => {
        mockEventRepository.find.mockResolvedValueOnce(mockedEventsList);
        const getEvent = await request(nestApp.getHttpServer())
            .get(`/v2/events`)
            .set('Authorization', mockToken)
            .expect(200);
        expect(getEvent.body.data).toEqual(mockedEventsList);
    });

    it(`/updateEvent`, async () => {
        const query: any = {
            id: 1,
            name: 'Evento Teste1',
            vacancies: 100,
            fee: 20,
            startRegistration: '2021-09-26 03:00:00',
            startEvent: '2021-10-20 03:00:00',
            endEvent: '2021-11-03 23:59:59',
            startResult: '2021-11-04 00:00:00',
            endResult: '2021-12-10 03:00:00',
            rewards: { reward: 'reward 1' },
            acceptedCountries: ['Brasil'],
        };
        const companyData = {
            id: 19,
            status: 'A',
            name: 'RadarFit',
            createdAt: '2021-11-16T18:17:27.430Z',
            updatedAt: '2021-11-16T18:17:27.430Z',
        };
        mockCompanyRepository.findOne.mockResolvedValueOnce(companyData);
        query.company = companyData;
        mockEventRepository.update.mockResolvedValueOnce({});
        mockEventRepository.findOne.mockResolvedValueOnce(query);
        const updateEvent = await request(nestApp.getHttpServer()).put(`/v2/events/1`).set('Authorization', mockToken);
        expect(updateEvent.body.data).toEqual(query);
        expect(query.id).toEqual(mockedEventsList[0].id);
    });

    it(`/findMe`, async () => {
        const country = 'Brasil';
        const eventList = [
            {
                id: 18,
                name: 'Evento Teste7',
                vacancies: 100,
                fee: 20,
                startRegistration: '2021-09-26T06:00:00.000Z',
                startEvent: '2021-10-20T06:00:00.000Z',
                endEvent: '2021-11-04T02:59:59.000Z',
                startResult: '2021-11-04T03:00:00.000Z',
                endResult: '2021-12-10T06:00:00.000Z',
                rewards: {
                    reward: 'reward 1',
                },
                subscriptionRequired: false,
                acceptedCountries: ['Brasil'],
                createdAt: '2021-12-15T18:22:58.709Z',
                updatedAt: '2021-12-16T16:14:17.885Z',
                company: {
                    id: 8,
                    status: 'A',
                    name: 'AngloGold',
                    createdAt: '2021-11-16T18:17:27.430Z',
                    updatedAt: '2021-11-16T18:17:27.430Z',
                },
            },
        ];
        mockAddressRepository.findOne.mockResolvedValueOnce(country);
        mockEventRepository.getAllowedEvents.mockResolvedValueOnce(eventList);
        const findMe = await request(nestApp.getHttpServer())
            .get(`/v2/events/me`)
            .set('Authorization', mockToken)
            .expect(200);
        expect(findMe.body.data).toEqual([]);
    });

    it(`/deleteEvent`, async () => {
        const newMockedEventList = [
            {
                id: 2,
                name: 'Evento Teste2',
                vacancies: 50,
                fee: 30,
                startRegistration: '2021-09-26 03:00:00',
                startEvent: '2021-10-20 03:00:00',
                endEvent: '2021-11-03 23:59:59',
                startResult: '2021-11-04 00:00:00',
                endResult: '2021-12-10 03:00:00',
                rewards: { reward: 'reward 2' },
                acceptedCountries: ['Brasil', 'Espanha'],
                company: 8,
            },
        ];
        mockEventRepository.softDelete.mockResolvedValueOnce(newMockedEventList);
        await request(nestApp.getHttpServer())
            .delete(`/v2/events/${mockedEventsList[0].id}`)
            .set('Authorization', mockToken)
            .expect(200);
        expect(newMockedEventList).not.toContain(mockedEventsList[0]);
    });

    it(`get Event error`, async () => {
        mockEventRepository.find.mockRejectedValueOnce(
            new HttpException('errorTest', HttpStatus.INTERNAL_SERVER_ERROR),
        );
        try {
            await request(nestApp.getHttpServer()).get(`/v2/events`).set('Authorization', mockToken);
        } catch (error) {
            expect(error.message).toEqual('errorTest');
        }
    });

    it(`update Event error`, async () => {
        mockEventRepository.update.mockRejectedValueOnce(
            new HttpException('errorTest', HttpStatus.INTERNAL_SERVER_ERROR),
        );
        try {
            await request(nestApp.getHttpServer())
                .put(`/v2/events/${mockedEventsList[0].id}`)
                .set('Authorization', mockToken);
        } catch (error) {
            expect(error.message).toEqual('errorTest');
        }
    });

    it(`delete Event error`, async () => {
        mockEventRepository.softDelete.mockRejectedValueOnce(
            new HttpException('errorTest', HttpStatus.INTERNAL_SERVER_ERROR),
        );
        try {
            await request(nestApp.getHttpServer())
                .delete(`/v2/events/${mockedEventsList[0].id}`)
                .set('Authorization', mockToken);
        } catch (error) {
            expect(error.message).toEqual('errorTest');
        }
    });

    it(`/postEvent`, async () => {
        const companyData = {
            id: 19,
            status: 'A',
            name: 'RadarFit',
            createdAt: '2021-11-16T18:17:27.430Z',
            updatedAt: '2021-11-16T18:17:27.430Z',
        };
        try {
            mockCompanyRepository.findOne.mockResolvedValueOnce(companyData);
            const isEventAlreadyRegistered = mockEventRepository.findOne.mockResolvedValueOnce({});
            if (isEventAlreadyRegistered) throw new HttpException('Event already registered', HttpStatus.BAD_REQUEST);
            await request(nestApp.getHttpServer())
                .post('/v2/events')
                .send(mockedEventsList[0])
                .set('Authorization', mockToken)
                .expect(400);
        } catch (error) {
            expect(error.message).toEqual('Event already registered');
        }
    });

    afterAll(async () => {
        await nestApp.close();
    });
});
