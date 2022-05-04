import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Settings } from '../../../src/lib/typeorm/entities/settings';
import { SettingsService } from '../../../src/modules/settings/settings.service';
import { SettingsController } from '../../../src/modules/settings/settings.controller';
import { Request } from 'express';

describe('Settings Controller', () => {
    let service: SettingsService;
    let controller: SettingsController;

    const mockRepository = {};

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [SettingsController],
            providers: [SettingsService, { provide: getRepositoryToken(Settings), useValue: mockRepository }],
        }).compile();
        service = moduleRef.get<SettingsService>(SettingsService);
        controller = moduleRef.get<SettingsController>(SettingsController);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return the settings', async () => {
        const result: Settings = new Settings();
        jest.spyOn(service, 'getSettings').mockResolvedValueOnce(result);
        const req = { query: {} } as Request;
        expect(await controller.getSettings(req)).toBe(result);
    });

    it('should return the settings by query', async () => {
        const result: Settings = new Settings();
        jest.spyOn(service, 'getSettingsByQuery').mockResolvedValueOnce(result);
        const req = { query: { test: '' } } as unknown as Request;
        expect(await controller.getSettings(req)).toBe(result);
    });
});
