import * as fs from 'fs';

import SrtLiveServerManager from './src/srtLiveServer/srtLiveServerManager';
import logger from './src/utils/logger';
import config from './config';

function displayLogo() {
    if (config.application.hideLogo)
        return;

    try {
        const logo = fs.readFileSync('./logo.txt', 'utf8');
        console.log(logo);
        console.log();
    } catch (error) {
        // ignore
    }
}

function displayConfig() {
    logger.info("Configuration: ");

    logger.info(`> Application: `);
    logger.info(`> > Log Level: ${config.application.logLevel}`);
    logger.info(`> > Hide Logo: ${config.application.hideLogo}`);

    logger.info(`> SRT Server: `);
    logger.info(`> > Endpoint: ${config.srtLiveServer.endpoint}`);
    logger.info(`> > Fetch Interval: ${config.srtLiveServer.fetchInterval}`);

    logger.info(`> WebSocket Relay: `);
    logger.info(`> > Port: ${config.websocketRelay.port}`);
    logger.info(`> > Path: ${config.websocketRelay.path}`);
}

displayLogo();
displayConfig();
const srtLiveServerManager = new SrtLiveServerManager();

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

srtLiveServerManager.start();