import { HttpException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Company } from '../../../src/lib/typeorm/entities/companies';
import { MissionSubType } from '../../../src/lib/typeorm/entities/mission-subtype';
import { MissionType } from '../../../src/lib/typeorm/entities/mission-type';
import { EventRepository } from '../../../src/lib/typeorm/repositories/events.repository';
import { MissionsRepository } from '../../../src/lib/typeorm/repositories/missions.repository';
import { PlayerRepository } from '../../../src/lib/typeorm/repositories/player.repository';
import { UserRepository } from '../../../src/lib/typeorm/repositories/users.repository';
import AccessValidations from '../../../src/lib/utils/accessValidations';
import MissionsFunctions from '../../../src/lib/utils/missions-functions';
import UsersFunctions from '../../../src/lib/utils/users-functions';
import { PlayersController } from '../../../src/modules/players/players.controller';
import { PlayersService } from '../../../src/modules/players/players.service';

describe('Players Controller', () => {
    let service: PlayersService;
    let controller: PlayersController;
    const result: any = {};
    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [PlayersController],
            providers: [
                PlayersService,
                MissionsFunctions,
                AccessValidations,
                UsersFunctions,
                { provide: getRepositoryToken(MissionType), useValue: result },
                { provide: getRepositoryToken(MissionsRepository), useValue: result },
                { provide: getRepositoryToken(PlayerRepository), useValue: result },
                { provide: getRepositoryToken(UserRepository), useValue: result },
                { provide: getRepositoryToken(MissionSubType), useValue: result },
                { provide: getRepositoryToken(EventRepository), useValue: result },
                { provide: getRepositoryToken(Company), useValue: result },
            ],
        }).compile();
        service = moduleRef.get<PlayersService>(PlayersService);
        controller = moduleRef.get<PlayersController>(PlayersController);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return a user', async () => {
        jest.spyOn(service, 'findMe').mockResolvedValueOnce(result);

        expect(await controller.me('test@test.com', '1')).toBe(result);
    });

    it('should return a user', async () => {
        try {
            await controller.me(null, null);
        } catch (error) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error).toHaveProperty('message', 'Token not contain ID');
        }
    });
});
