<template>
<div class="arcode-main-toolbar-panel-title">
	Run and Debug
</div>
<div class="run-container" v-if="mainAddress">
	<div class="form-input">
		<label>Network</label>
		<select 
			:disabled="loadingTX" 
			v-model.trim="selNetwork">
			<option v-for="(nItem, nIndex) in networks" v-bind:key="nIndex" :value="nIndex">{{ nItem.host }} ({{ nIndex }})</option>
		</select>
	</div>
	<div class="form-input">
		<label>Wallet</label>
		<input type="text" disabled :value="mainAddress">
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
				<DefaultIcon 
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
			<DefaultIcon 
				@click="removeTag(indexTag)"
				class="icon-action"
				icon="codicon-trash" />
		</div>
	</div>
	<h5 class="title-data">Interaction options</h5>
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
		<hr>
		<label class="">
      <input  
        v-model.trim="txtUseArweaveGw" 
        type="checkbox"> useArweaveGw (Instead of Warp Gw)
    </label>
    <label class="">
      <input  
        v-model.trim="txtWaitForConfirmation" 
        type="checkbox"> waitForConfirmation (the write will wait for the transaction to be confirmed when true)
    </label>
		<label class="">
      <input  
        v-model.trim="txtAllowUnsafeClient" 
        type="checkbox"> allowUnsafeClient (Insecure)
    </label>
    <label class="">
      <input  
        v-model.trim="txtAllowBigInt" 
        type="checkbox"> allowBigInt
    </label>
    <label class="">
      <input  
        v-model.trim="txtInternalWrites" 
        type="checkbox"> internalWrites
    </label>
	</div>
	<h5 class="title-data">Balance</h5>
	<ul class="run-menu">
		<li>
			<p class="text-left-f">
				<span class="span-balance">{{ balance }}</span> AR
			</p>
		</li>
		<li class="text-right-f">
			<a v-if="selNetwork.indexOf('localhost') >= 0 || selNetwork.indexOf('testnet') >= 0"
				class="link" @click="testnetMintTokens()">+ Mint 1 AR</a>
		</li>
		<li v-if="usageFee && rdFilter === 'writeInteraction' ">
			<strong class="usage-fee-txt">Usage Fee:</strong> <span class="span-balance">{{ usageFee }}</span> AR
		</li>
		<li>
			<button
				:class="{primary: !loadingTX}" 
				:disabled="loadingTX"
				@click="addInputData('', '')">
				<DefaultIcon class="icon-btn" icon="codicon-add" /><span>Add Input Data</span>
			</button>
		</li>
		<li>
			<button
				:class="{primary: !loadingTX}" 
				:disabled="loadingTX"
				@click="addTag('', '')">
				<DefaultIcon class="icon-btn" icon="codicon-tag" /><span>Add Tag</span>
			</button>
		</li>
		<li>
			<button
				:class="{primary: (txtContract) && !loadingTX}" 
				:disabled="(!txtContract) || loadingTX"
				@click="runInteraction(
					txtContract, inputList, rdFilter, tagsList
				)">
				<DefaultIcon class="icon-btn" icon="codicon-debug-alt" /><span>Run Interaction</span>
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
	<div 
		class="no-results text-center"
		v-if="loadingTX">
		<div
		class="lds-ring lds-ring-small">
		<div></div><div></div><div></div><div></div></div>
		<span>Loading ...</span>
	</div>


	<div class="run-container text-center-f" v-if="contractInteractionTX">
		<DefaultIcon class="icon-run-panel success" icon="codicon-check" />
		<h3>TX created successfully!</h3>
		<p class="text-center">TX: {{ contractInteractionTX }}</p>
	</div>
</div>
<div class="run-container text-center-f" v-else>
	<DefaultIcon class="icon-run-panel" icon="codicon-lock" />
	<p class="text-center no-results">Please login first!</p>
</div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watchEffect, onMounted } from 'vue'
import DefaultIcon from '@/components/atomic/DefaultIcon'
import { ArweaveWrapper, arweaveNetworks, defaultNetwork } from '@/core/ArweaveWrapper'
import { createToast } from 'mosha-vue-toastify'
import { WarpContracts, Tags } from '@/core/WarpContracts'
import { EvaluationOptions } from 'warp-contracts'
const networks = computed(() => {
	return arweaveNetworks
});
const rdFilter = ref('viewState')
const rdInputDataType = ref('input')
const defaultSelNetwork = props.networkParam ? props.networkParam : defaultNetwork
const selNetwork = ref(defaultSelNetwork)
const prevNetwork = ref(selNetwork.value)
const txtContract = ref('')
const response = ref({})
const contractInteractionTX = ref('')
const loadingTX = ref(false)
const txtAllowUnsafeClient = ref(false)
const txtAllowBigInt = ref(false)
const txtInternalWrites = ref(false)
const txtUseArweaveGw = ref(false)
const txtWaitForConfirmation = ref(false)
// eslint-disable-next-line
const inputList = reactive<{key: string, value: any}[]>([{ key: 'function', value: '' }])
const inputListJSON = computed(() => {
	return JSON.stringify(inputList)
});
const tagsList = reactive<Tags>([])
const props = defineProps({
	workspace: Object,
	tokenState: Object,
	login: Object,
	tx: String,
	iframe: Boolean,
	networkParam: String
});

