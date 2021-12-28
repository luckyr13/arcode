<template>
<div class="arcode-main-toolbar-panel-title">
	Deploy contract
</div>
<div class="deploy-container" v-if="mainAddress && !deployedContractTX">
	<div class="form-input">
		<label>Contract</label>
		<select v-model.trim="selDeployFileContractLocation">
			<template v-for="path of workspace.getFileTreeFilenames()" :key="path">
				<option v-if="path && path.search(/.js$/) >= 0" :value="path">{{ path }}</option>
			</template>
		</select>
	</div>
	<div class="form-input">
		<label>Contract State</label>
		<select v-model.trim="selDeployFileStateLocation">
			<template v-for="path of workspace.getFileTreeFilenames()" :key="path">
				<option v-if="path && path.search(/.json$/) >= 0" :value="path">{{ path }}</option>
			</template>
		</select>
	</div>
	<div class="form-input">
		<label>Wallet</label>
		<input type="text" disabled v-model.trim="mainAddress">
	</div>
	<ul class="deploy-menu">
		<li>
			<button
				:class="{primary: (selDeployFileStateLocation && selDeployFileContractLocation) && !loadingDeployContract}" 
				:disabled="(!selDeployFileStateLocation || !selDeployFileContractLocation) || loadingDeployContract"
				@click="deployContract(selDeployFileStateLocation, selDeployFileContractLocation, workspace)">
				<Icon class="icon-btn" icon="codicon-rocket" /><span>Deploy Now</span>
			</button>
		</li>
	</ul>
</div>
<div class="deploy-container" v-else-if="!mainAddress">
	<Icon class="icon-deploy-login" icon="codicon-lock" />
	<p class="text-center">Please login first!</p>
</div>
<div class="deploy-container" v-else-if="deployedContractTX">
	<Icon class="icon-deploy-login success" icon="codicon-check" />
	<h3>Contract deployed successfully!</h3>
	<p class="text-center">TX: {{ deployedContractTX }}</p>
</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Icon from '@/components/atomic/Icon';
import { Login } from '@/core/Login';
import { UserSettings } from '@/core/UserSettings';
import { ArweaveHandler } from '@/core/ArweaveHandler';
import { 
  ContractData, ArWallet
 } from 'redstone-smartweave';
import { createToast } from 'mosha-vue-toastify';
import { Workspace } from '@/components/composed/Workspace'

const userSettings = new UserSettings();
const settings = userSettings.settings;
const mainAddress = ref('');
const login = new Login(settings.stayLoggedIn);
const arweave = new ArweaveHandler();

const selDeployFileContractLocation = ref('');
const selDeployFileStateLocation = ref('');
const deployedContractTX = ref('');
const loadingDeployContract = ref(false);
const props = defineProps({
	workspace: Object
});
const deployContract = async (statePath: string, contractSrcPath: string, workspace: Workspace) => {
	let contractSrc = ``;
	let initStateSrc = ``;
	loadingDeployContract.value = true;
	try {
		if (login.method === 'webwallet') {
			throw Error('Coming soon ...')
		}
		const stateName2 = statePath.split('/')[statePath.split('/').length - 1];
		const statePath2 = statePath.split('/').splice(0, statePath.split('/').length - 1).join('/');
		const stateFileId = workspace.findFileIdByName(statePath2, stateName2);
		const iState = workspace.editors.findIndex(ed => ed.id == stateFileId);
	
		const contractName2 = contractSrcPath.split('/')[contractSrcPath.split('/').length - 1];
		const contractPath2 = contractSrcPath.split('/').splice(0, contractSrcPath.split('/').length - 1).join('/');
		const contractFileId = workspace.findFileIdByName(contractPath2, contractName2);
		const iContract = workspace.editors.findIndex(ed => ed.id == contractFileId);
		
		const wallet: ArWallet = login.key;
		
		if (iState < 0 || iContract < 0) {
			throw Error(`Invalid state or contract id ${iState} ${iContract}`);
		}
		contractSrc = workspace.editors[iContract].view.state.doc.toString();
		initStateSrc = workspace.editors[iState].view.state.doc.toString();
			
		const contract: ContractData = {
			wallet: wallet,
			initState: initStateSrc,
			src: contractSrc
		};
		
		
		const tx = await arweave.createContract(contract);
		
		if (tx) {
			deployedContractTX.value = tx;
		} else {
			throw Error('Error creating tx', tx);
		}
		
		
	} catch (err) {
		createToast(`${err}`,
    {
      type: 'danger',
      showIcon: true,
      position: 'bottom-right',
    });
	}
	

	loadingDeployContract.value = false;
};

onMounted(() => {
	mainAddress.value = login.mainAddress;
});

</script>

<style scoped lang="scss">
.arcode-main-toolbar-panel-title {
	height: 28px;
	line-height: 28px;
	font-size: 12px;
	padding-left: 20px;
}

.deploy-container {
	padding: 10px;
	font-size: 12px;
}
.deploy-menu {
	padding: 0px;
	margin-top: 0px;
	margin-bottom: 0px;
}
.deploy-menu li {
	padding: 0px;
	height: 36px;
	list-style: none;
	text-align: center;
	margin-top: 10px;
}

.deploy-menu li button {
	width: 70%;
	height: 100%;
	line-height: 12px;
	border: 0;
	cursor: pointer;
	font-size: 12px;
	text-align: center;
  vertical-align: middle;
	color: gray;
	cursor: default;
	background-color: rgba(0,0,0,0.1);
}

.deploy-menu li button.primary {
	background-color: var(--app-toolbar-panel-title-bgcolor);
  color: var(--app-toolbar-panel-title-color);
  cursor: pointer;
}

.deploy-menu li button span {
	font-size: 12px;
	margin-left: 6px;
	line-height: 14px;

}

.deploy-menu li button:hover {
	background-color: rgba(0,0,0,0.3);
}


.form-input {
	padding: 10px;
}
.form-input input,
.form-input select
 {
	width: 100%;
	padding: 6px;
	border-radius: 4px;
	border: 1px solid var(--app-background-color);
	background: inherit;
	color: inherit;
}
.form-input option
 {
	width: 100%;
	padding: 6px;
	border-radius: 4px;
	border: 1px solid var(--app-background-color);
	background: inherit;
	color: #000;
}

.form-input label {
	font-size: 12px;
	margin-bottom: 4px;
	display: block;
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
}

.icon-deploy-login {
	margin-top: 20px;
	margin-bottom: 20px;
	font-size: 36px !important;
}

.success {
	color: #58EB2B;
}

</style>