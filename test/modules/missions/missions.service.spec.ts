import { DetectLabelsCommandOutput } from '@aws-sdk/client-rekognition';
import { HttpException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import Rekognition from '../../../src/lib/aws/rekognition';
import ClientS3 from '../../../src/lib/aws/s3';
import { Company } from '../../../src/lib/typeorm/entities/companies';
import { MissionSubType } from '../../../src/lib/typeorm/entities/mission-subtype';
import { MissionType } from '../../../src/lib/typeorm/entities/mission-type';
import { Mission } from '../../../src/lib/typeorm/entities/missions';
import { Player } from '../../../src/lib/typeorm/entities/players';
import { User } from '../../../src/lib/typeorm/entities/users';
import { EventRepository } from '../../../src/lib/typeorm/repositories/events.repository';
import { MissionCatalogRepository } from '../../../src/lib/typeorm/repositories/missions-catalog.repository';
import { MissionsRepository } from '../../../src/lib/typeorm/repositories/missions.repository';
import { PlayerRepository } from '../../../src/lib/typeorm/repositories/player.repository';
import { UserRepository } from '../../../src/lib/typeorm/repositories/users.repository';
import MissionsFunctions from '../../../src/lib/utils/missions-functions';
import UsersFunctions from '../../../src/lib/utils/users-functions';
import { MissionsService } from '../../../src/modules/missions/missions.service';

describe('Missions Service', () => {
    let service: MissionsService;
    const result = [];

    const missionResponse = {
        accepted: undefined,
        id: undefined,
        levelUp: false,
    };

    const mockMissionSubTypeRepository = {
        findOne: jest.fn(),
    };

    const mockPlayerRepository = {
        findOne: jest.fn(),
        save: jest.fn(),
    };

    const mockMissionTypeRepository = {
        find: jest.fn(),
        findOne: jest.fn(),
    };

    const mockMissionCatalogRepository = {
        getMissionsbyType: jest.fn(),
        getMissionsbySubType: jest.fn(),
    };

    const mockMissionsRepository = {
        findByDateAndType: jest.fn(),
        save: jest.fn(),
        getMissionsToReviewByType: jest.fn(),
        getMissionToReviewByMissionId: jest.fn(),
    };

    const mockEventRepository = {};

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [],
            providers: [
                MissionsService,
                MissionsFunctions,
                UsersFunctions,
                { provide: getRepositoryToken(Mission), useValue: mockMissionsRepository },
                { provide: getRepositoryToken(Player), useValue: mockPlayerRepository },
                { provide: getRepositoryToken(MissionType), useValue: mockMissionTypeRepository },
                { provide: getRepositoryToken(MissionSubType), useValue: mockMissionSubTypeRepository },
                { provide: getRepositoryToken(MissionCatalogRepository), useValue: mockMissionCatalogRepository },
                { provide: getRepositoryToken(MissionsRepository), useValue: mockMissionsRepository },
                { provide: getRepositoryToken(PlayerRepository), useValue: mockPlayerRepository },
                { provide: getRepositoryToken(EventRepository), useValue: mockEventRepository },
                { provide: getRepositoryToken(UserRepository), useValue: mockEventRepository },
                { provide: getRepositoryToken(Company), useValue: {} },
            ],
        }).compile();
        service = moduleRef.get<MissionsService>(MissionsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return the mission type list', async () => {
        mockMissionTypeRepository.find.mockResolvedValueOnce(result);
        expect(await service.getMissionType()).toStrictEqual(result);
    });

    it('should return the misions subtype list by query', async () => {
        mockMissionTypeRepository.findOne.mockResolvedValueOnce({ subType: 'test' });
        expect(await service.getMissionSubType('test')).toStrictEqual('test');
    });

    it('should return the error in mission type search', async () => {
        mockMissionTypeRepository.find.mockRejectedValue(new Error('TestError'));
        try {
            await service.getMissionType();
        } catch (error) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error).toHaveProperty('message', 'TestError');
        }
    });

    it('should return the error in mission type search by query', async () => {
        mockMissionTypeRepository.findOne.mockRejectedValue(new Error('TestError'));
        try {
            await service.getMissionSubType('meal');
        } catch (error) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error).toHaveProperty('message', 'TestError');
        }
    });

    it('should return mission catalog without subtype', async () => {
        mockMissionCatalogRepository.getMissionsbyType.mockResolvedValueOnce(result);
        expect(await service.getMissionByCatalog('teste', 'test', 1)).toStrictEqual(result);
    });

    it('should return mission catalog with subtype', async () => {
        mockMissionCatalogRepository.getMissionsbySubType.mockResolvedValueOnce(result);
        expect(await service.getMissionByCatalog('teste', 'test', 1, 'test')).toStrictEqual(result);
    });

    it('should return the error in mission catalog search by query', async () => {
        mockMissionCatalogRepository.getMissionsbySubType.mockRejectedValue(new HttpException('TestError', 500));
        try {
            await service.getMissionByCatalog('teste', 'test', 1, 'test');
        } catch (error) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error).toHaveProperty('message', 'TestError');
        }
    });

    it('shoud add a new mission to user', async () => {
        const player: Player = new Player();
        const user: User = new User();
        player.user = user;
        player.user.referenceId = 'test';
        const missionType: MissionType = new MissionType();
        missionType.acceptedLabels = ['test'];
        missionType.name = 'roulette';
        const missionSaved: Mission = new Mission();
        const image = { originalname: 'teste' } as Express.Multer.File;
        const rekognitionResponse = { Labels: [] } as DetectLabelsCommandOutput;

        mockPlayerRepository.findOne.mockResolvedValueOnce(player);
        mockMissionTypeRepository.findOne.mockResolvedValueOnce(missionType);
        mockMissionsRepository.save.mockResolvedValueOnce(missionSaved);
        mockPlayerRepository.save.mockResolvedValueOnce(player);

        const dateTime = new Date().toISOString();

        mockMissionsRepository.findByDateAndType.mockResolvedValueOnce([]);
        jest.spyOn(ClientS3, 'uploadImage').mockResolvedValueOnce(null);
        jest.spyOn(Rekognition, 'detectLabel').mockResolvedValueOnce(rekognitionResponse);
        expect(
            await service.addMission(1, { dateTime: dateTime, coins: 10, selectedFoodData: '[]' }, 1, '', image),
        ).toStrictEqual(missionResponse);
    });

    const sets = [
        {
            mealKcal: 1088,
            missionsSubType: 'lunch',
            dateOfBirth: '1994-03-11',
            gender: 'M',
            weight: 80,
            height: 175,
            exerciseLevel: '3',
            gameObjective: '2',
        },
        {
            mealKcal: 608,
            missionsSubType: 'lunch',
            dateOfBirth: '1994-03-11',
            gender: 'F',
            weight: 94,
            height: 167,
            exerciseLevel: '0',
            gameObjective: '2',
        },
    ];

    sets.forEach((set) => {
        it(`Test get kcal. Gender: ${set.gender}`, async () => {
            const macronutrientsResponse = {
                mealKcal: set.mealKcal,
            };

            const missionSubType = {
                name: set.missionsSubType,
            } as MissionSubType;

            const player: Player = {
                user: {
                    dateOfBirth: set.dateOfBirth,
                    gender: set.gender,
                } as User,
                weight: set.weight,
                height: set.height,
                exerciseLevel: set.exerciseLevel,
                gameObjective: set.gameObjective,
            } as Player;
            mockMissionSubTypeRepository.findOne.mockResolvedValue(missionSubType);
            mockPlayerRepository.findOne.mockResolvedValueOnce(player);
            const { mealKcal } = await service.getMacronutrientsPercentage(
                { missionSubTypeId: 1 },
                { 'custom:playerId': 1 },
            );
            expect({ mealKcal }).toStrictEqual(macronutrientsResponse);
        });
    });

    it('should return a mission to review by type', async () => {
        const listMissions: Mission[] = [new Mission()];
        mockMissionsRepository.getMissionsToReviewByType.mockResolvedValueOnce(listMissions);
        expect(await service.missionsToBeReviewed('1', '1')).toStrictEqual(listMissions);
    });

    it('should return a mission to review by Id', async () => {
        const listMissions: Mission[] = [new Mission()];
        mockMissionsRepository.getMissionToReviewByMissionId.mockResolvedValueOnce(listMissions);
        expect(await service.getMissionToReview('1')).toStrictEqual(listMissions);
    });
});
