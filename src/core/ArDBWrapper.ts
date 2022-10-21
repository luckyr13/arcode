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

  /*
  *  @dev Helper class for searching a key in an array of tags
  */
  searchKeyNameInTags(_arr: any[], _key: string) {
    for (const a of _arr) {
      if (a.name === _key) {
        return a.value
      }
    }
    return ''
  }

  public timestampTodate(d: number|string): string {
    if (!d) {
      return ''
    }
    const prev = new Date(+d * 1000)
    const current = new Date()
    const millisecondsEllapsed = current.getTime() - prev.getTime();
    const seconds = Math.floor(millisecondsEllapsed / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ]

    if (days) {
      const month = months[prev.getMonth()]
      const date = prev.getDate()
      const year = prev.getFullYear()
      const currentYear = current.getFullYear()
      if (currentYear === year) {
        return `${month} ${date}`
      }
      return `${month} ${date}, ${year}`
    } else if (hours) {
      return `${hours}h`
    } else if (minutes) {
      return `${minutes}m`
    } else if (seconds) {
      return `${seconds}s`
    }

    return ``
  }
}