import { Logger } from '@nestjs/common';
import { createConnection, getConnectionManager } from 'typeorm';

export default async function connector() {
    const logger = new Logger('Connector');
    logger.log('Trying to connect to database...');
    const connectionManager = getConnectionManager();
    try {
        if (!connectionManager.has('default')) {
            logger.log('Creating new database connection');
            const conn = await createConnection({
                name: 'default',
                type: 'mysql',
                host: process.env.DB_HOST,
                port: parseInt(process.env.DB_PORT),
                username: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                synchronize: false,
                logging: false,
                entities: [`${__dirname}/../entities/*{.js,.ts}`],
                migrations: [`../migrations/*{.js,.ts}`],
                subscribers: [`../subscriber/*{.js,.ts}`],
            });
            return conn;
        }
        logger.log('Re-utilizing database connection which already exists...');
    } catch (err) {
        logger.error(`Failed to connect to database! Error: ${err.message}`);
    }
}
