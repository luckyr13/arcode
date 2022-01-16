<template>
<div class="arcode-main-toolbar-panel-title">
	Arweave Explorer
</div>
<div class="search-container">
	<div class="form-input">
		<label>Method</label>
		<select 
			:disabled="loadingSearch" 
			v-model.trim="selSearchMethod">
			<option value="tx">Search by TX</option>
			<option value="address">Search by Address</option>
			<option value="tags">Search by Tags</option>
		</select>
	</div>
	<div class="form-input">
		<label>Network</label>
		<select 
			:disabled="loadingSearch" 
			v-model.trim="selNetwork">
			<option v-for="(nItem, nIndex) in networks" v-bind:key="nIndex" :value="nIndex">{{ nItem.host }} ({{ nIndex }})</option>
		</select>
	</div>
	<template v-if="selSearchMethod == 'tx'">
		<div class="form-input">
			<label>TX ID</label>
			<input 
				:disabled="loadingSearch" 
				type="text" v-model.trim="txtTxId" @keyup.enter="searchByTX(txtTxId)">
		</div>
		<ul class="search-menu">
			<li>
				<button
					:class="{primary: (txtTxId) && !loadingSearch}" 
					:disabled="(!txtTxId || !selSearchMethod) || loadingSearch"
					@click="searchByTX(txtTxId)">
					<Icon class="icon-btn" icon="codicon-search" /><span>Search</span>
				</button>
			</li>
		</ul>
	</template>
	<template v-else-if="selSearchMethod == 'address'">
		<div class="form-input">
			<label>From Address</label>
			<input 
				:disabled="loadingSearch" 
				type="text" 
				v-model.trim="txtAddress" 
				@keyup.enter="searchByAddress(txtAddress, txtResLimit)">
			<div class="text-right">
				<a v-if="mainAddress" class="link" @click="txtAddress = mainAddress">Use my wallet address</a>
			</div>
		</div>
		<div class="form-input">
			<label>Results limit</label>
			<input 
				type="number" 
				max="100"
				min="1"
				:disabled="loadingSearch" 
				v-model.trim="txtResLimit" 
				@keyup.enter="searchByAddress(txtAddress, txtResLimit)">
		</div>
		<div class="form-radio">
			<label>
				<input 
					type="radio" 
					:disabled="loadingSearch" 
					checked 
					name="addressFilter" value="" v-model.trim="rdFilter">
				All TXs
			</label>
			<label>
				<input 
					:disabled="loadingSearch" 
					type="radio" 
					name="addressFilter" value="contracts" v-model.trim="rdFilter">
				Smart Contracts
			</label>
			<label>
				<input 
					:disabled="loadingSearch" 
					type="radio" 
					name="addressFilter" value="contractSources" v-model.trim="rdFilter">
				Contract Sources
			</label>
			<label>
				<input 
					:disabled="loadingSearch" 
					type="radio" 
					name="addressFilter" value="nfts" v-model.trim="rdFilter">
				NFT Atomic Assets
			</label>
			<label>
				<input 
					:disabled="loadingSearch" 
					type="radio" 
					name="addressFilter" value="manifest" v-model.trim="rdFilter">
				Manifest Files
			</label>
			<label>
				<input 
					:disabled="loadingSearch" 
					type="radio" 
					name="addressFilter" value="textFiles" v-model.trim="rdFilter">
				Text Files
			</label>
			<label>
				<input 
					:disabled="loadingSearch" 
					type="radio" name="addressFilter" value="mediaFiles" v-model.trim="rdFilter">
				Media Files
			</label>
		</div>
		<ul class="search-menu">
			<li>
				<button
					:class="{primary: (txtAddress && txtResLimit) && !loadingSearch}" 
					:disabled="(!txtAddress || !selSearchMethod || !txtResLimit) || loadingSearch"
					@click="searchByAddress(txtAddress, txtResLimit)">
					<Icon class="icon-btn" icon="codicon-search" /><span>Search</span>
				</button>
			</li>
		</ul>
	</template>
	<template v-if="selSearchMethod == 'tags'">
		<div class="form-input">
			<label>Results limit</label>
			<input 
				type="number" 
				max="100"
				min="1"
				:disabled="loadingSearch" 
				v-model.trim="txtResLimitTags" 
				@keyup.enter="searchByTags(tagsList, txtResLimitTags)">
		</div>
		<h5 class="title-tags">Tags</h5>
		<p class="no-results" v-if="!tagsList.length">No tags.</p>
		<div class="data-input-list" v-for="(tL1, index1) of tagsList" :key="index1">
			<div class="form-input col-key">
				<label>Name</label>
				<input 
					:disabled="loadingSearch"
					type="text" v-model.trim="tL1.name">
			</div>
			<div class="form-input col-value">
				<label>Value</label>
				<input 
					:disabled="loadingSearch"
					type="text" v-model.trim="tL1.values">
			</div>
			<div class="form-input col-action">
				<Icon 
					@click="removeTag(index1, tagsList)"
					class="icon-action"
					icon="codicon-trash" />
			</div>
		</div>
		<ul class="search-menu">
			<li>
				<button
					:class="{primary: !loadingSearch}" 
					:disabled="loadingSearch"
					@click="addTag('', '', tagsList)">
					<Icon class="icon-btn" icon="codicon-tag" /><span>Add Tag</span>
				</button>
			</li>
			<li>
				<button
					:class="{primary: (tagsList.length) && !loadingSearch}" 
					:disabled="(!tagsList.length) || loadingSearch"
					@click="searchByTags(tagsList, txtResLimitTags)">
					<Icon class="icon-btn" icon="codicon-search" /><span>Search</span>
				</button>
			</li>
		</ul>
	</template>
	<h5>Results:</h5>
	<template v-if="resultsTX && Object.keys(resultsTX).length">
		<div v-if="isMainnet" class="link-container text-left">
			<p v-if="resultsTXIsContract">
				Open in RedStone Smartweave contracts explorer:
				<a :href="`https://scanner.redstone.tools/#/app/contract/${txtTxId}`" target="_blank">
					{{ `https://scanner.redstone.tools/#/app/contract/${txtTxId}` }}
				</a>
			</p>
			<p>
				Open in Viewblock: 
				<a :href="`https://viewblock.io/arweave/tx/${txtTxId}`" target="_blank">
					{{ `https://viewblock.io/arweave/tx/${txtTxId}` }}
				</a>
			</p>
			<p>
				Open in Arweave.net: 
				<a :href="`https://arweave.net/${txtTxId}`" target="_blank">
					{{ `https://arweave.net/${txtTxId}` }}
				</a>
			</p>
		</div>
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
				<tr v-for="k of Object.keys(resultsTX)" :key="k">
					<td style="width: 20%">
						{{ k }}
					</td>
					<td>
						{{ resultsTX[k] }}
					</td>
				</tr>
			</tbody>
		</table>
	</template>
	<template v-if="resultsByAddress && resultsByAddress.length">
		<p class="no-results">{{ resultsByAddress.length }} results found.</p>
		<div v-for="r of resultsByAddress" :key="r._id">
			<p>
				TX: {{ r._id }}
			</p>
			<div v-if="isMainnet" class="link-container text-left">
				<p v-if="txIsContract(r._tags)">
					Open in RedStone Smartweave contracts explorer:
					<a :href="`https://scanner.redstone.tools/#/app/contract/${r._id}`" target="_blank">
						{{ `https://scanner.redstone.tools/#/app/contract/${r._id}` }}
					</a>
				</p>
				<p>
					Viewblock link: 
					<a :href="`https://viewblock.io/arweave/tx/${r._id}`" target="_blank">
						{{ `https://viewblock.io/arweave/tx/${r._id}` }}
					</a>
				</p>
				<p>
					Arweave.net link: 
					<a :href="`https://arweave.net/${r._id}`" target="_blank">
						{{ `https://arweave.net/${r._id}` }}
					</a>
				</p>
			</div>
			<table class="table" >
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
					<tr v-for="k of Object.keys(r)" :key="k">
						<td style="width: 20%">
							{{ k }}
						</td>
						<td>
							{{ r[k] }}
						</td>
					</tr>
				</tbody>
			</table>
			<hr>
		</div>
	</template>
	<template v-if="resultsByTags && resultsByTags.length">
		<p class="no-results">{{ resultsByTags.length }} results found.</p>
		<div v-for="r of resultsByTags" :key="r._id">
			<p>
				TX: {{ r._id }}
			</p>
			<div v-if="isMainnet" class="link-container text-left">
				<p v-if="txIsContract(r._tags)">
					Open in RedStone Smartweave contracts explorer:
					<a :href="`https://scanner.redstone.tools/#/app/contract/${r._id}`" target="_blank">
						{{ `https://scanner.redstone.tools/#/app/contract/${r._id}` }}
					</a>
				</p>
				<p>
					Viewblock link: 
					<a :href="`https://viewblock.io/arweave/tx/${r._id}`" target="_blank">
						{{ `https://viewblock.io/arweave/tx/${r._id}` }}
					</a>
				</p>
				<p>
					Arweave.net link: 
					<a :href="`https://arweave.net/${r._id}`" target="_blank">
						{{ `https://arweave.net/${r._id}` }}
					</a>
				</p>
			</div>
			<table class="table" >
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
					<tr v-for="k of Object.keys(r)" :key="k">
						<td style="width: 20%">
							{{ k }}
						</td>
						<td>
							{{ r[k] }}
						</td>
					</tr>
				</tbody>
			</table>
			<hr>
		</div>
	</template>
	
	<p 
		class="no-results"
		v-if="(!resultsTX || Object.keys(resultsTX).length <= 0) && (!resultsByAddress || resultsByAddress.length <= 0) && !loadingSearch">
		No results.
	</p>
	<p 
		class="no-results text-center"
		v-if="loadingSearch">
		Loading ...
	</p>

