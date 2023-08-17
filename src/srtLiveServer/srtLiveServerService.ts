import axios, { AxiosResponse } from 'axios';
import config from '../../config';

interface PublisherData {
  connected: boolean;
  latency: number;
  network: number;
  bitrate: number;
  rtt: number;
  dropped_pkts: number;
  averages: PublisherAverages;
}

interface PublisherAverages {
  avg5s: number;
  avg10s: number;
  avg15s: number;
  avg30s: number;
  avg60s: number;
}

interface SrtLiveServerData {
  status: string;
  publishers: Record<string, PublisherData>;
  consumers: any[];
  push: any;
}

class SrtLiveServerService {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  public async fetchDataFromServer(): Promise<SrtLiveServerData> {
    try {
      const response: AxiosResponse<SrtLiveServerData> = await axios.get(this.endpoint);

      if (response.data.status !== 'ok') {
        throw new Error('SRT Live Server returned non-ok status.');
      }

      return response.data;
    } catch (error) {
      throw new Error(`Error fetching data from SRT Live Server: ${error}`);
    }
  }
}

const srtLiveServerService = new SrtLiveServerService(config.srtLiveServer.endpoint);
export default srtLiveServerService;
