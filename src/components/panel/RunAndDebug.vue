<template>
<div class="arcode-main-toolbar-panel-title">
	Run and Debug
</div>
<div class="run-container" v-if="mainAddress">
	<div class="form-input">
		<label>Wallet</label>
		<input type="text" disabled :value="mainAddress">
	</div>
	<div class="form-input">
		<label>Network</label>
		<select 
			:disabled="loadingTX" 
			v-model.trim="selNetwork">
			<option v-for="(nItem, nIndex) in networks" v-bind:key="nIndex" :value="nIndex">{{ nItem.host }} ({{ nIndex }})</option>
		</select>
	</div>
	<div class="form-input">
		<label>Contract Address</label>
		<input 
			:disabled="loadingTX"
			type="text" v-model.trim="txtContract">
		<div class="text-right">
			<a v-if="tx" class="link" @click="txtContract = tx">Use TX from URL</a>
		</div>
	</div>
	<h5 class="title-data">Input Data</h5>
	<p class="no-results" v-if="!inputList.length">No input data.</p>
	<div class="form-radio-linear">
		<label>
			<input 
				type="radio" 
				:disabled="loadingTX" 
				name="inputDataType" value="input" v-model.trim="rdInputDataType">
			Input fields
		</label>
		<label>
			<input 
				type="radio" 
				:disabled="loadingTX" 
				name="inputDataType" value="json" v-model.trim="rdInputDataType">
			Raw json
		</label>
	</div>
	<div v-if="rdInputDataType === 'input'" >	
		<div class="data-input-list" v-for="(iL, index) of inputList" :key="index">
			<div class="form-input col-key">
				<label>Key</label>
				<input 
					:disabled="loadingTX"
					type="text" v-model.trim="iL.key">
			</div>
			<div class="form-input col-value">
				<label>Value</label>
				<input 
					:disabled="loadingTX"
					type="text" v-model.trim="iL.value">
			</div>
			<div class="form-input col-action">
				<Icon 
					@click="removeInputAction(index)"
					class="icon-action"
					icon="codicon-trash" />
			</div>
		</div>
	</div>
	<div v-if="rdInputDataType === 'json'" >
		<div class="form-input">
			<label>Data</label>
			<textarea 
				rows="6"
				:disabled="loadingTX" :value="inputListJSON" @change="inputDataChange"></textarea>
		</div>
	</div>

	<h5 class="title-data">Tags</h5>
	<p class="no-results" v-if="!tagsList.length">No tags.</p>
	<div class="data-input-list" v-for="(tL, indexTag) of tagsList" :key="indexTag">
		<div class="form-input col-key">
			<label>Name</label>
			<input 
				:disabled="loadingTX"
				type="text" v-model.trim="tL.name">
		</div>
		<div class="form-input col-value">
			<label>Value</label>
			<input 
				:disabled="loadingTX"
				type="text" v-model.trim="tL.value">
		</div>
		<div class="form-input col-action">
			<Icon 
				@click="removeTag(indexTag)"
				class="icon-action"
				icon="codicon-trash" />
		</div>
	</div>
	<div class="form-radio">
		<label>
			<input 
				type="radio" 
				:disabled="loadingTX" 
				name="runFilter" value="viewState" v-model.trim="rdFilter">
			View state
		</label>
		<label>
			<input 
				type="radio" 
				:disabled="loadingTX" 
				name="runFilter" value="writeInteractionDryRun" v-model.trim="rdFilter">
			Write Interaction (Dry-run only)
		</label>
		<label>
			<input 
				type="radio" 
				:disabled="loadingTX" 
				name="runFilter" value="writeInteraction" v-model.trim="rdFilter">
			Write Interaction (Create and Post TX)
		</label>
	</div>
	
	<ul class="run-menu">
		<li>
			<p>
				Balance: {{ balance }} AR
			</p>
		</li>
		<li class="text-right">
			<a v-if="selNetwork.indexOf('localhost') >= 0 || selNetwork.indexOf('testnet') >= 0"
				class="link" @click="testnetMintTokens()">+ Mint 1 AR</a>
		</li>
		<li>
			<button
				:class="{primary: !loadingTX}" 
				:disabled="loadingTX"
				@click="addInputData('', '')">
				<Icon class="icon-btn" icon="codicon-add" /><span>Add Input Data</span>
			</button>
		</li>
		<li>
			<button
				:class="{primary: !loadingTX}" 
				:disabled="loadingTX"
				@click="addTag('', '')">
				<Icon class="icon-btn" icon="codicon-tag" /><span>Add Tag</span>
			</button>
		</li>
		<li>
			<button
				:class="{primary: (txtContract) && !loadingTX}" 
				:disabled="(!txtContract) || loadingTX"
				@click="runInteraction(txtContract, inputList, rdFilter, tagsList)">
				<Icon class="icon-btn" icon="codicon-debug-alt" /><span>Run Interaction</span>
			</button>
		</li>
	</ul>
	<h5>Results:</h5>
	<p 
		class="no-results"
		v-if="!response || (response && Object.keys(response).length == 0) && !loadingTX">
		No results.
	</p>
	<div 
		class="no-results"
		v-if="response && Object.keys(response).length > 0">
		<table class="table">
			<thead>
				<tr>
					<th>
						Key
					</th>
					<th>
						Value
					</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="k of Object.keys(response)" :key="k">
					<td style="width: 20%">
						{{ k }}
					</td>
					<td>
						{{ response[k] }}
					</td>
				</tr>
			</tbody>
		</table>
		<h5>RAW JSON response:</h5>
		<pre>{{ response }}</pre>
	</div>
	<p 
		class="no-results text-center"
		v-if="loadingTX">
		Loading ...
	</p>
	<div class="run-container" v-if="contractInteractionTX">
		<Icon class="icon-run-panel success" icon="codicon-check" />
		<h3>TX created successfully!</h3>
		<p class="text-center">TX: {{ contractInteractionTX }}</p>
	</div>
