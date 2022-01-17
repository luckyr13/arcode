import { ArweaveHandler } from './ArweaveHandler';
import { ArWallet } from 'redstone-smartweave';
import { ArweaveWebWallet } from 'arweave-wallet-connector';
 import{
  SignatureOptions,
} from "arweave/web/lib/crypto/crypto-interface";
import Transaction from "arweave/web//lib/transaction";
import { JWKInterface } from "arweave/web//lib/wallet";
import Arweave from 'arweave';

export class Login {
	private _arweave: ArweaveHandler;
	// User's private key
  private _key: ArWallet|null = null;
  private _storage: Storage;
  // User's arweave public address
  private _mainAddress = '';
  private _cachedProperties = ['MAINADDRESS', 'KEY', 'METHOD'];
  // ArweaveApp
  private _arweaveWebWallet: ArweaveWebWallet;
  private _method = '';

	constructor(stayLoggedIn= false, network=undefined) {
		this._arweave = new ArweaveHandler(network);
		// Check storage 
		this._storage = window.sessionStorage;
		if (stayLoggedIn) {
			this._storage = window.localStorage;
		}
		const mainAddress = this._storage.getItem(this._cachedProperties[0]);
		const key = JSON.parse(this._storage.getItem(this._cachedProperties[1])!);
		const method = this._storage.getItem(this._cachedProperties[2])!;

		this._arweaveWebWallet = new ArweaveWebWallet({
			name: 'ArweaveApp',
			logo: 'https://jfbeats.github.io/ArweaveWalletConnector/placeholder.svg'
		})
		
		if (mainAddress) {
			this._mainAddress = mainAddress;
			this._key = key;
			this._method = method;
			if (this._method === 'webwallet') {
				this._arweaveWebWallet.setUrl('arweave.app')
			}
		}

		
	}

	public get arweave(): ArweaveHandler {
		return this._arweave;
	}

	public get key(): ArWallet|null {
		return this._key ? this._key : 'use_wallet';
	}

	public set key(key: ArWallet|null) {
		this._key = key;
    this._storage.setItem(this._cachedProperties[1], JSON.stringify(this._key))
	}

	public get mainAddress() {
		return this._mainAddress;
	}


	public set mainAddress(address: string) {
		this._mainAddress = address;
		this._storage.setItem(this._cachedProperties[0], this._mainAddress);
	}

	public set method(method: string) {
		this._method = method;
		this._storage.setItem(this._cachedProperties[2], this._method);
	}

	public get method(): string {
		return this._method;
	}


  setAccount(mainAddress: string, arWallet: ArWallet|null = null, stayLoggedIn= false) {
    this._storage = stayLoggedIn ? window.localStorage : window.sessionStorage;
    this.mainAddress = mainAddress;

    if (arWallet) {
      this.key = arWallet;
    }
  }

  removeAccountFromCache() {
    for (const key of this._cachedProperties) {
      window.sessionStorage.removeItem(key)
      window.localStorage.removeItem(key)
    }
  }

  logout() {
    this.removeAccountFromCache();
    this.mainAddress = '';
		this.key = null;
		if ((this.method === 'arconnect' || this.method === 'finnie' || this.method === 'webwallet') &&
				window.arweaveWallet) {
			window.arweaveWallet.disconnect();
		}
		this.method = '';
	}

	uploadKeyFile(inputElement: HTMLInputElement, stayLoggedIn: boolean): Promise<string> {
		const p = new Promise<string>((resolve, reject) => {
			let address = '';
			const file = inputElement.files!.length ? 
				inputElement.files![0] : null;
			const freader = new FileReader();
			freader.onload = async () => {
				const key = JSON.parse(`${freader.result}`);
				try {
					address = await this._arweave.arweave.wallets.jwkToAddress(key);
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

  async arConnect(stayLoggedIn: boolean): Promise<string> {
		if (!window.arweaveWallet) {
			throw Error('ArConnect not found!');
		}
		const address = await this._arweave.arweave.wallets.getAddress();
		this.setAccount(address, null, stayLoggedIn);
		this.method = 'arconnect';
		return address;
  }

  async arweaveWebWallet(stayLoggedIn: boolean): Promise<string> {
		this._arweaveWebWallet.setUrl('arweave.app')
		const address = await this._arweaveWebWallet.connect();
		this.setAccount(address, null, stayLoggedIn);
		this.method = 'webwallet';
		return address;
  }

  async finnie(stayLoggedIn: boolean): Promise<string> {
		if (!window.arweaveWallet) {
			throw Error('Finnie Wallet not found!');
		}
		const address = await this._arweave.arweave.wallets.getAddress();
		this.setAccount(address, null, stayLoggedIn);
		this.method = 'finnie';
		return address;
  }

  public hijackArweave(arweave: Arweave) {
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
}