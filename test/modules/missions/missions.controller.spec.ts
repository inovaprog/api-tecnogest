import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MissionsService } from '../../../src/modules/missions/missions.service';
import { MissionsController } from '../../../src/modules/missions/missions.controller';
import { MissionType } from '../../../src/lib/typeorm/entities/mission-type';
import { MissionCatalogRepository } from '../../../src/lib/typeorm/repositories/missions-catalog.repository';
import { MissionsRepository } from '../../../src/lib/typeorm/repositories/missions.repository';
import { MissionCatalog } from '../../../src/lib/typeorm/entities/mission-catalog';
import { MissionSubType } from '../../../src/lib/typeorm/entities/mission-subtype';
import MissionsFunctions from '../../../src/lib/utils/missions-functions';
import { PlayerRepository } from '../../../src/lib/typeorm/repositories/player.repository';
import { Player } from '../../../src/lib/typeorm/entities/players';
import { Mission } from '../../../src/lib/typeorm/entities/missions';
import UsersFunctions from '../../../src/lib/utils/users-functions';
import { EventRepository } from '../../../src/lib/typeorm/repositories/events.repository';
import { UserRepository } from '../../../src/lib/typeorm/repositories/users.repository';
import { Company } from '../../../src/lib/typeorm/entities/companies';

describe('Missions Controller', () => {
    let service: MissionsService;
    let controller: MissionsController;

    const mockRepository = {
        getMissionsbySubType: jest.fn(),
    };

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [MissionsController],
            providers: [
                MissionsService,
                MissionsFunctions,
                UsersFunctions,
                { provide: getRepositoryToken(Mission), useValue: mockRepository },
                { provide: getRepositoryToken(Player), useValue: mockRepository },
                { provide: getRepositoryToken(MissionSubType), useValue: mockRepository },
                { provide: getRepositoryToken(MissionCatalogRepository), useValue: mockRepository },
                { provide: getRepositoryToken(MissionsRepository), useValue: mockRepository },
                { provide: getRepositoryToken(PlayerRepository), useValue: mockRepository },
                { provide: getRepositoryToken(MissionType), useValue: mockRepository },
                { provide: getRepositoryToken(EventRepository), useValue: mockRepository },
                { provide: getRepositoryToken(UserRepository), useValue: mockRepository },
                { provide: getRepositoryToken(Company), useValue: mockRepository },
            ],
        }).compile();
        service = moduleRef.get<MissionsService>(MissionsService);
        controller = moduleRef.get<MissionsController>(MissionsController);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return the mission types list', async () => {
        const result = [new MissionType()] as MissionType[];
        jest.spyOn(service, 'getMissionType').mockResolvedValueOnce(result);
        expect(await controller.getMissionsType()).toBe(result);
    });

    it('should return the mission subtype list', async () => {
        const result = new MissionType() as MissionType;
        jest.spyOn(service, 'getMissionSubType').mockResolvedValueOnce(result);
        expect(await controller.getMissionsSubType('test')).toBe(result);
    });

    it('should not return the mission type', async () => {
        jest.spyOn(service, 'getMissionType').mockRejectedValueOnce(new Error('Test Error'));
        try {
            await controller.getMissionsType();
        } catch (e) {
            expect(e.message).toBe('Test Error');
        }
    });

    it('should not return the mission sub type', async () => {
        jest.spyOn(service, 'getMissionSubType').mockRejectedValueOnce(new Error('Test Error'));
        try {
            await controller.getMissionsSubType('test');
        } catch (e) {
            expect(e.message).toBe('Test Error');
        }
    });

    it('shoud return a mission catalog', async () => {
        const result = new MissionCatalog() as MissionCatalog;
        jest.spyOn(service, 'getMissionByCatalog').mockResolvedValueOnce(result);
        expect(await controller.getMissionsCatalog('teste', 'teste', 'teste', 'teste')).toBe(result);
    });

    it('shoud not return a mission catalog', async () => {
        jest.spyOn(service, 'getMissionByCatalog').mockRejectedValueOnce(new Error('Test Error'));
        try {
            await controller.getMissionsCatalog('test', 'test', 'test', 'test');
        } catch (e) {
            expect(e.message).toBe('Test Error');
        }
    });

    it('shoud add a new mission', async () => {
        const result = 'success';
        let file: Express.Multer.File;
        jest.spyOn(service, 'addMission').mockResolvedValueOnce(result);
        expect(await controller.addMission(0, 1, 'teste', file)).toBe(result);
    });

    it('shoud return a mission to review', async () => {
        const result = new Mission() as Mission;
        jest.spyOn(service, 'getMissionToReview').mockResolvedValueOnce(result);
        expect(await controller.getMissionToReviewById('1')).toBe(result);
    });

    it('shoud return a missions to review', async () => {
        const result = new Mission() as Mission;
        jest.spyOn(service, 'missionsToBeReviewed').mockResolvedValueOnce(result);
        expect(await controller.missionsToBeReviewed('3', '1')).toBe(result);
    });
});