</div>
<div class="run-container" v-else>
	<Icon class="icon-run-panel" icon="codicon-lock" />
	<p class="text-center no-results">Please login first!</p>
</div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watchEffect, onMounted } from 'vue';
import Icon from '@/components/atomic/Icon';
import { UserSettings } from '@/core/UserSettings';
import { ArweaveHandler } from '@/core/ArweaveHandler';
import { 
  Input, View, Tags, ArTransfer
 } from 'redstone-smartweave';
import { createToast } from 'mosha-vue-toastify';

const userSettings = new UserSettings();
const settings = userSettings.settings;
const globalArweaveHandler = new ArweaveHandler();

const networks = computed(() => {
	return globalArweaveHandler.networks;
});
const rdFilter = ref('viewState');
const rdInputDataType = ref('input');
const selNetwork = ref('arweave-mainnet');
const prevNetwork = ref(selNetwork.value);
const txtContract = ref('');
const response = ref({});
const contractInteractionTX = ref('');
const loadingTX = ref(false);
const inputList = reactive<Input[]>([{ key: 'function', value: '' }]);
const inputListJSON = computed(() => {
	return JSON.stringify(inputList);
});
const tagsList = reactive<Tags>([]);
const props = defineProps({
	workspace: Object,
	tokenState: Object,
	login: Object,
	tx: String,
	iframe: Boolean
});

const mainAddress = ref(props.login.mainAddress);
const contractSettings = computed(() => {
	const settings = props.tokenState.settings ? props.tokenState.settings : [];
	return new Map(settings);
});
const appFeeInAr = computed(() => {
	return globalArweaveHandler.arweave.ar.winstonToAr(appFeeInWinston.value);
});
const pstBalance = computed(() => {
	const balances = props.tokenState.balances ? props.tokenState.balances : {};
	const res = Object.prototype.hasOwnProperty.call(balances, mainAddress.value) ? 
		parseInt(props.tokenState.balances[mainAddress.value]) : 0;
	return res;
});
const balance = ref('0');

