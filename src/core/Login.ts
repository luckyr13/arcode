import { ArWallet } from 'warp-contracts'
 import{
  SignatureOptions,
} from "arweave/web/lib/crypto/crypto-interface"
import Transaction from "arweave/web/lib/transaction"
import { JWKInterface } from "arweave/web/lib/wallet"
import Arweave from 'arweave'
import { ArweaveWebWallet } from 'arweave-wallet-connector'
import { ref } from 'vue'
import { IFrameWalletBridge } from './IFrameWalletBridge'
import { InjectedArweaveSigner } from 'warp-contracts-plugin-deploy';
import { PermissionType, AppInfo, GatewayConfig, DispatchResult } from 'arconnect';

export class Login {
  // User's private key
  private _key: ArWallet|null = null
  private _storage: Storage
  // User's arweave public address
  private _mainAddress = ref('')
  private _cachedProperties = ['MAINADDRESS', 'KEY', 'METHOD']
  // ArweaveApp
  private _appInfo = {
    name: 'Arcode Studio',
    logo: 'https://arweave.net/wJGdli6nMQKCyCdtCewn84ba9-WsJ80-GS-KtKdkCLg'
  }
  private _arweaveWebWallet = new ArweaveWebWallet(this._appInfo)
  private _method = ''

  constructor() {
    this._storage = window.sessionStorage
  }

  public get key(): ArWallet|null {
    return this._key ? this._key : 'use_wallet'
  }

  public set key(key: ArWallet|null) {
    this._key = key
    this._storage.setItem(this._cachedProperties[1], JSON.stringify(this._key))
  }

  public get mainAddress() {
    return this._mainAddress.value
  }


  public set mainAddress(address: string) {
    this._mainAddress.value = address
    this._storage.setItem(this._cachedProperties[0], address)
  }

  public set method(method: string) {
    this._method = method
    this._storage.setItem(this._cachedProperties[2], this._method)
  }

  public get method(): string {
    return this._method
  }


  setAccount(mainAddress: string, arWallet: ArWallet|null = null, stayLoggedIn= false): void {
    this._storage = stayLoggedIn ? window.localStorage : window.sessionStorage
    this.mainAddress = mainAddress

    if (arWallet) {
      this.key = arWallet
    }
  }

  removeAccountFromCache(): void {
    for (const key of this._cachedProperties) {
      window.sessionStorage.removeItem(key)
      window.localStorage.removeItem(key)
    }
  }

  uploadKeyFile(inputElement: HTMLInputElement, stayLoggedIn: boolean, arweave: Arweave): Promise<string> {
    const p = new Promise<string>((resolve, reject) => {
      let address = ''
      const file = inputElement.files && inputElement.files.length ? 
        inputElement.files[0] : null
      const freader = new FileReader()
      freader.onload = async () => {
        const key = JSON.parse(`${freader.result}`)
        try {
          address = await arweave.wallets.jwkToAddress(key)
          this.setAccount(address, key, stayLoggedIn)
          this.method = 'keyfile'
          resolve(address)
        } catch (error) {
          reject(`Error loading key ${error}`)
        }
      }

      freader.onerror = () => {
        reject('Error reading file')
      }

      if (file) {
        freader.readAsText(file)
      }
    })
  
    return p
  }

  async arConnect(stayLoggedIn: boolean, arweave: Arweave): Promise<string> {
    if (!window.arweaveWallet) {
      throw Error('ArConnect not found!')
    }
    // Custom permissions
    const customPermissions: PermissionType[] = [
      'ACCESS_ADDRESS', 'ACCESS_ALL_ADDRESSES',
      'SIGN_TRANSACTION', 'DISPATCH',
      'ACCESS_PUBLIC_KEY', 'SIGNATURE' 
    ];

    let address = '';
    // Get permissions
    let permissions: PermissionType[] = []
    try {
      permissions = await window.arweaveWallet.getPermissions()
    } catch (err) {
      console.error('arconnect', err)
      throw new Error('ArConnect: Error loading permissions ')
    }

    // Filter permissions
    const finalPermissions: PermissionType[] = [];
    for (let i = 0; i < customPermissions.length; i++) {
      if (permissions.indexOf(customPermissions[i]) < 0) {
        finalPermissions.push(customPermissions[i]);
      }
    }

    try {
      if (finalPermissions.length) {
        await window.arweaveWallet.connect(
          finalPermissions,
          this._appInfo,
          { 
            host: arweave.api.config.host!,
            port: +arweave.api.config.port!,
            protocol: arweave.api.config.protocol! as 'http'|'https'
          }
        )
      }
      address = await arweave.wallets.getAddress()
      
    } catch (error) {
      console.error('arconnect', error)
      throw new Error('ArConnect error address')
    }
    if (address) {
      this.setAccount(address, null, stayLoggedIn)
      this.method = 'arconnect'  
    }
    return address
  }

  async arweaveWebWallet(stayLoggedIn: boolean): Promise<string> {
    this._arweaveWebWallet.setUrl('arweave.app')
    let address = '';
    // If wallet is already connected
    if (this._arweaveWebWallet.connected &&
      this._arweaveWebWallet.address) {
      address = this._arweaveWebWallet.address;
      this.setAccount(address, null, stayLoggedIn)
      this.method = 'webwallet'
      return address;
    }
    // Else
    this._arweaveWebWallet.keepPopup = true
    try {
      address = await this._arweaveWebWallet.connect()
      this._arweaveWebWallet.keepPopup = false
      this.setAccount(address, null, stayLoggedIn)
      this.method = 'webwallet'
    } catch (error) {
      this._arweaveWebWallet.keepPopup = false
      console.error('arweavewallet', error)
      throw new Error('error arweavewallet')
    }
    return address

  }

