import Arweave from 'arweave';
import ArDB from 'ardb';
import { 
  SmartWeave, SmartWeaveWebFactory, 
  LoggerFactory, ContractData, FromSrcTxContractData,
  RedstoneGatewayInteractionsLoader, ArTransfer
 } from 'redstone-smartweave';
export class ArweaveHandler {
  private readonly _arweave: Arweave;
  private readonly _ardb: ArDB;
  private readonly _smartweave: SmartWeave;
  private readonly _mainNets = [
    'arweave-mainnet', 'arweave-dev-mainnet', 'arweave.net', 'arweave.dev'
  ];
  public readonly networks: Record<string, {host: string, port: number, protocol: string}> = {
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
    'arweave-dev-mainnet': {
      host: "arweave.dev",
      protocol: "https",
      port: 443,
    }
  };
  private _host = '';
  private _baseURL = '';
  private _port = 0;
  private _protocol = '';
  public readonly gatewayUrl = `https://gateway.redstone.finance`;
  public readonly tokenContract = 'XFZxNNpgb043Doa7-4sra5dnbBB5RkOHRyQJ_YOzLAg';

  constructor(network= 'arweave-mainnet', host='', port=0, protocol='') {
    this._initSettings(network, host, port, protocol);
    this._arweave = Arweave.init({
      host: this.host,
      port: this.port,
      protocol: this.protocol,
    });
    this._ardb = new ArDB(this._arweave);
    LoggerFactory.INST.logLevel('fatal');
    // Use gw?    
    if (network === 'arweave-mainnet') {
      this._smartweave = SmartWeaveWebFactory.memCachedBased(this._arweave)
        .setInteractionsLoader(new RedstoneGatewayInteractionsLoader(this.gatewayUrl, {confirmed: true}))
        .build();
    } else {
      this._smartweave = SmartWeaveWebFactory.memCached(this._arweave);
    }
  }

  private _initSettings(network= 'arweave-mainnet', host='', port=0, protocol='') {
    if (network) {
      this.port = this.networks[network].port;
      this.protocol = this.networks[network].protocol;
      this.host = this.networks[network].host;
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

  public get ardb(): ArDB {
    return this._ardb;
  }

  public get smartweave(): SmartWeave {
    return this._smartweave;
  }

  public async createContract(contract: ContractData): Promise<string> {
    return await this._smartweave.createContract.deploy(contract);
  }

  public async createContractFromTX(contract: FromSrcTxContractData): Promise<string> {
    return await this._smartweave.createContract.deployFromSourceTx(contract);
  }

  /**
   * Given an map of address->balance, select one random address
   * weighted by the amount of tokens they hold.
   *
   * @param balances  A balances object, where the key is address and the value is the number of tokens they hold
   */
  public selectWeightedPstHolder(balances: Record<string, number>): string {
    // Count the total tokens
    let totalTokens = 0;
    for (const address of Object.keys(balances)) {
      totalTokens += balances[address];
    }
    // Create a copy of balances where the amount each holder owns is represented
    // by a value 0-1.
    const weighted: Record<string, number> = {};
    for (const address of Object.keys(balances)) {
      weighted[address] = balances[address] / totalTokens;
    }

    let sum = 0;
    const r = Math.random();
    for (const address of Object.keys(weighted)) {
      sum += weighted[address];
      if (r <= sum && weighted[address] > 0) {
        return address;
      }
    }
    throw new Error('Unable to select token holder');
  }

  public getTransferData(
    balance: number,
    vipMinimumBalance: number,
    network: string,
    appFeeInWinston: string,
    mainAddress: string,
    balances: Record<string, number> 
  ): ArTransfer|undefined {
    const maxAttempts = 10;
    if (balance >= vipMinimumBalance ||
      !this.onMainnet() ||
      Object.keys(balances).length === 0) {
      return undefined;
    }
    
    let attempts = 0;
    const t: ArTransfer = { target: '', winstonQty: appFeeInWinston}
    while ((!t.target || t.target == mainAddress) && attempts < maxAttempts) {
      t.target = this.selectWeightedPstHolder(balances);
      attempts++;
    }

    if (t.target) {
      return t;
    }

    return undefined;
  }

  public onMainnet() {
     return this._mainNets.indexOf(this._arweave.api.config.host!) >= 0;
  }

  public async arlocalMine() {
    const endpoint = `${this._arweave.api.config.protocol}://${this._arweave.api.config.host}:${this._arweave.api.config.port}/mine`;
    const res = await fetch(endpoint);
    return res;
  }

}
