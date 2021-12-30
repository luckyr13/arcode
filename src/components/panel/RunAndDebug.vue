<template>
<div class="arcode-main-toolbar-panel-title">
	Run and Debug
</div>
<div class="run-container" v-if="mainAddress && !contractInteractionTX">
	<div class="form-input">
		<label>Contract Address</label>
		<input 
			:disabled="loadingTX"
			type="text" v-model.trim="txtContract">
	</div>
	<div class="form-input">
		<label>Function</label>
		<input 
			:disabled="loadingTX"
			type="text" v-model.trim="txtFunction">
	</div>
	<div class="form-input">
		<label>Wallet</label>
		<input type="text" disabled v-model.trim="mainAddress">
	</div>
	<ul class="run-menu">
		<li>
			<button
				:class="{primary: (txtContract && txtFunction) && !loadingTX}" 
				:disabled="(!txtContract || !txtFunction) || loadingTX"
				@click="runInteraction(txtContract, txtFunction)">
				<Icon class="icon-btn" icon="codicon-debug-alt" /><span>Run Interaction</span>
			</button>
		</li>
	</ul>
	<h5>Results:</h5>
	<p 
		class="no-results"
		v-if="!response && !loadingTX">
		No results.
	</p>
	<p 
		class="no-results text-center"
		v-if="loadingTX">
		Loading ...
	</p>
</div>
<div class="run-container" v-else-if="!mainAddress">
	<Icon class="icon-run-panel" icon="codicon-lock" />
	<p class="text-center">Please login first!</p>
</div>
<div class="run-container" v-else-if="contractInteractionTX">
	<Icon class="icon-run-panel success" icon="codicon-check" />
	<h3>TX created successfully!</h3>
	<p class="text-center">TX: {{ contractInteractionTX }}</p>
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

const txtContract = ref('');
const txtFunction = ref('');
const response = ref('');
const contractInteractionTX = ref('');
const loadingTX = ref(false);
const props = defineProps({
	workspace: Object
});
const runInteraction = async (contract: string) => {
	loadingTX.value = true;
	try {
		alert(contract);
	} catch (err) {
		createToast(`${err}`,
    {
      type: 'danger',
      showIcon: true,
      position: 'bottom-right',
    });
	}
	loadingTX.value = false;
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

.run-container {
	padding: 10px;
}
.run-menu {
	padding: 0px;
	margin-top: 0px;
	margin-bottom: 0px;
}
.run-menu li {
	padding: 0px;
	height: 36px;
	list-style: none;
	text-align: center;
	margin-top: 10px;
}

.run-menu li button {
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

.run-menu li button.primary {
	background-color: var(--app-toolbar-panel-title-bgcolor);
  color: var(--app-toolbar-panel-title-color);
  cursor: pointer;
}

.run-menu li button span {
	font-size: 12px;
	margin-left: 6px;
	line-height: 14px;

}

.run-menu li button:hover {
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

.icon-run-panel {
	margin-top: 20px;
	margin-bottom: 20px;
	font-size: 36px !important;
}

.success {
	color: #58EB2B;
}

.no-results {
	font-size: 12px;
}

</style>