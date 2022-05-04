import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { UtilsModule } from '../../../../../src/modules/utils/utils.module';
import { setNestGlobalConfig } from '../../../../../src/lib/server/nest-server-config';

describe('Get API Version', () => {
    let nestApp: INestApplication;
    process.env.hash_git = 'testGit';
    process.env.api_version = 'testVersion';
    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [UtilsModule],
        }).compile();
        nestApp = moduleRef.createNestApplication();
        setNestGlobalConfig(nestApp);
        await nestApp.init();
    });

    it(`/v2`, () => {
        return request(nestApp.getHttpServer())
            .get('/v2')
            .expect(200)
            .expect({
                statusCode: 200,
                data: { gitHash: 'testGit', apiVersion: 'testVersion' },
            });
    });

    afterAll(async () => {
        await nestApp.close();
    });
});
