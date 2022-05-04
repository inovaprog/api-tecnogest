import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { CanActivate, INestApplication } from '@nestjs/common';
import { setNestGlobalConfig } from '../../../../../src/lib/server/nest-server-config';
import { SupportModule } from '../../../../../src/modules/support/support.module';
import { JwtAuthGuard } from '../../../../../src/modules/auth/guards/jwt-auth.guard';
import Pinpoint from '../../../../../src/lib/aws/pinpoint';
import { SendEmailCommandOutput } from '@aws-sdk/client-pinpoint-email';

describe('Suport Module test', () => {
    let nestApp: INestApplication;
    const mockGuard: CanActivate = { canActivate: jest.fn(() => true) };

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [SupportModule],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue(mockGuard)
            .compile();
        nestApp = moduleRef.createNestApplication();
        setNestGlobalConfig(nestApp);
        await nestApp.init();
    });

    it(`send email to support`, () => {
        const mockResponsePinpoint: SendEmailCommandOutput = {} as SendEmailCommandOutput;
        jest.spyOn(Pinpoint, 'sendEmail').mockResolvedValueOnce(mockResponsePinpoint);
        return request(nestApp.getHttpServer())
            .post('/v2/support/')
            .send({
                emailBody: 'test',
                subject: 'test',
            })
            .expect(200);
    });

    afterAll(async () => {
        await nestApp.close();
    });
});