const balances = computed(() => {
	const balances = props.tokenState.balances ? props.tokenState.balances : {};
	return balances;
});
const appFeeInWinston = computed(() => {
	return contractSettings.value.get('appFeeInWinston');
});
const vipMinimumBalance = computed(() => {
	return parseInt(contractSettings.value.get('vipMinimumBalance'));
});
const isBridgeActive = ref(false);

const inputDataChange = (event) => {
	try{
		const data = JSON.parse(event.target.value) || [];
		if (Array.isArray(data) && data) {
			inputList.splice(0, inputList.length)
			for (let e of data) {
				inputList.push(e);
			}
		}
	} catch (error) {
		createToast(`Error: ${error}`,
    {
      type: 'danger',
      showIcon: true,
      position: 'bottom-right',
    });
	}
};

const runInteraction = async (
	contractTX: string,
	data: Input[],
	interaction: string,
	tags: Tags) => {
	loadingTX.value = true;
	try {
		// Check balance
		if (balance.value == 0 && interaction !== 'viewState') {
			throw Error('Not enough balance!');
		}

		const arweave = new ArweaveHandler(selNetwork.value);
		// Iframe fix
		const loginMethod = props.login.method;
		if (isBridgeActive.value && (loginMethod === 'arconnect' || loginMethod === 'finnie')) {
			props.login.hijackArweavePostAPI(arweave.arweave);
		}
		let func = '';
		const fullPayload = {};
		response.value = {};
		for (const d of data) {
			let value = d.value;
			if (!isNaN(value)) {
				if (Number.isInteger(value)) {
					value = parseInt(value);
				} else {
					value = parseFloat(value);
				}
			}
			if (d.key === 'function') {
				func = value;
			}
			fullPayload[d.key] = value;
		}
		if (!func) {
			throw Error('Please provide a "function" input.');
		}
		const contract = arweave.smartweave.contract(
				contractTX
			).connect(
				props.login.key
			).setEvaluationOptions({
				// with this flag set to true, the write will wait for the transaction to be confirmed
				waitForConfirmation: false,
			});
			const transfer = arweave.getTransferData(
				pstBalance.value,
				vipMinimumBalance.value,
				selNetwork.value,
				appFeeInWinston.value,
				mainAddress.value,
				balances.value
			);

		// Dry-run
		const handlerResult = await contract.callContract<Input>(
			fullPayload, undefined, undefined, tags, transfer
		);
    if (handlerResult.type !== 'ok') {
      throw Error(`Cannot create interaction: ${handlerResult.errorMessage}`);
    }

		// View interaction with user's key 
		if (interaction === 'viewState') {			
			const { state, result } = await contract.viewState<Input, View>(fullPayload);
			response.value = result;
			createToast('Success on viewState interaction!',
			{
				type: 'success',
				showIcon: true,
				position: 'bottom-right',
			});
		}
		// Write interaction (Dry-run)
		else if (interaction === 'writeInteractionDryRun') {
      const { state, result } = await contract.dryWrite<Input>(fullPayload);
			response.value = result;
			createToast('Interaction executed successfully!',
			{
				type: 'success',
				showIcon: true,
				position: 'bottom-right',
			});
		}
		// Write interaction
		else if (interaction === 'writeInteraction') {
      contractInteractionTX.value = await contract.writeInteraction(fullPayload, tags, transfer);
			createToast('TX created successfully!',
			{
				type: 'success',
				showIcon: true,
				position: 'bottom-right',
			});
		}
		
	} catch (err) {
		let error = `${err}`;
		if (typeof(err) === 'object' &&
				Object.prototype.hasOwnProperty.call(err, 'message')) {
			error = err.message;
		}
		createToast(error,
    {
      type: 'danger',
      showIcon: true,
      position: 'bottom-right',
    });
		console.error(error);
	}
	loadingTX.value = false;
};
const addInputData = (key: string, value: string) => {
	inputList.push({ key, value });
};