const mainAddress = ref(props.login.mainAddress)
const contractSettings = computed(() => {
	const settings = props.tokenState.settings ? props.tokenState.settings : []
	return new Map(settings)
});
const pstBalance = computed(() => {
	const balances = props.tokenState.balances ? props.tokenState.balances : {}
	const res = Object.prototype.hasOwnProperty.call(balances, mainAddress.value) ? 
		parseInt(props.tokenState.balances[mainAddress.value]) : 0
	return res
});
const balance = ref('0')

const balances = computed(() => {
	const balances = props.tokenState.balances ? props.tokenState.balances : {}
	return balances
});
const appFeeInWinston = computed(() => {
	return contractSettings.value.get('appFeeInWinston')
});
const vipMinimumBalance = computed(() => {
	return parseInt(contractSettings.value.get('vipMinimumBalance'))
});
const isBridgeActive = ref(false)

const inputDataChange = (event) => {
	try{
		const data = JSON.parse(event.target.value) || []
		if (Array.isArray(data) && data) {
			inputList.splice(0, inputList.length)
			for (const e of data) {
				inputList.push(e);
			}
		}
	} catch (error) {
		createToast(`Error: ${error}`,
    {
      type: 'danger',
      showIcon: true,
      position: 'bottom-right',
    })
	}
};

const runInteraction = async (
	contractTX: string,
	// eslint-disable-next-line
	data: any[],
	interaction: string,
	tags: Tags) => {
	loadingTX.value = true
	const options: Partial<EvaluationOptions> = {
		allowUnsafeClient: txtAllowUnsafeClient.value,
		allowBigInt: txtAllowBigInt.value,
		internalWrites: txtInternalWrites.value,
		waitForConfirmation: txtWaitForConfirmation.value
	}
	try {
		// Check balance
		if (balance.value == 0 && interaction !== 'viewState') {
			throw Error('Not enough balance!')
		}

		const arweaveWrapper = new ArweaveWrapper(selNetwork.value)
		const arweave = arweaveWrapper.arweave
		const customGw = ''
		const useArweaveGw = txtUseArweaveGw.value
		const warp = new WarpContracts(arweave, customGw, useArweaveGw)
		// Iframe fix
		const loginMethod = props.login.method
		if (isBridgeActive.value && (loginMethod === 'arconnect' || loginMethod === 'finnie')) {
			props.login.hijackArweavePostAPI(arweave)
		}
		let func = ''
		const fullPayload = {}
		response.value = {}
		contractInteractionTX.value = ''
		for (const d of data) {
			let value = d.value
			if (!isNaN(value)) {
				if (Number.isInteger(value)) {
					value = parseInt(value)
				} else {
					value = parseFloat(value)
				}
			}
			if (d.key === 'function') {
				func = value
			}
			fullPayload[d.key] = value
		}
		if (!func) {
			throw Error('Please provide a "function" input.')
		}
		const contract = warp.warp.contract(
				contractTX
			).connect(
				props.login.key
			).setEvaluationOptions(options)

		const transfer = warp.getTransferData(
			pstBalance.value,
			vipMinimumBalance.value,
			selNetwork.value,
			appFeeInWinston.value,
			mainAddress.value,
			balances.value
		)

		// Dry-run
		// eslint-disable-next-line
		const handlerResult = await contract.callContract<any>(
			fullPayload, undefined, undefined, tags, transfer
		)
    if (handlerResult.type !== 'ok') {
      throw Error(`Cannot create interaction: ${handlerResult.errorMessage}`)
    }

		// View interaction with user's key 
		if (interaction === 'viewState') {
			// eslint-disable-next-line
			const { result } = await contract.viewState<any, any>(fullPayload)
			response.value = result
			createToast('Success on viewState interaction!',
			{
				type: 'success',
				showIcon: true,
				position: 'bottom-right',
			})
		}
		// Write interaction (Dry-run)
		else if (interaction === 'writeInteractionDryRun') {
			// eslint-disable-next-line
      const result = await contract.dryWrite<any>(fullPayload)
			response.value = result
			createToast('Interaction executed successfully!',
			{
				type: 'success',
				showIcon: true,
				position: 'bottom-right',
			})
		}
		// Write interaction
		else if (interaction === 'writeInteraction') {
      contractInteractionTX.value = await contract.writeInteraction(fullPayload, tags, transfer)
			createToast('TX created successfully!',
			{
				type: 'success',
				showIcon: true,
				position: 'bottom-right',
			})
		}
		
	} catch (err) {
		let error = `${err}`
		if (typeof(err) === 'object' &&
				Object.prototype.hasOwnProperty.call(err, 'message')) {
			error = err.message
		}
		createToast(error,
    {
      type: 'danger',
      showIcon: true,
      position: 'bottom-right',
    })
		console.error(error)
	}
	loadingTX.value = false
}
const addInputData = (key: string, value: string) => {
	inputList.push({ key, value })
}

