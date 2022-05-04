import { HttpException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Company } from '../../../src/lib/typeorm/entities/companies';
import { MissionSubType } from '../../../src/lib/typeorm/entities/mission-subtype';
import { MissionType } from '../../../src/lib/typeorm/entities/mission-type';
import { EventRepository } from '../../../src/lib/typeorm/repositories/events.repository';
import { MissionsRepository } from '../../../src/lib/typeorm/repositories/missions.repository';
import { PlayerRepository } from '../../../src/lib/typeorm/repositories/player.repository';
import { UserRepository } from '../../../src/lib/typeorm/repositories/users.repository';
import MissionsFunctions from '../../../src/lib/utils/missions-functions';
import UsersFunctions from '../../../src/lib/utils/users-functions';
import { PlayersService } from '../../../src/modules/players/players.service';

describe('Players Service', () => {
    let service: PlayersService;

    const mockUser = {
        Altura: undefined,
        Apelido: undefined,
        Email: undefined,
        Empresa: undefined,
        Img_avatar: undefined,
        Localizacao: undefined,
        Data_Nasc: moment().format('YYYY-MM-DD'),
        Missoes: 0,
        Missoes_Agua: 0,
        Missoes_Exerc: 0,
        Missoes_Mind: 0,
        Moedas: undefined,
        NivelExerc: NaN,
        Objetivo: NaN,
        Peso: undefined,
        Pontos: undefined,
        Setor: 'no-sector',
        hydrationAmount: NaN,
        isDependent: false,
        service: undefined,
        user_id: undefined,
        user_level: undefined,
        user_xp: undefined,
        xpToNextLevel: NaN,
        chronicDiseases: undefined,
        status: 'A',
    };

    const mockRepository = {
        findOne: jest.fn(),
        countMissionsByType: jest.fn(),
        countMissionsPoints: jest.fn(),
        forEach: jest.fn(),
        findMe: jest.fn(),
        countMissionsByTypeAndPlayer: jest.fn(),
    };

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                PlayersService,
                MissionsFunctions,
                UsersFunctions,
                { provide: getRepositoryToken(UserRepository), useValue: mockRepository },
                { provide: getRepositoryToken(MissionsRepository), useValue: mockRepository },
                { provide: getRepositoryToken(PlayerRepository), useValue: mockRepository },
                { provide: getRepositoryToken(MissionType), useValue: {} },
                { provide: getRepositoryToken(MissionSubType), useValue: {} },
                { provide: getRepositoryToken(EventRepository), useValue: {} },
                { provide: getRepositoryToken(Company), useValue: {} },
            ],
        }).compile();
        service = moduleRef.get<PlayersService>(PlayersService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return the Player by email', async () => {
        mockRepository.findMe.mockResolvedValueOnce(mockUser);
        mockRepository.countMissionsPoints.mockResolvedValueOnce([]);
        mockRepository.countMissionsByTypeAndPlayer.mockResolvedValueOnce([]);
        expect(await service.findMe('1', '1')).toStrictEqual(mockUser);
    });

    it('should return the error in settings search', async () => {
        try {
            await service.findMe(null, null);
        } catch (error) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error).toHaveProperty('message', 'Token not contain ID');
        }
    });
});
