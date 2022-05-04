import { HttpException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Address } from '../../../src/lib/typeorm/entities/addresses';
import { Company } from '../../../src/lib/typeorm/entities/companies';
import { Event } from '../../../src/lib/typeorm/entities/events';
import { EventRepository } from '../../../src/lib/typeorm/repositories/events.repository';
import { MissionsRepository } from '../../../src/lib/typeorm/repositories/missions.repository';
import { PlayerRepository } from '../../../src/lib/typeorm/repositories/player.repository';
import { RankingRepository } from '../../../src/lib/typeorm/repositories/ranking.repository';
import { UserRepository } from '../../../src/lib/typeorm/repositories/users.repository';
import UsersFunctions from '../../../src/lib/utils/users-functions';
import { EventService } from '../../../src/modules/events/events.service';

describe('Events Service', () => {
    let service: EventService;
    const result = [];

    const mockRepository = {
        find: jest.fn(),
        eventRanking: jest.fn(),
    };

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                EventService,
                UsersFunctions,
                { provide: getRepositoryToken(EventRepository), useValue: mockRepository },
                { provide: getRepositoryToken(Event), useValue: mockRepository },
                { provide: getRepositoryToken(Company), useValue: mockRepository },
                { provide: getRepositoryToken(Address), useValue: mockRepository },
                { provide: getRepositoryToken(MissionsRepository), useValue: mockRepository },
                { provide: getRepositoryToken(PlayerRepository), useValue: mockRepository },
                { provide: getRepositoryToken(RankingRepository), useValue: mockRepository },
                { provide: getRepositoryToken(UserRepository), useValue: mockRepository },
            ],
        }).compile();
        service = moduleRef.get<EventService>(EventService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return a events list', async () => {
        mockRepository.find.mockResolvedValueOnce(result);
        expect(await service.getEvents()).toStrictEqual(result);
    });

    it('should return a events list by query', async () => {
        mockRepository.find.mockResolvedValueOnce(result);
        expect(await service.getEventByQuery({})).toStrictEqual(result);
    });

    it('should return a events list by query with name', async () => {
        mockRepository.find.mockResolvedValueOnce(result);
        expect(await service.getEventByQuery({ name: 'test' })).toStrictEqual(result);
    });

    it('should return the error in events search', async () => {
        mockRepository.find.mockRejectedValue(new Error('TestError'));
        try {
            await service.getEvents();
        } catch (error) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error).toHaveProperty('message', 'TestError');
        }
    });

    it('should return the error in events search by query', async () => {
        mockRepository.find.mockRejectedValue(new Error('TestErrorByQuery'));
        try {
            await service.getEventByQuery({});
        } catch (error) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error).toHaveProperty('message', 'TestErrorByQuery');
        }
    });
});
