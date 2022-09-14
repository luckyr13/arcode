import Arweave from 'arweave';

export const arweaveMainNets = [
  'arweave-mainnet', 'arweave.net'
];

export const arweaveTestNets = [
  'redstone-testnet', 'testnet.redstone.tools'
];

export const arweaveLocalNets = [
  'arlocal-localhost', 'localhost'
];

export const arweaveNetworks: Record<string, {host: string, port: number, protocol: string}> = {
  'arlocal-localhost': {
    host: 'localhost',
    port: 1984,
    protocol: 'http'
  },
  'redstone-testnet': {
    host: 'testnet.redstone.tools',
    port: 443,
    protocol: 'https'
  },
  'arweave-mainnet': {
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
  },
};

export class ArweaveWrapper {
  private readonly _arweave: Arweave;
  private _host = '';
  private _baseURL = '';
  private _port = 0;
  private _protocol = '';

  constructor(network= 'arweave-mainnet', host='', port=0, protocol='') {
    this._initSettings(network, host, port, protocol);
    this._arweave = Arweave.init({
      host: this.host,
      port: this.port,
      protocol: this.protocol,
    });
  }

  private _initSettings(network= 'arweave-mainnet', host='', port=0, protocol='') {
    if (network) {
      this.port = arweaveNetworks[network].port;
      this.protocol = arweaveNetworks[network].protocol;
      this.host = arweaveNetworks[network].host;
    } else {
      // Update host
      if (!host || !port || !protocol) {
        throw Error('Please provide host, port and protocol or a network!');
      }
      this.port = port;
      this.protocol = protocol;
      this.host = host;
    }
    this._baseURL = `${this.protocol}://${this._host}/`;
  }

  public get host(): string {
    return this._host;
  }

  public set host(host: string) {
    this._host = host;
  }

  public get port(): number {
    return this._port;
  }

  public set port(port: number) {
    this._port = port;
  }
  public get protocol(): string {
    return this._protocol;
  }

  public set protocol(protocol: string) {
    this._protocol = protocol;
  }

  public get baseURL(): string {
    return this._baseURL;
  }

  public get arweave(): Arweave {
    return this._arweave;
  }  

  public onMainnet() {
    return arweaveMainNets.indexOf(this._arweave.api.config.host!) >= 0;
  }

  public async arlocalMine() {
    const endpoint = `${this._arweave.api.config.protocol}://${this._arweave.api.config.host}:${this._arweave.api.config.port}/mine`;
    const res = await fetch(endpoint);
    return res;
  }

  public async getTXData(tx: string, asString = true): Promise<string|Uint8Array> {
    let data: string|Uint8Array = '';
    let errM1 = false;

    // Method 1
    try {
      const response = await fetch(`${this._baseURL}${tx}`);
      if (response.ok && asString) {
        data = await response.text();
      } else if (response.ok && !asString){
        data = new Uint8Array(await response.arrayBuffer());
      } else {
        throw Error('Error on response');
      }

    } catch (err) {
      console.error('ErrM1: ', err);
      errM1 = true;
    }

    // Method 2
    if (errM1) {
      try {
        data = await this.arweave.transactions.getData(tx, {decode: true, string: asString});
      } catch (err) {
        console.error('ErrM2: ', err);
        throw Error('It seems not possible to load tx data');
      }
    }

    return data;
  }



  public onTestnet() {
    return arweaveTestNets.indexOf(this._arweave.api.config.host!) >= 0;
  }

  public onLocalnet(_arweave: Arweave) {
    return arweaveLocalNets.indexOf(this._arweave.api.config.host!) >= 0;
  }


}
