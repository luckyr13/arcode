<template>
<div class="arcode-main-toolbar-panel-title">
	Wallet manager
</div>
<div v-if="login" class="accounts-container">
	<div v-if="!mainAddress">
		<h4>Login options:</h4>
		<ul class="accounts-menu">
			<li>
				<button @click="arweaveWebWallet(chkStayLoggedIn)">
					<img class="logo" src="@/assets/img/logo.png"><span>Arweave.app</span>
				</button>
			</li>
			<li>
				<button :disabled="iframe && !isBridgeActive" @click="arConnect(chkStayLoggedIn)">
					<img src="@/assets/img/arconnect.png"><span>ArConnect</span>
				</button>
			</li>
			<!-- Deprecated
			<li>
				<button @click="uploadKeyTrigger()">
					<DefaultIcon class="icon-menu-btn" icon="codicon-folder-opened" />
						<span>Upload your keyfile</span>
					</button>
				<input
					class="hidden"
					id="txtFile_uploadKey"
					accept=".json,application/json" 
					type="file"
					@change="uploadKey($event, chkStayLoggedIn)">
			</li>
			-->
		</ul>
		<div class="text-right form-radio" v-if="!iframe">
			<label class="">
				<input 
					v-model.trim="chkStayLoggedIn" 
					type="checkbox"> Stay Logged In
			</label>
		</div>
	</div>
	<div v-else>
		<h2>Wallet Address</h2>
		<p class="address">
			<ArweaveAddress
				:address="mainAddress"
				:isAddress="true"
				:showProfileImage="true"
				:showHandleInAddress="true"
				:showHandleOnly="true"
				:showLinks="false">
			</ArweaveAddress>
		</p>
		<p class="address">
			{{ mainAddress }}
		</p>
		<h2>Balance</h2>
		<p>
			<strong>Network: </strong>
			<span :class="{ mainnet: arweaveWrapper.onMainnet(), other: !arweaveWrapper.onMainnet()}">
				{{ selNetwork }}
			</span>
		</p>
		<p class="text-center balance">{{ balance }} <span>AR</span></p>
		<h4>Method</h4>
		<p>{{ method }}</p>
		<br>
		<ul class="accounts-menu">
			<li class="text-center">
				<button class="primary" @click="openLink('https://arprofile.org')">
					<DefaultIcon class="icon-btn" icon="codicon-account" /><span>Edit Profile</span>
				</button>
			</li>
			<li class="text-center">
				<button class="primary" @click="logout()">
					<DefaultIcon class="icon-btn" icon="codicon-sign-out" /><span>Logout</span>
				</button>
			</li>
		</ul>
	</div>
	
</div>
</template>

<script setup lang="ts">
import { createToast } from 'mosha-vue-toastify';
import { ref, onMounted, watchEffect } from 'vue';
import { UserSettings } from '@/core/UserSettings';
import DefaultIcon from '@/components/atomic/DefaultIcon';
import { ArweaveWrapper, defaultNetwork } from '@/core/ArweaveWrapper';
import ArweaveAddress from '@/components/atomic/ArweaveAddress.vue'

const props = defineProps({
	iframe: Boolean,
	tokenState: Object,
	login: Object,
	networkParam: String
});
const userSettings = new UserSettings();
const settings = userSettings.settings;
const mainAddress = ref('');
const method = ref('');
const chkStayLoggedIn = ref(settings.stayLoggedIn);
/*
const uploadKeyTrigger = () => {
	const txtFile_uploadKey = document.getElementById('txtFile_uploadKey');
	if (txtFile_uploadKey) {
		txtFile_uploadKey.click();
	}
};
*/
const isBridgeActive = ref(false)
const defaultSelNetwork = props.networkParam ? props.networkParam : defaultNetwork
const selNetwork = ref(defaultSelNetwork)
const arweaveWrapper = new ArweaveWrapper(selNetwork.value)
const arweave = arweaveWrapper.arweave

/*
const uploadKey = async (event: Event, stayLoggedIn: boolean) => {
	try {
		const address = await props.login.uploadKeyFile(event.target, stayLoggedIn, arweave)
		if (address) {
			mainAddress.value = address
			method.value = props.login.method
		} else {
			throw Error('Error reading wallet address')
		}
	} catch (err) {
		createToast(`${err}`,
      {
        type: 'danger',
        showIcon: true,
        position: 'bottom-right',
      });
	}
};
*/

const arConnect = async (stayLoggedIn: boolean) => {
	try {
		let address = '';
		if (props.iframe) {
			address = await props.login.arConnectBridge(stayLoggedIn)
		} else {
			address = await props.login.arConnect(stayLoggedIn, arweave)
		}
		if (address) {
			mainAddress.value = address
			method.value = props.login.method
		} else {
			throw Error('Error reading wallet address')
		}
	} catch (err) {
		createToast(`${err}`,
      {
        type: 'danger',
        showIcon: true,
        position: 'bottom-right',
      });
	}
};

