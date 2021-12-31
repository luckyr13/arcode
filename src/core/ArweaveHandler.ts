import Arweave from 'arweave';
import ArDB from 'ardb';
import { 
  SmartWeave, SmartWeaveWebFactory, 
  LoggerFactory, ContractData, FromSrcTxContractData
 } from 'redstone-smartweave';


export class ArweaveHandler {
  private readonly _arweave: Arweave;
  private readonly _ardb: ArDB;
  private readonly _smartweave: SmartWeave;
  public readonly baseURL = 'https://arweave.net/';
  public readonly tokenContract = 'XFZxNNpgb043Doa7-4sra5dnbBB5RkOHRyQJ_YOzLAg';

  constructor() {
    this._arweave = Arweave.init({
      host: "arweave.net",
      port: 443,
      protocol: "https",
    });
    this._ardb = new ArDB(this._arweave);
    LoggerFactory.INST.logLevel('info');
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

}
