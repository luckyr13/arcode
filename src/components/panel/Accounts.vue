<template>
<div class="arcode-main-toolbar-panel-title">
	Wallet manager
</div>
<div v-if="login" class="accounts-container">
	<div v-if="!mainAddress">
		<h4>Login options:</h4>
		<ul class="accounts-menu">
			<li>
				<button @click="arConnect(chkStayLoggedIn)">
					<img src="@/assets/img/arconnect.png"><span>ArConnect</span>
				</button>
			</li>
			<li>
				<button @click="arweaveWebWallet(chkStayLoggedIn)">
					<img class="logo" src="@/assets/img/logo.png"><span>Arweave.app</span>
				</button>
			</li>
			<li>
				<button @click="finnie(chkStayLoggedIn)">
					<img src="@/assets/img/koi.png"><span>Finnie Wallet</span>
				</button>
			</li>
			<li>
				<button @click="uploadKeyTrigger()">
					<Icon class="icon-menu-btn" icon="codicon-folder-opened" />
						<span>Upload your keyfile</span>
					</button>
				<input
					class="hidden"
					id="txtFile_uploadKey"
					accept=".json,application/json" 
					type="file"
					@change="uploadKey($event, chkStayLoggedIn)">
			</li>
		</ul>
		<div class="text-right form-radio">
			<label class="">
				<input 
					v-model.trim="chkStayLoggedIn" 
					type="checkbox"> Stay Logged In
			</label>
		</div>
	</div>
	<div v-else>
		<h4>Wallet Address</h4>
		<p class="address">{{ mainAddress }}</p>
		<h4>Balance</h4>
		<p class="text-center">{{ pstBalance }} $CODE</p>
		<p class="text-center">{{ balance }} AR</p>
		<h4>Method</h4>
		<p>{{ method }}</p>
		<br>
		<ul class="accounts-menu">
			<li class="text-center">
				<button class="primary" @click="logout()">
					<Icon class="icon-btn" icon="codicon-sign-out" /><span>Logout</span>
				</button>
			</li>
		</ul>
	</div>
	
</div>
</template>

<script setup lang="ts">
import { createToast } from 'mosha-vue-toastify';
import { ref, onMounted, watchEffect, computed } from 'vue';
import { UserSettings } from '@/core/UserSettings';
import Icon from '@/components/atomic/Icon';
import { ArweaveHandler } from '@/core/ArweaveHandler';

const props = defineProps({
	iframe: Boolean,
	tokenState: Object,
	login: Object
});
const arweave = new ArweaveHandler();
const userSettings = new UserSettings();
const settings = userSettings.settings;
const mainAddress = ref('');
const method = ref('');
const chkStayLoggedIn = ref(settings.stayLoggedIn);
const uploadKeyTrigger = () => {
	const txtFile_uploadKey = document.getElementById('txtFile_uploadKey');
	if (txtFile_uploadKey) {
		txtFile_uploadKey.click();
	}
};

const uploadKey = async (event: Event, stayLoggedIn: boolean) => {
	try {
		const address = await props.login.uploadKeyFile(event.target, stayLoggedIn, arweave.arweave);
		if (address) {
			mainAddress.value = address;
			method.value = props.login.method;
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

const arConnect = async (stayLoggedIn: boolean) => {
	try {
		let address = '';
		if (props.iframe) {
			address = await props.login.arConnectBridge(stayLoggedIn, arweave.arweave);
		} else {
			address = await props.login.arConnect(stayLoggedIn, arweave.arweave);
		}
		if (address) {
			mainAddress.value = address;
			method.value = props.login.method;
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

const finnie = async (stayLoggedIn: boolean) => {
	try {
		let address = '';
		if (props.iframe) {
			address = await props.login.finnieBridge(stayLoggedIn, arweave.arweave);
		} else {
			address = await props.login.finnie(stayLoggedIn, arweave.arweave);
		}

		if (address) {
			mainAddress.value = address;
			method.value = props.login.method;
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


const arweaveWebWallet = async (stayLoggedIn: boolean) => {
	try {
		const address = await props.login.arweaveWebWallet(stayLoggedIn, arweave.arweave);
		if (address) {
			mainAddress.value = address;
			method.value = props.login.method;
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
	await props.login.logout(props.iframe);
	mainAddress.value = '';
	method.value = '';
};

onMounted(() => {
	mainAddress.value = props.login.mainAddress;
	method.value = props.login.method;

	// Fix iframe wallet communication
	if (props.iframe) {
		props.login.hijackArweavePostAPI(arweave.arweave);
	}

});
watchEffect(async () => {
	userSettings.setStayLoggedIn(chkStayLoggedIn.value);
	if (mainAddress.value) {
		balance.value = 0;
		try {
			balance.value = await arweave.arweave.wallets.getBalance(mainAddress.value);
			balance.value = arweave.arweave.ar.winstonToAr(balance.value);
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
const pstBalance = computed(() => {
	const balances = props.tokenState.balances ? props.tokenState.balances : {};
	const res = Object.prototype.hasOwnProperty.call(balances, mainAddress.value) ? 
		parseInt(props.tokenState.balances[mainAddress.value]) : 0;
	return res;
});
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
</style>