const arweaveWebWallet = async (stayLoggedIn: boolean) => {
	try {
		const address = await props.login.arweaveWebWallet(stayLoggedIn)
		if (address) {
			mainAddress.value = address
			method.value = props.login.method
		} else {
			throw Error('Error reading wallet address');
		}
		
	} catch (err) {
		createToast(`${err}`,
      {
        type: 'danger',
        showIcon: true,
        position: 'bottom-right',
      });
	}
};

const logout = async () => {
	try {
		if (props.iframe) {
			await props.login.logoutBridge()
		} else {
			await props.login.logout()
		}
		mainAddress.value = '';
		method.value = '';
	} catch (err) {
		createToast(`${err}`,
      {
        type: 'danger',
        showIcon: true,
        position: 'bottom-right',
      });
	}
};

onMounted(async () => {
	mainAddress.value = props.login.mainAddress
	method.value = props.login.method
	isBridgeActive.value = false;

	// Fix iframe wallet communication
	if (props.iframe) {
		// Start handshake with parent 
		try {
			isBridgeActive.value = await props.login.isBridgeActive();

		} catch (err) {
			createToast(`${err}`,
			{
				type: 'danger',
				showIcon: true,
				position: 'bottom-right',
			});
		}
	}

});
watchEffect(async () => {
	userSettings.setStayLoggedIn(chkStayLoggedIn.value)
	if (mainAddress.value) {
		balance.value = 0;
		try {
			const walletBalance = await arweave.wallets.getBalance(mainAddress.value)
			if (walletBalance) {
				balance.value = arweave.ar.winstonToAr(walletBalance)
			}
			
		} catch (err) {
			createToast(`${err}`,
			{
				type: 'danger',
				showIcon: true,
				position: 'bottom-right',
			});
		}
	}
});

function openLink(url) {
	window.open(url, '_blank')
}
const balance = ref('0');

</script>

<style scoped lang="scss">
.arcode-main-toolbar-panel-title {
	height: 28px;
	line-height: 28px;
	font-size: 12px;
	padding-left: 20px;
}
.accounts-container {
	padding: 20px;
	font-size: 12px;
}
.accounts-menu {
	padding: 0px;
	margin-top: 0px;
}
.accounts-menu li {
	padding: 0px;
	height: 32px;
	list-style: none;
	margin-bottom: 12px;
}
.accounts-menu li button {
	width: 100%;
	height: 100%;
	line-height: 12px;
	border: 0;
	cursor: pointer;
	text-align: left;
	font-size: 12px;
	background-color: inherit;
	color: inherit;
}

.accounts-menu li button:disabled,
.accounts-menu li button[disabled],
 {
	color: gray;
	cursor: default;
}

.accounts-menu li button:hover {
	width: 100%;
	height: 100%;
	line-height: 12px;
	background-color: rgba(0,0,0,0.3);
}

.accounts-menu li button.primary {
	background-color: var(--app-toolbar-panel-title-bgcolor);
  color: var(--app-toolbar-panel-title-color);
  cursor: pointer;
  width: 100px;
}

.accounts-menu li button span {
	font-size: 12px;
	margin-left: 6px;
	line-height: 30px;
}

.accounts-menu li button img {
  width: 26px;
	float: left;
}

.close-icon {
	float: right;
	cursor: pointer;
	line-height: 12px;
}
.hidden {
	display: none;
}
.form-radio {
	padding: 10px;
}
.form-radio label {
	font-size: 12px;
	margin-bottom: 4px;
	display: block;
}
.form-radio input
 {
	padding: 12px;
	border-radius: 4px;
	border: 1px solid var(--app-background-color);
	background: inherit;
	color: inherit;
}
.icon-btn {
	display: inline !important;
	float: right;
	padding: 6px 0;
}
.icon-menu-btn {
	display: inline !important;
	line-height: 16px;
	font-size: 16px !important;
	float: left;
	padding: 6px 0;
	margin-left: 4px;
	margin-right: 4px;
}

.accounts-container .logo {
 -webkit-filter: Invert(var(--app-invert-img));
  filter: Invert(var(--app-invert-img));
  width: 22px;
  margin-right: 2px;
  margin-top: 2px;
  margin-left: 2px;
}


.address {
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: " [..]";
}

.mainnet {
	color: var(--color-neon-green);
}

.other {
	color: var(--color-neon-pink);
}

.balance {
	font-size: 18px;
}

.balance span {
	font-size: 12px;
}
</style>