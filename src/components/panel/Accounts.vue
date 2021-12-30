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
		<p>Welcome {{ mainAddress }}</p>
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
import { Login } from '@/core/Login';
import { createToast } from 'mosha-vue-toastify';
import { ref, onMounted, watchEffect } from 'vue';
import { UserSettings } from '@/core/UserSettings';
import Icon from '@/components/atomic/Icon';

const userSettings = new UserSettings();
const settings = userSettings.settings;
const mainAddress = ref('');
const login = new Login(settings.stayLoggedIn);
const chkStayLoggedIn = ref(settings.stayLoggedIn);
const uploadKeyTrigger = () => {
	const txtFile_uploadKey = document.getElementById('txtFile_uploadKey');
	if (txtFile_uploadKey) {
		txtFile_uploadKey.click();
	}
};

const uploadKey = async (event: Event, stayLoggedIn: boolean) => {
	try {
		const address = await login.uploadKeyFile(event.target, stayLoggedIn);
		mainAddress.value = address;
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
		const address = await login.arConnect(stayLoggedIn);
		mainAddress.value = address;
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
		const address = await login.finnie(stayLoggedIn);
		mainAddress.value = address;
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
		const address = await login.arweaveWebWallet(stayLoggedIn);
		mainAddress.value = address;
	} catch (err) {
		createToast(`${err}`,
      {
        type: 'danger',
        showIcon: true,
        position: 'bottom-right',
      });
	}
};

const logout = () => {
	login.logout();
	mainAddress.value = '';
};

onMounted(() => {
	mainAddress.value = login.mainAddress;
});
watchEffect(() => {
	userSettings.setStayLoggedIn(chkStayLoggedIn.value);
})

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
	margin-bottom: 0px;
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
	line-height: 12px;
	font-size: 12px;
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
</style>