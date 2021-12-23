import Arweave from 'arweave';
import ArDB from 'ardb';

export class ArweaveHandler {
  private _arweave: Arweave;
  private _ardb: ArDB;
  public baseURL = 'https://arweave.net/';

  constructor() {
    this._arweave = Arweave.init({
      host: "arweave.net",
      port: 443,
      protocol: "https",
    });
    this._ardb = new ArDB(this._arweave);

  }

  public get arweave(): Arweave {
    return this._arweave;
  }

  public get ardb(): ArDB {
    return this._ardb;
  }

}