  async finnie(stayLoggedIn: boolean, arweave: Arweave): Promise<string> {
    if (!window.arweaveWallet) {
      throw Error('Finnie Wallet not found!')
    }
    const address = await arweave.wallets.getAddress()
    this.setAccount(address, null, stayLoggedIn)
    this.method = 'finnie'
    return address
  }

  public hijackArweave(arweave: Arweave): void {
    // Replace sign
    arweave.transactions.sign = async (
      transaction: Transaction,
      // eslint-disable-next-line
      jwk?: JWKInterface | "use_wallet",
      // eslint-disable-next-line
      options?: SignatureOptions
    ): Promise<void> =>
    {
      await this._arweaveWebWallet.signTransaction(transaction)
    }
    // eslint-disable-next-line
    arweave.wallets.getAddress = async (jwk?: JWKInterface | "use_wallet"): Promise<string> =>
    {
      return this.mainAddress
    }
  }

  public loadSession(stayLoggedIn: boolean) : { method: string, address: string } {
    // Check storage 
    this._storage = window.sessionStorage
    if (stayLoggedIn) {
      this._storage = window.localStorage
    }
    let mainAddress = ''
    const mainAddressAsString = this._storage.getItem(this._cachedProperties[0])
    const keyAsString = this._storage.getItem(this._cachedProperties[1])
    let key = null
    const methodAsString = this._storage.getItem(this._cachedProperties[2])
    let method = ''

    if (keyAsString) {
      key = JSON.parse(keyAsString)
    }
    if (mainAddressAsString) {
      mainAddress = mainAddressAsString
    }
    if (methodAsString) {
      method = methodAsString
    }

    if (mainAddress) {
      this._mainAddress.value = mainAddress
      this._key = key
      this._method = method
      
    }
    return {method, address: mainAddress}
  }

  async logoutBridge() {
    this.removeAccountFromCache()
    this.mainAddress = ''
    this.key = null
    const api = new IFrameWalletBridge()
    if ((this.method === 'arconnect' || this.method === 'finnie')) {
      const res = await api.callAPI({
        method: 'disconnect'
      })
      if (res !== 'disconnected') {
        throw Error('Error on disconnect')
      }

    } else if (this.method === 'webwallet') {
      window.arweaveWallet.disconnect()
    }
    
    this.method = ''
  }

  async logout() {
    this.removeAccountFromCache()
    this.mainAddress = ''
    this.key = null
  
    if ((this.method === 'arconnect' || this.method === 'finnie') &&
        window.arweaveWallet) {
      try {
        await window.arweaveWallet.disconnect();
        console.log(this._method, 'Wallet disconnected');
      } catch (error) {
        console.error('wallet', error);
      }
    } else if (this.method === 'webwallet') {
      try {
        await this._arweaveWebWallet.disconnect();
        console.log(this.method, 'ArweaveWallet disconnected');
      } catch (error) {
        console.error('wallet', error);
      }
    }
    
    this.method = ''
  }

  public hijackArweavePostAPI(arweave: Arweave): void {
    const api = new IFrameWalletBridge()
    // Replace sign
    arweave.transactions.sign = async (
      transaction: Transaction,
      jwk?: JWKInterface | "use_wallet",
      options?: SignatureOptions
    ): Promise<void> =>
    {
      // eslint-disable-next-line
      const signedTransaction: any =  await api.callAPI({
        method: 'sign',
        data: {
          transaction,
          options
        }
      });

      // Validations:
      // Compare signed tx against cloned txs
      const signedOwner = await arweave.wallets.ownerToAddress(signedTransaction.owner)
      if (this.mainAddress !== signedOwner) {
        console.log(this.mainAddress, '!==', signedOwner)
        throw Error(`signedTransaction owner mismatches current address!`)
      }
      
      transaction.setSignature({
        id: signedTransaction.id,
        owner: signedTransaction.owner,
        reward: signedTransaction.reward,
        tags: signedTransaction.tags,
        signature: signedTransaction.signature,
      })
    }
    // eslint-disable-next-line
    arweave.wallets.getAddress = async (jwk?: JWKInterface | "use_wallet"): Promise<string> =>
    {
      return await api.callAPI({
        method: 'getAddress'
      })
    }
  }

  async finnieBridge(stayLoggedIn: boolean): Promise<string> {
    const api = new IFrameWalletBridge()
    const address = await api.callAPI({
      method: 'getAddress'
    })
    if (address) {
      this.setAccount(address, null, stayLoggedIn)
      this.method = 'finnie'
    }
    return address
  }

  async arConnectBridge(stayLoggedIn: boolean): Promise<string> {
    const api = new IFrameWalletBridge()
    const address = await api.callAPI({
      method: 'getAddress'
    })
    if (address) {
      this.setAccount(address, null, stayLoggedIn)
      this.method = 'arconnect'
    }
    return address
  }

  public async isBridgeActive(): Promise<boolean> {
    const api = new IFrameWalletBridge()
    return (
      await api.callAPI({
        method: 'startHandshake'
      }) === 'bridgeActive'
    )
  }

  public async getUserSigner(): Promise<InjectedArweaveSigner|null> {
    if (this.method === 'webwallet') {
      const userSigner = new InjectedArweaveSigner(
        this._arweaveWebWallet.namespaces.arweaveWallet
      );
      await userSigner.setPublicKey();
      return userSigner;
    } else if (this.method === 'arconnect') {
      const userSigner = new InjectedArweaveSigner(
        window.arweaveWallet
      );
      await userSigner.setPublicKey();
      return userSigner;
    }
    return null;
  }
}