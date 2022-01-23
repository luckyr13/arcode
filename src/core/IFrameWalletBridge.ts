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
			console.log('IFrame detected ...');
			return true;
    }

    return false;
	}

	callAPI(payload: Record<string, any>): Promise<string> {
		if ( !(window && window.self !== window.top) ) {
			throw Error('ArCode is not inside an iframe :)');
		}
		const res = new Promise<string>((resolve, reject) => {
			// 1. Send request
			const reqId = Math.round(Math.random() * 100000);
			window.top.postMessage({ payload, event: 'arcodeAction', id: reqId }, '*');

			// Add a timeout for api call
			const ms = 900000;
			const timeout = window.setTimeout(() => {
				// Remove window listener
				window.removeEventListener("message", listenerFunction, true);
				console.error('Bridge timeout!');
				reject(`Bridge Timeout exceeded!`);
			}, ms);

			const listenerFunction = (event: MessageEvent) => {
				const origin = event.origin;
				const data = event.data;

				// Do we trust the sender of this message?
				if (this._validOriginList.indexOf(origin) < 0) {
					console.error(`Untrusted origin: ${origin}`);
					return;
				}
				// Validate nonce
				else if (data.id !== reqId ) {
					console.error(`Nonce error: ${data.id} !== ${reqId}`);
					return;
				}

				// Clear timeout on success
				window.clearTimeout(timeout);
				// Remove window listener
				window.removeEventListener("message", listenerFunction, true);

				// 3. Handle app response
				if (data.function === 'address') {
					console.log(`address: ${data.payload}`)
					resolve(data.payload);
				} else if (data.function === 'disconnected') {
					console.log(`Wallet disconnected!`)
					resolve('disconnected');
				} else if (data.function === 'handshake') {
					console.log(`Connection established! [${data.payload}]`);
					resolve(data.payload);
				} else if (data.function === 'signedTransaction') {
					console.log(`Tx signed!`);
					resolve(data.payload);
				} else if (data.function === 'error') {
					console.log(`Bridge error: ${data.payload}`);
					reject(`Bridge error: ${data.payload}`);
				}

				reject('Function not found');
			};

			// 2. Listen for incoming responses messages
			window.addEventListener("message", listenerFunction, true);

		});

		return res;
	}


}