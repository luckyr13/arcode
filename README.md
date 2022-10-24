<p align="center">
  <img src="https://arweave.net/GYuvaTZpyksPQxKGdjfl5jQJynaRmbMQSYXaylFAvRQ" style="max-width: 100%">
</p>

# ArCode Studio: Smartweave editor and deployer
ArCode Studio is an online IDE for smartweave contracts. As ArCode works on the browser all the files are saved in cache memory and removed when the cache is cleared.

**Smartweave contracts** are the Arweave **smart contracts**. You can learn more in the ArWiki: https://arwiki.wiki/#/en/smartweave

## Links
- ArCode Studio: https://arcode.studio
- ArCode Studio Gallery: https://arcode.studio/#/gallery
- Profit Sharing Community: https://community.xyz/#XFZxNNpgb043Doa7-4sra5dnbBB5RkOHRyQJ_YOzLAg
- GitHub pages backup: https://luckyr13.github.io/arcode
- Discord channel: https://discord.gg/KMjZkkWrSS
- Changelog: https://github.com/luckyr13/arcode/blob/master/CHANGELOG.md

## Current features
++ Workspace and File Explorer:
- Create, edit and store your JS and JSON files in ArCode with syntax highlighting from your browser.
- Other languages supported: python, rust and go.
- Create/edit/remove folders.
- Load contracts sources and state into the workspace directly from their Arweave TXs.
- Import/Export your workspace to .zip file.
- Publish your workspace to Arweave.
- ArCode Gallery: A public list of all the workspaces published in ArCode.

++ Arweave explorer
- Explore the Arweave Mainnet or a local gateway.
- Get detailed info about a particular Arweave tx.
- Get detailed info about a particular Arweave address.
- Advanced search (search by custom tags and tx owners).

++ Connect to ArCode using your favorite Arweave Wallet!
- Login methods supported: ArConnect, Arweave.app, Finnie Wallet and the old but always useful "using a key file" method.

++ Deploy contracts
- Deploy a contract from files in your ArCode Workspace.
- Deploy a contract with a new state from your Workspace using a previous Contract Source Tx.
- Deploy to the Arweave Mainnet or to a local gateway.

++ Interact with smartweave contracts
- View state.
- Write interaction (dry-run).
- Write interaction (Create and post tx).
- Interact with contracts on the Arweave Mainnet or to a local gateway.

++ Many themes for customize your IDE.


## Usage fees:
- Contract deployment/write interaction: 0.00001 AR
- VIP users: You can use this dApp for free having a minimum balance of 10000 $CODE tokens.

## Common ArCode Problems
Brave Browser and AdBlock users. Some users have reported issues when trying to connect with ArLocal on localhost (net::ERR_BLOCKED_BY_CLIENT). To solve this, please do the next steps:

- Navigate to: brave://adblock/
- Add the next filter:
- @@||localhost^$domain=arcode.studio

## ArCode Warranty Info
###  No Warranty
"As-Is". The Software is provided "as is," with all faults, defects, bugs, and errors.

## Project setup
If you want to run your own ArCode instance on localhost please install this dapp as an usual Vue app. 
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```
