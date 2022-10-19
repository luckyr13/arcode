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

	async findFromOwners(
		owners: string[]|string,
		limit=10,
		tags: ArDBTag[] = [],
		sortingOrder: 'HEIGHT_DESC'|'HEIGHT_ASC' = 'HEIGHT_DESC',
    maxHeight = 0) {
		let tmpRes = null;
		let query = this._ardb.search(
				'transactions'
			).limit(limit).max(maxHeight).sort(sortingOrder);
		// Filters
		if (tags && tags.length) {
			query = query.tags(tags);
		}
		if (owners && owners.length) {
			query = query.from(owners);
		}
		// Run query
		tmpRes = await query.find();
		
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