</div>
</template>

<script setup lang="ts">
import {ref, computed, reactive} from 'vue';
import Icon from '@/components/atomic/Icon';
import { ArweaveHandler } from '@/core/ArweaveHandler';
import { createToast } from 'mosha-vue-toastify';
import { Login } from '@/core/Login';
import { UserSettings } from '@/core/UserSettings';

const txtTxId = ref('');
const txtAddress = ref('');
const txtResLimit = ref(10);
const txtResLimitTags = ref(10);
const selSearchMethod = ref('tx');
const selNetwork = ref('arweave-mainnet');
const loadingSearch = ref(false);
const resultsTX = ref({});
const resultsTXIsContract = ref(false);
const resultsByAddress = ref([]);
const resultsByTags = ref([]);
const rdFilter = ref('');
const globalArweaveHandler = new ArweaveHandler();
const userSettings = new UserSettings();
const settings = userSettings.settings;
let login = new Login(settings.stayLoggedIn);
const tagsList = reactive<Array<{name: string, values: string}>>([]);
const mainAddress = computed(() => {
	return login.mainAddress;
});


const networks = computed(() => {
	return globalArweaveHandler.networks;
});

const searchByTX = async (tx: string) => {
	if (!tx) {
		return;
	}
	resultsTX.value = {};
	resultsByAddress.value = [];
	resultsByTags.value = [];
	loadingSearch.value = true;
	try {
		const arweave = new ArweaveHandler(selNetwork.value);
		resultsTX.value = await arweave.ardb.search('transaction').id(tx).findOne();
		resultsTXIsContract.value = false;

		resultsTX.value._tags.forEach(tag => {
			let key = tag.name ? tag.name : '';
			let value = tag.value ? tag.value : '';
			if (key == 'App-Name' && value == 'SmartWeaveContract') {
				resultsTXIsContract.value = true;
			}
		});

	} catch (err) {
		createToast(`${err}`,
      {
        type: 'danger',
        showIcon: true,
        position: 'bottom-right',
      });
	}
	loadingSearch.value = false;
};

