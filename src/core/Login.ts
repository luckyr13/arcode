import { ArweaveHandler } from './ArweaveHandler';
import { ArWallet } from 'redstone-smartweave';
 import{
  SignatureOptions,
} from "arweave/web/lib/crypto/crypto-interface";
import Transaction from "arweave/web/lib/transaction";
import { JWKInterface } from "arweave/web/lib/wallet";
import Arweave from 'arweave';
import { ArweaveWebWallet } from 'arweave-wallet-connector';
import { ref } from 'vue';
import { IFrameWalletBridge } from './IFrameWalletBridge';

export class Login {
  // User's private key
  private _key: ArWallet|null = null;
  private _storage: Storage;
  // User's arweave public address
  private _mainAddress = ref('');
  private _cachedProperties = ['MAINADDRESS', 'KEY', 'METHOD'];
  // ArweaveApp
  private _arweaveWebWallet: ArweaveWebWallet = new ArweaveWebWallet({
    name: 'Arcode Studio',
    logo: 'https://arweave.net/wJGdli6nMQKCyCdtCewn84ba9-WsJ80-GS-KtKdkCLg'
  })
  private _method = '';

  constructor() {
    this._storage = window.sessionStorage;
  }

  public get key(): ArWallet|null {
    return this._key ? this._key : 'use_wallet';
  }

  public set key(key: ArWallet|null) {
    this._key = key;
    this._storage.setItem(this._cachedProperties[1], JSON.stringify(this._key))
  }

  public get mainAddress() {
    return this._mainAddress.value;
  }


  public set mainAddress(address: string) {
    this._mainAddress.value = address;
    this._storage.setItem(this._cachedProperties[0], address);
  }

  public set method(method: string) {
    this._method = method;
    this._storage.setItem(this._cachedProperties[2], this._method);
  }

  public get method(): string {
    return this._method;
  }


  setAccount(mainAddress: string, arWallet: ArWallet|null = null, stayLoggedIn= false): void {
    this._storage = stayLoggedIn ? window.localStorage : window.sessionStorage;
    this.mainAddress = mainAddress;

    if (arWallet) {
      this.key = arWallet;
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
      let address = '';
      const file = inputElement.files!.length ? 
        inputElement.files![0] : null;
      const freader = new FileReader();
      freader.onload = async () => {
        const key = JSON.parse(`${freader.result}`);
        try {
          address = await arweave.wallets.jwkToAddress(key);
          this.setAccount(address, key, stayLoggedIn);
          this.method = 'keyfile';
          resolve(address);
        } catch (error) {
          reject(`Error loading key ${error}`);
        }
      };

      freader.onerror = () => {
        reject('Error reading file');
      }
      freader.readAsText(file!);
    });
  
