import Arweave from 'arweave';
import { JWKInterface } from 'arweave/web/lib/wallet';
import Transaction from 'arweave/web/lib/transaction';

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

export function onMainnetByString(host: string) {
  return arweaveMainNets.indexOf(host) >= 0;
}

export function onLocalnetByString(host: string) {
  return arweaveLocalNets.indexOf(host) >= 0;
}

export function onTestnetByString(host: string) {
  return arweaveTestNets.indexOf(host) >= 0;
}

export class ArweaveWrapper {
  private readonly _arweave: Arweave;
  private _host = '';
  private _baseURL = '';
  private _port = 0;
  private _protocol = '';
  // Limit: 120kb
  public dataSizeLimitDispatch = 120000;

  public secondaryRedstoneGW = 'https://d1o5nlqr4okus2.cloudfront.net';

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
    let errM2 = false;
    if (errM1) {
      try {
        data = await this.arweave.transactions.getData(tx, {decode: true, string: asString});
      } catch (err) {
        console.error('ErrM2: ', err);
        errM2 = true;
      }
    }

    // Method 3
    if (errM2) {
      throw Error('It seems not possible to load tx data');
    }

    return data;
  }



  public onTestnet() {
    return arweaveTestNets.indexOf(this._arweave.api.config.host!) >= 0;
  }

  public onLocalnet(_arweave: Arweave) {
    return arweaveLocalNets.indexOf(this._arweave.api.config.host!) >= 0;
  }

  winstonToAr(winston: string) {
    return this._arweave.ar.winstonToAr(winston);
  }

  /*
  * @dev Upload a file to the permaweb
  */
  public async uploadFileToArweave(
    fileBin: any,
    contentType: string,
    key: JWKInterface | "use_wallet",
    tags: {name: string, value: string}[],
    loginMethod: string,
    disableDispatch: boolean,
    externalProgressObj?: {completed: string, uploaded: string, total: string}|undefined|null): Promise<Transaction|{id: string, type: string}|any> {
    // Check if the login method allows dispatch
    if (!disableDispatch) {
      if (loginMethod !== 'arconnect' && loginMethod !== 'arweavewebwallet') {
        throw new Error('Dispatch is not available for this login method!');
      }
    }

    // Create transaction
    const transaction = await this._arweave.createTransaction({
        data: fileBin,
    }, key);

    transaction.addTag('Content-Type', contentType);
    for (const t of tags) {
      transaction.addTag(t.name, t.value);
    }

    // If ArConnect try Dispatch first
    if (loginMethod === 'arconnect' && !disableDispatch) {
      if (!(window && window.arweaveWallet)) {
        throw new Error('ArConnect method not available!');
      }

      if (+(transaction.data_size) > this.dataSizeLimitDispatch) {
        throw new Error(`Dispatch is not available for data size > ${this.dataSizeLimitDispatch} bytes.`);
      }

      const dispatchResult = await window.arweaveWallet.dispatch(transaction);
      console.log('Trying dispatch method ...', dispatchResult);
      // Return Dispatch result
      return dispatchResult;

    } // Else, try ArConnect Sign method
    else if (loginMethod === 'arconnect') {
      if (!(window && window.arweaveWallet)) {
        throw new Error('ArConnect method not available!');
      }

      console.log('Signing transaction ...');

      // Sign transaction
      await this._arweave.transactions.sign(transaction, key);
      // Submit transaction 
      const uploader = await this._arweave.transactions.getUploader(transaction);
      while (!uploader.isComplete) {
        await uploader.uploadChunk();
        if (externalProgressObj) {
          externalProgressObj.completed = `${uploader.pctComplete}%`;
          externalProgressObj.uploaded = `${uploader.uploadedChunks}`;
          externalProgressObj.total = `${uploader.totalChunks}`;
        }
        console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
      }
    } else if (loginMethod === 'arweavewebwallet' && !disableDispatch) {
      if (!(window && window.arweaveWallet)) {
        throw new Error('Arweave Wallet method not available!');
      }

      if (+(transaction.data_size) > this.dataSizeLimitDispatch) {
        throw new Error(`Dispatch is not available for data size > ${this.dataSizeLimitDispatch} bytes.`);
      }

      const dispatchResult = await window.arweaveWallet.dispatch(transaction);
      console.log('Trying dispatch method ...', dispatchResult);
      // Return Dispatch result
      return dispatchResult;

    } else {
      console.log('Signing transaction ...');

      // Sign transaction
      await this._arweave.transactions.sign(transaction, key);
      // Submit transaction 
      const uploader = await this._arweave.transactions.getUploader(transaction);
      while (!uploader.isComplete) {
        await uploader.uploadChunk();
        if (externalProgressObj) {
          externalProgressObj.completed = `${uploader.pctComplete}%`;
          externalProgressObj.uploaded = `${uploader.uploadedChunks}`;
          externalProgressObj.total = `${uploader.totalChunks}`;
        }
        console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
      }
    }

    return transaction;
  }


}
