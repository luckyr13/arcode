import ArDB from 'ardb';
import Arweave from 'arweave';

export interface ArDBTag {
	name: string, values: string|string[]
}

export class ArDBWrapper {
	private readonly _ardb: ArDB;

	constructor(_arweave: Arweave) {
		this._ardb = new ArDB(_arweave);
	}

	get ardb(): ArDB {
		return this._ardb;
	}

	async findOneTx(tx: string) {
		let tmpRes = null;
		try {
			tmpRes = await this._ardb.search('transaction').id(tx).findOne();
		} catch (err) {
			console.error('findOne:', err);
		}
		return tmpRes;
	}

	async findFromOwners(owners: string[]|string, limit=10, tags: ArDBTag[] = []) {
		let query = this._ardb.search(
				'transactions'
			).limit(limit);
		let tmpRes = null;

		if (tags && tags.length) {
			query = query.tags(tags);
		}
		if (owners && owners.length) {
			query = query.from(owners);
		}
		try {
			tmpRes = await query.find();
		} catch (err) {
			console.error('findFromAddress:', err);
		}

		return tmpRes;
	}

	async nextResults() {
		let res = null;
		try {
			res = await this._ardb.next();
		} catch (error) {
			console.error('nextResults:', error);
		}
		return res;
	}
}