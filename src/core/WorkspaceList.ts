import { ArDBWrapper, type ArDBTag } from '@/core/ArDBWrapper'
import type Arweave from 'arweave'
import type { WorkspaceMetadata } from '@/core/interfaces/WorkspaceMetadata'
import type ArdbTransaction from 'ardb/lib/models/transaction'
import type ArdbBlock from 'ardb/lib/models/block'
import { protocolName } from '@/core/AppSettings'

export class WorkspaceList {
  private _ardbWrapper: ArDBWrapper
  private _list: WorkspaceMetadata[] = [] 

  constructor(arweave: Arweave) {
    this._ardbWrapper = new ArDBWrapper(arweave)
  }

  public async getList(limit: number, maxHeight=0): Promise<WorkspaceMetadata[]> {
    const owners: string[] = []
    const tags: ArDBTag[] = [
      { name: 'App-Name', values: protocolName },
      { name: 'Type', values: 'Workspace' },
    ]
    const order = 'HEIGHT_DESC'
    const data: ArdbTransaction[] = await this._ardbWrapper.findFromOwners(
      owners, limit, tags, order, maxHeight
    ) as ArdbTransaction[]
    
    this._list = data.map((tx) => {
      return this._reduceToMetadata(tx)
    })
    return [...this._list]
  }

  private _reduceToMetadata(tx: ArdbTransaction|ArdbBlock) {
    tx = tx as ArdbTransaction
    const tags = tx.tags
    const name = this._ardbWrapper.searchKeyNameInTags(tags, 'WorkspaceName')
    const description = this._ardbWrapper.searchKeyNameInTags(tags, 'WorkspaceDescription')
    const owner = tx.owner && tx.owner.address ? tx.owner.address : ''
    const deployingDate = this._ardbWrapper.timestampTodate(tx.block.timestamp)
    const dataSize = tx.data && tx.data.size ? tx.data.size : 0
    return { id: tx.id, name, description, owner, deployingDate, dataSize }
  }


  public async nextResults() {
    const nextRes = await this._ardbWrapper.nextResults()
    const nextResAsArray = nextRes as ArdbTransaction[]
    const nextResAsObj = nextRes as ArdbTransaction
    const newResults: WorkspaceMetadata[] = []

    if (nextResAsArray && 
        Object.prototype.hasOwnProperty.call(nextResAsArray, 'length') &&
        nextResAsArray.length) {
      newResults.push(...nextResAsArray.map((v) => {
        return this._reduceToMetadata(v)
      }))

    } else if (nextResAsArray &&
              Object.prototype.hasOwnProperty.call(nextResAsArray, 'length') &&
              nextResAsArray.length === 0) {
      throw new Error(`No more results found.`)
    }else if (nextResAsObj && Object.keys(nextResAsObj)) {
      newResults.push(this._reduceToMetadata(nextResAsObj))
    } else {
      throw new Error(`No more results found.`)
    }

    this._list.push(...newResults)
    return newResults
  }

}