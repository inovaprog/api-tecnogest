import { Test } from '@nestjs/testing';
import { UtilsController } from '../../../src/modules/utils/utils.controller';

describe('Settings Controller', () => {
    let controller: UtilsController;

    const mockRepository = {};

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [UtilsController],
            providers: [],
        }).compile();
        controller = moduleRef.get<UtilsController>(UtilsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should return the version', async () => {
        process.env.hash_git = 'hash_git';
        process.env.api_version = 'api_version';
        const response = {
            apiVersion: process.env.api_version,
            gitHash: process.env.hash_git,
        }
        expect(await controller.getAPIVersion()).toStrictEqual(response);
    });
});