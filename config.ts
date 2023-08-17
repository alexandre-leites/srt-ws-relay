import * as fs from 'fs';

interface ApplicationConfig {
  logLevel: string;
  hideLogo: boolean;
}

interface SrtLiveServerConfig {
  endpoint: string;
  fetchInterval: number;
}

interface WebsocketRelayConfig {
  port: number;
  path: string;
}

interface Config {
  application: ApplicationConfig;
  srtLiveServer: SrtLiveServerConfig;
  websocketRelay: WebsocketRelayConfig;
}

const config: Config = JSON.parse(fs.readFileSync('./data/config.json', 'utf8'));

config.application.logLevel = process.env.APP_LOG_LEVEL || config.application.logLevel;
config.application.hideLogo = process.env.APP_HIDE_LOGO ? JSON.parse(process.env.APP_HIDE_LOGO) : config.application.hideLogo;
config.srtLiveServer.endpoint = process.env.SRT_LIVE_SERVER_ENDPOINT || config.srtLiveServer.endpoint;
config.srtLiveServer.fetchInterval = parseInt(process.env.SRT_LIVE_SERVER_FETCH_INTERVAL || '', 10) || config.srtLiveServer.fetchInterval;
config.websocketRelay.port = parseInt(process.env.WEBSOCKET_RELAY_PORT || '', 10) || config.websocketRelay.port;
config.websocketRelay.path = process.env.WEBSOCKET_RELAY_PATH || config.websocketRelay.path;

export default config;
