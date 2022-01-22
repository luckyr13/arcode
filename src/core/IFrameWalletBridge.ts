import Arweave from 'arweave';
declare const window: any;

export class IFrameWalletBridge {
	private _validOriginList: string[];

	constructor() {
		this._validOriginList = [
			'http://localhost',
			'https://scanner.redstone.tools',
			'https://arweave.app'
		];
	}

	start() {
		if (window && window.self !== window.top) {
			// Notify parent window that ArCode is loaded
      window.top.postMessage({ event: 'arCodeLoaded' }, '*');

      // Listen for incoming messages
      window.addEventListener("message", (event: MessageEvent) => {
				const origin = event.origin;
				const data = event.data;

				// Do we trust the sender of this message?
				if (this._validOriginList.indexOf(origin) < 0) {
					return;
				}

        // Handle app request
        if (data.function === 'appLoaded') {
					console.log('App loaded: ', data.payload)
					this.callAPI({ response: 'Bridge stablished!' })
        }

      }, false);

      console.log('IFrame detected ...');
      return true;
    }

    return false;
	}

	callAPI(payload: Record<string, any>): Promise<string> {
		const res = new Promise<string>((resolve, reject) => {
			// 1. Send request
			window.top.postMessage({ payload, event: 'arcodeAction' }, '*');

			// 2. Listen for incoming messages
			window.addEventListener("message", (event: MessageEvent) => {
				const origin = event.origin;
				const data = event.data;

				// Do we trust the sender of this message?
				if (this._validOriginList.indexOf(origin) < 0) {
					return;
				}

				// 3. Handle app response
				if (data.function === 'address') {
					console.log(`address: ${data.payload}`)
					resolve(data.payload);
				} else if (data.function === 'disconnected') {
					console.log(`Wallet disconnected!`)
					resolve('disconnected');
				}

				reject('Function not found');

			}, false);

			return '';
		});

		return res;
	}



}