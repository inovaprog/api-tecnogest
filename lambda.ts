import 'source-map-support/register';

import { Handler, Context } from 'aws-lambda';
import { configure as serverlessExpress } from '@vendia/serverless-express';
import { Logger } from '@nestjs/common';
import { noop } from 'lodash';
import * as express from 'express';
import { createApp } from './src/app';
import * as AWSXRay from 'aws-xray-sdk-core';
import pinoLambda, { PinoLogFormatter } from 'pino-lambda';
import { isServerlessOffline } from './src/lib/utils/environment';

// Init global logger
const options = isServerlessOffline() ? {
    transport: { target: 'pino-pretty', options: { colorize: true } },
    formatter: new PinoLogFormatter(),
} : {};
const globalLogger = pinoLambda({
    level: (process.env.logLevel || 'debug').toLowerCase(),
    customLevels: {
        log: 30, // LOG_LEVEL_INFO
    },
    ...options,
});
// Init XRayServices
AWSXRay.setContextMissingStrategy(noop);

// Bootstrap Cached Express Server
let cachedServer: any;

async function bootstrapServer(): Promise<Handler> {
    if (!cachedServer) {
        const expressApp = express();
        const nestApp = await createApp(expressApp, globalLogger);
        cachedServer = serverlessExpress({ app: expressApp });
        cachedServer.log = new Logger('ServerlessExpress');
        await nestApp.init();
    }
    return cachedServer;
}

export const handler: Handler = async (event: any, context: Context, callback: any) => {
    globalLogger.withRequest(event, context);

    const logger = new Logger('Handler');
    const server = await bootstrapServer();

    if (event.source === 'warmup-lambda') {
        const response: {
            statusCode: number;
            body: any;
            headers: any;
        } = {
            statusCode: 200,
            body: null,
            headers: null,
        };
        //TODO: warmup dynamo and cognito

        response.body = 'WarmUP - Lambda is warm!';
        logger.log(response.body);
        return response;
    }

    if (event.path && event.path.includes('v1/swagger-ui')) {
        event.path = event.path.replace('v1', 'v1/docs');
    }

    if (event.path === '/v1/docs') {
        event.path = '/v1/docs/';
    }

    if (
        event.body &&
        ((event.headers['Content-Type'] || event.headers['content-type']).includes('application/json') ||
            (event.headers['Content-Type'] || event.headers['content-type']).includes('multipart/form-data')) &&
        isServerlessOffline()
    ) {
        event.body = (Buffer.from(event.body, 'binary') as unknown) as string;
    }
    return server(event, context, callback);
};
