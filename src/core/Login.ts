import { ArweaveHandler } from './ArweaveHandler';
import { ArWallet } from 'redstone-smartweave';

export class Login {
	private _arweave: ArweaveHandler;
	// User's private key
  private _key: ArWallet|null = null;
  private _storage: Storage;
  // User's arweave public address
  private _mainAddress = '';
  private _cachedProperties = ['MAINADDRESS', 'KEY'];

	constructor(stayLoggedIn= false) {
		this._arweave = new ArweaveHandler();
		// Check storage 
		this._storage = window.sessionStorage;
		if (stayLoggedIn) {
			this._storage = window.localStorage;
		}
		const mainAddress = this._storage.getItem(this._cachedProperties[0]);
		const key = JSON.parse(this._storage.getItem(this._cachedProperties[1])!);
		
		if (mainAddress) {
			this._mainAddress = mainAddress;
			this._key = key;
		}

	}

	public get key(): ArWallet|null {
		return this._key;
	}

	public set key(key: ArWallet|null) {
    this._storage.setItem(this._cachedProperties[1], JSON.stringify(this.key))
		this._key = key;
	}

	public get mainAddress() {
		return this._mainAddress;
	}


	public set mainAddress(address: string) {
		this._mainAddress = address;
		this._storage.setItem(this._cachedProperties[0], this._mainAddress);
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

  async login(
		walletOption: string, 
		uploadInputEvent: HTMLInputElement|null = null,
		stayLoggedIn = false): Promise<string> {
		let res = '';

    switch (walletOption) {
      case 'upload_file':
        res = await this.uploadKeyFile(uploadInputEvent!, stayLoggedIn)
      break;
      case 'arconnect':
        
      break;
      case 'arweaveApp':
        
      break;

      default:
        throw Error('Wallet not supported');
      break;
    }

    return res;
  }

  logout() {
    this.removeAccountFromCache();
    this.mainAddress = '';
		this.key = null;
	}

	async uploadKeyFile(inputElement: HTMLInputElement, stayLoggedIn: boolean): Promise<string> {
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


}