    return p;
  }

  async arConnect(stayLoggedIn: boolean, arweave: Arweave): Promise<string> {
    if (!window.arweaveWallet) {
      throw Error('ArConnect not found!');
    }
    const address = await arweave.wallets.getAddress();
    this.setAccount(address, null, stayLoggedIn);
    this.method = 'arconnect';
    return address;
  }

  async arweaveWebWallet(stayLoggedIn: boolean, arweave: Arweave): Promise<string> {
    this._arweaveWebWallet.setUrl('arweave.app')
    const address = await this._arweaveWebWallet.connect();
    this.setAccount(address, null, stayLoggedIn);
    this.method = 'webwallet';
    return address;
  }

  async finnie(stayLoggedIn: boolean, arweave: Arweave): Promise<string> {
    if (!window.arweaveWallet) {
      throw Error('Finnie Wallet not found!');
    }
    const address = await arweave.wallets.getAddress();
    this.setAccount(address, null, stayLoggedIn);
    this.method = 'finnie';
    return address;
  }

  public hijackArweave(arweave: Arweave): void {
    // Replace sign
    arweave.transactions.sign = async (
      transaction: Transaction,
      jwk?: JWKInterface | "use_wallet",
      options?: SignatureOptions
    ): Promise<void> =>
    {
      await this._arweaveWebWallet.signTransaction(transaction);
    }

    arweave.wallets.getAddress = async (jwk?: JWKInterface | "use_wallet"): Promise<string> =>
    {
      return this.mainAddress;
    }
  }

  public loadSession(stayLoggedIn: boolean, arweave: Arweave) : void{// Check storage 
    this._storage = window.sessionStorage;
    if (stayLoggedIn) {
      this._storage = window.localStorage;
    }
    const mainAddress = this._storage.getItem(this._cachedProperties[0]);
    const key = JSON.parse(this._storage.getItem(this._cachedProperties[1])!);
    const method = this._storage.getItem(this._cachedProperties[2])!;

    if (mainAddress) {
      this._mainAddress.value = mainAddress;
      this._key = key;
      this._method = method;
      if (this._method === 'webwallet') {
        this.arweaveWebWallet(stayLoggedIn, arweave);
      }
    }
    console.log('Session data loaded ...');
  }

  async logoutBridge() {
    this.removeAccountFromCache();
    this.mainAddress = '';
    this.key = null;
    const api = new IFrameWalletBridge();
    if ((this.method === 'arconnect' || this.method === 'finnie')) {
      const res = await api.callAPI({
        method: 'disconnect'
      });
      if (res !== 'disconnected') {
        throw Error('Error on disconnect');
      }

    } else if (this.method === 'webwallet') {
      window.arweaveWallet.disconnect();
    }
    
    this.method = '';
  }

  async logout() {
    this.removeAccountFromCache();
    this.mainAddress = '';
    this.key = null;
  
    if ((this.method === 'arconnect' || this.method === 'finnie' || this.method === 'webwallet') &&
        window.arweaveWallet) {
      window.arweaveWallet.disconnect();
    }
    
    this.method = '';
  }

  public hijackArweavePostAPI(arweave: Arweave): void {
    const api = new IFrameWalletBridge();
    // Replace sign
    arweave.transactions.sign = async (
      transaction: Transaction,
      jwk?: JWKInterface | "use_wallet",
      options?: SignatureOptions
    ): Promise<void> =>
    {
      const txClone = { ...transaction };

      const signedTransaction: any =  await api.callAPI({
        method: 'sign',
        data: {
          transaction,
          options
        }
      });

      // Validations:
      // Compare signed tx against cloned txs
      const signedOwner = await arweave.wallets.ownerToAddress(signedTransaction.owner);
      if (this.mainAddress !== signedOwner) {
        console.log(this.mainAddress, '!==', signedOwner); 
        throw Error(`signedTransaction owner mismatches current address!`);
      }
      
      transaction.setSignature({
        id: signedTransaction.id,
        owner: signedTransaction.owner,
        reward: signedTransaction.reward,
        tags: signedTransaction.tags,
        signature: signedTransaction.signature,
      });
    }
    arweave.wallets.getAddress = async (jwk?: JWKInterface | "use_wallet"): Promise<string> =>
    {
      return await api.callAPI({
        method: 'getAddress'
      });
    }
  }

  async finnieBridge(stayLoggedIn: boolean, arweave: Arweave): Promise<string> {
    const api = new IFrameWalletBridge();
    const address = await api.callAPI({
      method: 'getAddress'
    });
    if (address) {
      this.setAccount(address, null, stayLoggedIn);
      this.method = 'finnie';
    }
    return address;
  }

  async arConnectBridge(stayLoggedIn: boolean, arweave: Arweave): Promise<string> {
    const api = new IFrameWalletBridge();
    const address = await api.callAPI({
      method: 'getAddress'
    });
    if (address) {
      this.setAccount(address, null, stayLoggedIn);
      this.method = 'arconnect';
    }
    return address;
  }

  public async isBridgeActive(): Promise<boolean> {
    const api = new IFrameWalletBridge();
    return (
      await api.callAPI({
        method: 'startHandshake'
      }) === 'bridgeActive'
    );
  }
}