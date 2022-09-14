import ArDB from 'ardb';
import Arweave from 'arweave';

export class ArDBWrapper {
	private readonly _ardb: ArDB;

	constructor(_arweave: Arweave) {
		this._ardb = new ArDB(_arweave);
	}

	get ardb(): ArDB {
		return this._ardb;
	}
}