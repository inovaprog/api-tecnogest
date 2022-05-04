import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { UtilsModule } from '../../../../../src/modules/utils/utils.module';
import * as countries from '../../../../../src/resources/countries.json';
import { setNestGlobalConfig } from '../../../../../src/lib/server/nest-server-config';

describe('Get Countries', () => {
    let nestApp: INestApplication;
    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [UtilsModule],
        }).compile();
        nestApp = moduleRef.createNestApplication();
        setNestGlobalConfig(nestApp);
        nestApp = await nestApp.init();
    });

    for (const language of ['en', 'es', 'pt-br']) {
        it(`/countries`, async () => {
            return request(nestApp.getHttpServer())
                .get('/v2/countries')
                .set('Accept-Language', language)
                .expect(200)
                .expect({
                    statusCode: 200,
                    data: { countries: countries[language] },
                });
        });
    }

    afterAll(async () => {
        await nestApp.close();
    });
});
