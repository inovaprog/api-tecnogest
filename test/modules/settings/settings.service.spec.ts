import { HttpException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Settings } from '../../../src/lib/typeorm/entities/settings';
import { SettingsService } from '../../../src/modules/settings/settings.service';

describe('Settings Service', () => {
    let service: SettingsService;
    const result = [];

    const mockRepository = { find: jest.fn() };

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [],
            providers: [SettingsService, { provide: getRepositoryToken(Settings), useValue: mockRepository }],
        }).compile();
        service = moduleRef.get<SettingsService>(SettingsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return the settings list', async () => {
        mockRepository.find.mockResolvedValueOnce(result);
        expect(await service.getSettings()).toStrictEqual(result);
    });

    it('should return the settings list by query', async () => {
        mockRepository.find.mockResolvedValueOnce(result);
        expect(await service.getSettingsByQuery({})).toStrictEqual(result);
    });

    it('should return the settings list by query with name', async () => {
        mockRepository.find.mockResolvedValueOnce(result);
        expect(await service.getSettingsByQuery({ name: 'test' })).toStrictEqual(result);
    });

    it('should return the error in settings search', async () => {
        mockRepository.find.mockRejectedValue(new Error('TestError'));
        try {
            await service.getSettings();
        } catch (error) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error).toHaveProperty('message', 'TestError');
        }
    });

    it('should return the error in settings search by query', async () => {
        mockRepository.find.mockRejectedValue(new Error('TestErrorByQuery'));
        try {
            await service.getSettingsByQuery({});
        } catch (error) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error).toHaveProperty('message', 'TestErrorByQuery');
        }
    });
});