const searchByAddress = async (address: string, limit: number) => {
	limit = parseInt(limit);
	resultsByAddress.value = [];
	resultsTX.value = {};
	resultsByTags.value = [];
	loadingSearch.value = true;
	try {
		const tags = [];
		const arweave = new ArweaveHandler(selNetwork.value);

		if (!address) {
			// throw Error('');
			return;
		} else if (limit <= 0 || limit > 100) {
			throw Error('Limit must be between 1 - 100');
		}

		if (rdFilter.value === 'contracts') {
			tags.push({
        name: 'App-Name',
        values: ['SmartWeaveContract'],
      });
		} else if (rdFilter.value === 'contractSources') {
			tags.push({
        name: 'App-Name',
        values: ['SmartWeaveContractSource'],
      });
		} else if (rdFilter.value === 'nfts') {
			tags.push({
        name: 'App-Name',
        values: ['SmartWeaveContract'],
      });
      tags.push({
        name: 'Content-Type',
        values: [ 
					// Images
					'image/png', 'image/apng', 'image/avif',
					'image/gif', 'image/jpeg', 'image/svg+xml',
					'image/webp', 'image/jpg',
					// Audio and video
					'audio/wave', 'audio/wav', 'audio/x-wav',
					'audio/x-pn-wav', 'audio/webm',
					'video/webm', 'audio/ogg',
					'video/ogg', 'application/ogg',
					'video/mp4' ]
      });
		} else if (rdFilter.value === 'manifest') {
			tags.push({
        name: 'Type',
        values: ['manifest'],
      });
			tags.push({
        name: 'Content-Type',
        values: ['application/x.arweave-manifest+json'],
      });
		}
		else if (rdFilter.value === 'textFiles') {
			tags.push({
        name: 'Content-Type',
        values: [
					// Text Files
					'application/octet-stream', 'text/plain',
					'text/css', 'text/html', 'text/javascript',
        ],
      });
		} else if (rdFilter.value === 'mediaFiles') {
			tags.push({
        name: 'Content-Type',
        values: [
					// Images
					'image/png', 'image/apng', 'image/avif',
					'image/gif', 'image/jpeg', 'image/svg+xml',
					'image/webp', 'image/jpg',
					// Audio and video
					'audio/wave', 'audio/wav', 'audio/x-wav',
					'audio/x-pn-wav', 'audio/webm',
					'video/webm', 'audio/ogg',
					'video/ogg', 'application/ogg',
					'video/mp4'
        ],
      });
		}

		resultsByAddress.value = await arweave.ardb.search(
				'transactions'
			).from(
				address
			).limit(limit).tags(tags).find();

	} catch (err) {
		createToast(`${err}`,
      {
        type: 'danger',
        showIcon: true,
        position: 'bottom-right',
      });
	}
	loadingSearch.value = false;
};

