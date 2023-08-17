import config from '../../config';
import logger from '../utils/logger';
import srtLiveServerService from './srtLiveServerService';
import WebSocketServer from '../websocketRelay/webSocketRelayServer';

class SrtLiveServerManager {
  private lastSentData: string | null;
  private publisherBitrateHistory: Record<string, Array<{ timestamp: number; bitrate: number }>> = {};

  constructor() {
    this.lastSentData = null;
    this.publisherBitrateHistory = {};
  }

  private updateBitrateHistory(publisherId: string, bitrate: number) {
    const currentTime = Date.now();
    this.publisherBitrateHistory[publisherId] = this.publisherBitrateHistory[publisherId] || [];
    this.publisherBitrateHistory[publisherId].push({
      timestamp: currentTime,
      bitrate: bitrate,
    });

    const historyCutoff = currentTime - 60000; // 60 seconds ago
    this.publisherBitrateHistory[publisherId] = this.publisherBitrateHistory[publisherId].filter(
      entry => entry.timestamp >= historyCutoff
    );
  }

  private calculateAverageBitrate(publisherId: string, seconds: number): number {
    const history = this.publisherBitrateHistory[publisherId] || [];
    const currentTime = Date.now();
    const relevantHistory = history.filter(entry => entry.timestamp >= currentTime - seconds * 1000);
    const sumBitrates = relevantHistory.reduce((sum, entry) => sum + entry.bitrate, 0);
    const result = relevantHistory.length > 0 ? sumBitrates / relevantHistory.length : 0;
    return Math.round(result);
  }

  private async fetchDataAndProcess(): Promise<void> {
    try {
      const data = await srtLiveServerService.fetchDataFromServer();

      // Iterate through publishers to update bitrate history and calculate averages
      for (const publisherId in data.publishers) {
        if (data.publishers.hasOwnProperty(publisherId)) {
          const publisher = data.publishers[publisherId];
          this.updateBitrateHistory(publisherId, publisher.bitrate);

          publisher.averages = {
            avg5s: this.calculateAverageBitrate(publisherId, 5),
            avg10s: this.calculateAverageBitrate(publisherId, 10),
            avg15s: this.calculateAverageBitrate(publisherId, 15),
            avg30s: this.calculateAverageBitrate(publisherId, 30),
            avg60s: this.calculateAverageBitrate(publisherId, 60),
          };

          data.publishers[publisherId] = publisher;
        }
      }

      // Clean up publisher data not received in the new data
      const validPublisherIds = Object.keys(data.publishers);
      for (const storedPublisherId in this.publisherBitrateHistory) {
        if (!validPublisherIds.includes(storedPublisherId)) {
          delete this.publisherBitrateHistory[storedPublisherId];
        }
      }

      const formattedData = JSON.stringify(data, null, 2);
      if (formattedData !== this.lastSentData) {
        this.lastSentData = formattedData;
        WebSocketServer.sendToClients(data);
        logger.debug(`SRT Server Response: ${formattedData}`);
      }
    } catch (error) {
      logger.error(error);
    }
  }

  public async start(): Promise<void> {
    logger.info('SRT Live Server Manager started.');

    setInterval(() => {
      this.fetchDataAndProcess();
    }, config.srtLiveServer.fetchInterval);
  }
}

export default SrtLiveServerManager;
