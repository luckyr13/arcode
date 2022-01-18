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
      window.top.postMessage({ message: 'arCodeLoaded' }, '*');

      // Listen for incoming messages
      window.addEventListener("message", (event: MessageEvent) => {
				const origin = event.origin;
				const data = event.data;

				// Do we trust the sender of this message?
				if (this._validOriginList.indexOf(origin) < 0) {
					return;
				}

        // TODO
        if (data.function === 'saludar') {
					console.log('Payload: ', data.payload)
        }


      }, false);

      console.log('IFrame detected ...');
      return true;
    }

    return false;
	}
}