const txIsContract = (tags) => {
	let isContract = false;
	tags.forEach(tag => {
		let key = tag.name ? tag.name : '';
		let value = tag.value ? tag.value : '';
		if (key == 'App-Name' && value == 'SmartWeaveContract') {
			isContract = true;
		}
	});
	return isContract;
}

const removeTag = (index: number, tags: Array<{name: string, values: string[]}>) => {
	tags.splice(index, 1);
};

const addTag = (key: string, values: string, tags: Array<{name: string, values: string[]}>) => {
	tags.push({ key, values });
};


const searchByTags = async (tagsList: Array<{name: string, values: string[]}>, limit: number) => {
	limit = parseInt(limit);
	resultsByAddress.value = [];
	resultsTX.value = {};
	resultsByTags.value = [];
	loadingSearch.value = true;
	try {
		const tags = [];
		const arweave = new ArweaveHandler(selNetwork.value);

		if (!tagsList.length) {
			throw Error('Please provide tags');
		} else if (limit <= 0 || limit > 100) {
			throw Error('Limit must be between 1 - 100');
		}

		for (const t of tagsList) {
			const tname = t.name;
			const tvalues = t.values;
			if (!tname || !tvalues) {
				throw Error('Empty tags');
			}
			tags.push({
        name: tname,
        values: tvalues.split(','),
      });
		}

		resultsByTags.value = await arweave.ardb.search(
				'transactions'
			).limit(limit).tags(tags).find();

	} catch (err) {
		createToast(`${err}`,
      {
        type: 'danger',
        showIcon: true,
        position: 'bottom-right',
      });
	}
	loadingSearch.value = false;
};

const isMainnet = () => {
	const arweave = new ArweaveHandler(selNetwork.value);
	return arweave.onMainnet();
};
</script>

<style scoped lang="scss">
.arcode-main-toolbar-panel-title {
	height: 28px;
	line-height: 28px;
	font-size: 12px;
	padding-left: 20px;
}

.search-container {
	padding: 10px;
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


.search-menu {
	padding: 0px;
	margin-top: 0px;
	margin-bottom: 0px;
}
.search-menu li {
	padding: 0px;
	height: 36px;
	list-style: none;
	text-align: center;
	margin-top: 10px;
}
.search-menu li button {
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

.search-menu li button.primary {
	background-color: var(--app-toolbar-panel-title-bgcolor);
  color: var(--app-toolbar-panel-title-color);
  cursor: pointer;
}

.search-menu li button span {
	font-size: 12px;
	margin-left: 6px;
	line-height: 14px;

}

.search-menu li button:hover {
	background-color: rgba(0,0,0,0.3);
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

.link-container {
	font-size: 12px;
}
.link-container a {
	color: inherit;
}

.no-results {
	font-size: 12px;
}

.link {
	font-size: 12px;
	cursor: pointer;
	text-decoration: underline;
}
.title-tags {
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

</style>