const removeInputAction = (index: number) => {
	inputList.splice(index, 1);
};

const addTag = (name: string, value: string) => {
	tagsList.push({ name, value });
};

const removeTag = (index: number) => {
	tagsList.splice(index, 1);
};

const testnetMintTokens = async (qty='1000000000000') => {
	try {
		const net = networks.value[selNetwork.value];
		const url = `${net.protocol}://${net.host}:${net.port}/mint/${mainAddress.value}/${qty}`;
		const res = await fetch(url);
		if (res.status === 200) {
		createToast('Tokens minted!',
			{
				type: 'success',
				showIcon: true,
				position: 'bottom-right',
			});
		} else {
			console.log('Error:', res);
			createToast('Tokens not minted!',
			{
				type: 'danger',
				showIcon: true,
				position: 'bottom-right',
			});
		}

		// Update balance after 1 second 
		window.setTimeout(async () => {
			const arweave = new ArweaveHandler(selNetwork.value);
			balance.value = await arweave.arweave.wallets.getBalance(mainAddress.value);
			balance.value = arweave.arweave.ar.winstonToAr(balance.value);
		}, 1500);


	} catch (err) {
		createToast(err,
    {
      type: 'danger',
      showIcon: true,
      position: 'bottom-right',
    });
	}
};

onMounted(async () => {
	// Get wallet balance
	if (mainAddress.value) {
		balance.value = 0;
		try {
			const arweave = new ArweaveHandler(selNetwork.value);
			balance.value = await arweave.arweave.wallets.getBalance(mainAddress.value);
			balance.value = arweave.arweave.ar.winstonToAr(balance.value);
			prevNetwork.value = selNetwork.value;
		} catch (err) {
			createToast(`${err}`,
			{
				type: 'danger',
				showIcon: true,
				position: 'bottom-right',
			});
		}
	}
	// Check iframe conditions
	isBridgeActive.value = false;
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
	// Balance for Method 1
	if (mainAddress.value && selNetwork.value != prevNetwork.value) {
		balance.value = 0;
		try {
			const arweave = new ArweaveHandler(selNetwork.value);
			balance.value = await arweave.arweave.wallets.getBalance(mainAddress.value);
			balance.value = arweave.arweave.ar.winstonToAr(balance.value);
			prevNetwork.value = selNetwork.value;
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
	text-align: center;
}
.run-menu {
	padding: 0px;
	margin-top: 0px;
	margin-bottom: 0px;
}
.run-menu li {
	padding: 0px;
	font-size: 12px;
	list-style: none;
	text-align: center;
	margin-top: 10px;
}

.run-menu li p {
	margin-bottom: 20px;
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
	height: 36px;
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
.form-input select,
.form-input textarea,
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

.form-radio-linear {
	padding: 10px;
}
.form-radio-linear label {
	font-size: 12px;
	margin-bottom: 4px;
	display: inline;
}
.form-radio-linear input
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

.title-data {
	margin: 0px 0px;
}

.col-key {
	float: left;
	width: 42%;
}
.col-value {
	float: left;
	width: 45%;
}
.col-action {
	float: left;
	width: 10%;
	height: 32px;
}
.icon-action {
	padding: 22px 0;
	font-size: 16px !important;
	cursor: pointer;
}

.data-input-list {
	min-height: 76px;
}

.table {
	width: 100%;
	font-size: 12px;
  word-break: break-word;
  margin-bottom: 12px;
}

.table th {
	background-color: var(--app-toolbar-panel-title-bgcolor);
	color: var(--app-toolbar-panel-title-color);
}
.link {
	font-size: 12px;
	cursor: pointer;
	text-decoration: underline;
}


</style>