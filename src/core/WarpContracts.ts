import { 
  Warp, WarpFactory,
  EvalStateResult, LoggerFactory, ConsoleLoggerFactory,
  ArWallet, Tags, ArTransfer,
  WriteInteractionResponse, ContractData,
  FromSrcTxContractData, defaultCacheOptions, WarpGatewayInteractionsLoader,
  ContractDeploy, EvaluationOptions  } from 'warp-contracts'
import Arweave from 'arweave';
import { SortKeyCacheResult } from 'warp-contracts/lib/types/cache/SortKeyCache';
import { arweaveMainNets, arweaveTestNets, arweaveLocalNets } from './ArweaveWrapper';
export { 
  WasmSrc, ContractData, ArWallet, 
  FromSrcTxContractData, ArTransfer,
  Tags } from 'warp-contracts';
import { DeployPlugin, ArweaveSigner } from 'warp-contracts-plugin-deploy';

export class WarpContracts {
  private readonly _warp: Warp;
  private _gateway = 'https://gateway.redstone.finance';

  constructor(_arweave: Arweave, _gw = '', _useArweaveGw = false) {
    const host = _arweave.api.config.host;
    const port = _arweave.api.config.port;
    const protocol = _arweave.api.config.protocol;
    const cacheOptions = undefined;

    if (_gw) {
      this._gateway = _gw;
    }

    this.setLogLevel();
    if (this.onMainnet(_arweave)) {
      this._warp = WarpFactory.forMainnet(
        cacheOptions, _useArweaveGw, _arweave
      ).use(new DeployPlugin());
    } else if (this.onTestnet(_arweave)) {
      this._warp = WarpFactory.forTestnet().use(new DeployPlugin());
    } else if (this.onLocalnet(_arweave)) {
      this._warp = WarpFactory.forLocal();
    } else if (host && port && protocol) {
      const loader = new WarpGatewayInteractionsLoader(this._gateway);
      // TODO: Check options
      this._warp = WarpFactory.custom(
        _arweave,
        {
          ...defaultCacheOptions,
          inMemory: true
        },
        'custom'
      )
        .useArweaveGateway()
        .setInteractionsLoader(loader)
        .build().use(new DeployPlugin());
    } else {
      throw new Error(`Warp: Invalid Options ${host} ${port} ${protocol}`)
    }
  }

  setLogLevel() {
    LoggerFactory.use(new ConsoleLoggerFactory());
    LoggerFactory.INST.logLevel('fatal');
  }

  get warp(): Warp {
    return this._warp;
  }

  readState(
    contractAddress: string,
    evaluationOptions: Partial<EvaluationOptions>): Promise<SortKeyCacheResult<EvalStateResult<unknown>>> {
    const contract = this.warp.contract(contractAddress);
    contract.setEvaluationOptions(evaluationOptions); 
    return contract.readState();
  }

  writeInteraction(
    contractAddress: string,
    jwk: ArWallet,
    // eslint-disable-next-line
    input: any,
    tags?: Tags,
    transfer?: ArTransfer,
    strict = true): Promise<WriteInteractionResponse | null> {
    const contract = this._warp
      .contract(contractAddress)
      .connect(jwk)
      .setEvaluationOptions({
        // with this flag set to true
        // the write will wait for the transaction to be confirmed
        waitForConfirmation: false,
      });
    const options = { tags: tags, strict: strict, transfer: transfer }
    return contract.writeInteraction(input, options);
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
    const arweave = this.warp.arweave;
    if (balance >= vipMinimumBalance ||
      !this.onMainnet(arweave) ||
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

  /**
   * Given an map of address->balance, select one random address
   * weighted by the amount of tokens they hold.
   * https://github.com/ArweaveTeam/SmartWeave/blob/master/SDK.md#selectweightedpstholder
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

  public async createContract(
      contract: ContractData,
      disableBundling?: boolean
    ): Promise<ContractDeploy> {
    return await this.warp.deploy(contract, disableBundling);
  }

  public async createContractFromTX(
      contract: FromSrcTxContractData, disableBundling?: boolean
    ): Promise<ContractDeploy> {
    return await this.warp.deployFromSourceTx(contract, disableBundling);
  }


  public onMainnet(_arweave: Arweave) {
    if (_arweave.api.config.host) {
      return arweaveMainNets.indexOf(_arweave.api.config.host) >= 0;
    }
    return false;
  }

  public onTestnet(_arweave: Arweave) {
    if (_arweave.api.config.host) {
      return arweaveTestNets.indexOf(_arweave.api.config.host) >= 0;
    }
    return false;
  }

  public onLocalnet(_arweave: Arweave) {
    if (_arweave.api.config.host) {
      return arweaveLocalNets.indexOf(_arweave.api.config.host) >= 0;
    }
    return false;
  }
}