const removeInputAction = (index: number) => {
	inputList.splice(index, 1)
}

const addTag = (name: string, value: string) => {
	tagsList.push({ name, value })
}

const removeTag = (index: number) => {
	tagsList.splice(index, 1)
}

const testnetMintTokens = async (qty='1000000000000') => {
	try {
		const net = networks.value[selNetwork.value]
		const url = `${net.protocol}://${net.host}:${net.port}/mint/${mainAddress.value}/${qty}`
		const res = await fetch(url)
		if (res.status === 200) {
		createToast('Tokens minted!',
			{
				type: 'success',
				showIcon: true,
				position: 'bottom-right',
			})
		} else {
			console.log('Error:', res)
			createToast('Tokens not minted!',
			{
				type: 'danger',
				showIcon: true,
				position: 'bottom-right',
			})
		}

		// Update balance after 1 second 
		window.setTimeout(async () => {
			const arweave = new ArweaveWrapper(selNetwork.value)
			balance.value = await arweave.arweave.wallets.getBalance(mainAddress.value)
			balance.value = arweave.arweave.ar.winstonToAr(balance.value)
		}, 1500)


	} catch (err) {
		createToast(err,
    {
      type: 'danger',
      showIcon: true,
      position: 'bottom-right',
    })
	}
}

onMounted(async () => {
	// Get wallet balance
	if (mainAddress.value) {
		balance.value = 0
		try {
			const arweave = new ArweaveWrapper(selNetwork.value)
			balance.value = await arweave.arweave.wallets.getBalance(mainAddress.value)
			balance.value = arweave.arweave.ar.winstonToAr(balance.value)
			prevNetwork.value = selNetwork.value
		} catch (err) {
			createToast(`${err}`,
			{
				type: 'danger',
				showIcon: true,
				position: 'bottom-right',
			})
		}
	}
	// Check iframe conditions
	isBridgeActive.value = false
	if (props.iframe) {
		// Start handshake with parent 
		try {
			isBridgeActive.value = await props.login.isBridgeActive()

		} catch (err) {
			createToast(`${err}`,
			{
				type: 'danger',
				showIcon: true,
				position: 'bottom-right',
			})
		}
	}
})

watchEffect(async () => {
	// Balance for Method 1
	if (mainAddress.value && selNetwork.value != prevNetwork.value) {
		balance.value = 0
		try {
			const arweave = new ArweaveWrapper(selNetwork.value)
			balance.value = await arweave.arweave.wallets.getBalance(mainAddress.value)
			balance.value = arweave.arweave.ar.winstonToAr(balance.value)
			prevNetwork.value = selNetwork.value
		} catch (err) {
			createToast(`${err}`,
			{
				type: 'danger',
				showIcon: true,
				position: 'bottom-right',
			})
		}
	}
})

const usageFee = computed(() => {
	const arweaveWrapper = new ArweaveWrapper(selNetwork.value)
	const warpContracts = new WarpContracts(arweaveWrapper.arweave)
	const transfer = warpContracts.getTransferData(
			pstBalance.value,
			vipMinimumBalance.value,
			selNetwork.value,
			appFeeInWinston.value,
			mainAddress.value,
			balances.value
		)
	return transfer ? parseFloat(arweaveWrapper.winstonToAr(transfer.winstonQty)) : 0
})
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
	text-align: left;
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
	width: 80%;
	height: 100%;
	line-height: 14px;
	border: 0;
	cursor: pointer;
	font-size: 14px;
	text-align: center;
  vertical-align: middle;
	color: gray;
	cursor: default;
	background-color: rgba(0,0,0,0.1);
	height: 36px;
	border-radius: 6px;
}

.run-menu li button.primary {
	background-color: var(--app-toolbar-panel-title-bgcolor);
  color: var(--app-toolbar-panel-title-color);
  cursor: pointer;
}

.run-menu li button span {
	font-size: 14px;
	margin-left: 6px;
	line-height: 14px;

}

.run-menu li button:hover {
	background-color: rgba(0,0,0,0.3);
}

.form-input input,
.form-input select,
.form-input textarea,
 {
	padding: 6px;
}
.form-input option
 {
	padding: 6px;
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
	line-height: 14px;
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
.span-balance{
	font-size: 16px;
}
.usage-fee-txt {
	color: red !important;
}

.text-left-f {
	text-align: left !important;
}
.text-right-f {
	text-align: right !important;
}
.text-center-f {
	text-align: center !important;
}

</style>