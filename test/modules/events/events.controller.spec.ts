import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Event } from '../../../src/lib/typeorm/entities/events';
import { EventService } from '../../../src/modules/events/events.service';
import { EventController } from '../../../src/modules/events/events.controller';
import { EventRepository } from '../../../src/lib/typeorm/repositories/events.repository';
import { Address } from '../../../src/lib/typeorm/entities/addresses';
import { MissionsRepository } from '../../../src/lib/typeorm/repositories/missions.repository';
import { RankingRepository } from '../../../src/lib/typeorm/repositories/ranking.repository';
import { PlayerRepository } from '../../../src/lib/typeorm/repositories/player.repository';
import UsersFunctions from '../../../src/lib/utils/users-functions';
import { UserRepository } from '../../../src/lib/typeorm/repositories/users.repository';
import { Company } from '../../../src/lib/typeorm/entities/companies';

describe('Event Controller', () => {
    let service: EventService;
    let controller: EventController;
    const result: Event[] = [new Event()];
    const mockRepository = {
        find: jest.fn().mockResolvedValueOnce(result),
    };

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [EventController],
            providers: [
                EventRepository,
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
        controller = moduleRef.get<EventController>(EventController);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return an array of events', async () => {
        jest.spyOn(service, 'getEvents').mockResolvedValueOnce(result);
        const query = {};
        expect(await controller.find(query)).toBe(result);
    });

    it('should return an array of events by query', async () => {
        jest.spyOn(service, 'getEventByQuery').mockResolvedValueOnce(result);
        const query = {};
        expect(await controller.find(query)).toBe(result);
    });
});
