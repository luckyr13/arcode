import Arweave from 'arweave';
import ArDB from 'ardb';
import { 
  SmartWeave, SmartWeaveWebFactory, 
  LoggerFactory, ContractData
 } from 'redstone-smartweave';


export class ArweaveHandler {
  private readonly _arweave: Arweave;
  private readonly _ardb: ArDB;
  private readonly _smartweave: SmartWeave;
  public readonly baseURL = 'https://arweave.net/';

  constructor() {
    this._arweave = Arweave.init({
      host: "arweave.net",
      port: 443,
      protocol: "https",
    });
    this._ardb = new ArDB(this._arweave);
    LoggerFactory.INST.logLevel('fatal');
    this._smartweave = SmartWeaveWebFactory.memCached(this._arweave);
    
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

}
