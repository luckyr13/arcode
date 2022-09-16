<template>
<div class="arcode-main-toolbar-panel-title">
	Arweave Explorer
</div>
<div class="search-container">
	<div class="form-input">
		<label>Method</label>
		<select 
			:disabled="loadingSearch" 
			@change="resetResults()"
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
			<div class="text-right">
				<a v-if="tx" class="link" @click="txtTxId = tx">Use TX from URL</a>
			</div>
		</div>
		<ul class="search-menu">
			<li>
				<button
					:class="{primary: (txtTxId) && !loadingSearch}" 
					:disabled="(!txtTxId || !selSearchMethod) || loadingSearch"
					@click="searchByTX(txtTxId)">
					<DefaultIcon class="icon-btn" icon="codicon-search" /><span>Search</span>
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
			<label>Sorting order</label>
			<label>
				<input 
					type="radio" 
					:disabled="loadingSearch" 
					name="sortingOrderByAddress"
					value="HEIGHT_ASC"
					v-model.trim="rdSortingOrderByAddress">
				Height Ascending
			</label>
			<label>
				<input 
					type="radio" 
					:disabled="loadingSearch" 
					name="sortingOrderByAddress"
					value="HEIGHT_DESC"
					checked 
					v-model.trim="rdSortingOrderByAddress">
				Height Descending
			</label>
		</div>
		<div class="form-radio">
			<label>Results filter</label>
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
					<DefaultIcon class="icon-btn" icon="codicon-search" /><span>Search</span>
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
				maxlength="3" 
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
				<DefaultIcon 
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
					<DefaultIcon class="icon-btn" icon="codicon-tag" /><span>Add Tag</span>
				</button>
			</li>
			<li>
				<button
					:class="{primary: (tagsList.length) && !loadingSearch}" 
					:disabled="(!tagsList.length) || loadingSearch"
					@click="searchByTags(tagsList, txtResLimitTags)">
					<DefaultIcon class="icon-btn" icon="codicon-search" /><span>Search</span>
				</button>
			</li>
		</ul>
	</template>
	<h2>Results:</h2>
	<template v-if="resultsTX && Object.keys(resultsTX).length">
		<div v-if="isMainnet" class="link-container text-left">
			<p v-if="resultsTXIsContract">
				<a :href="`https://sonar.warp.cc/#/app/contract/${txtTxId}`" target="_blank">
					<img src="@/assets/img/warpLogoSmall.png" />
					<span>Open in SonAR</span>
				</a>
			</p>
			<p>
				<a :href="`https://viewblock.io/arweave/tx/${txtTxId}`" target="_blank">
					<img src="@/assets/img/miniViewblock.png" />
					<span>Open in Viewblock</span>
				</a>
			</p>
			<p>
				<a :href="`https://arweave.net/${txtTxId}`" target="_blank">
					<img class="invert-colors" src="@/assets/img/arweaveSmall.png" />
					<span>Open in Arweave</span>
				</a>
			</p>
		</div>
		<table class="table">
			<thead>
				<tr>
					<th style="width: 20%">
						Key
					</th>
					<th style="width: 80%;">
						Value
					</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="k of Object.keys(resultsTX)" :key="k">
					<td style="width: 20%">
						{{ k }}
					</td>
					<td style="width: 80%;">
						<pre>{{ resultsTX[k] }}</pre>
					</td>
				</tr>
			</tbody>
		</table>
	</template>
	<template v-if="resultsByAddress && resultsByAddress.length">
		<div v-for="(r, rAIndex) of resultsByAddress" :key="r._id">
			<p>
				<strong>TX {{ rAIndex + 1 }}:</strong><br>
				<span>{{ r._id }}</span>
			</p>
			<div v-if="isMainnet" class="link-container text-left">
				<p v-if="txIsContract(r._tags)">
					<a :href="`https://sonar.warp.cc/#/app/contract/${r._id}`" target="_blank">
						<img src="@/assets/img/warpLogoSmall.png" />
						<span>Open in SonAR</span>
					</a>
				</p>
				<p>
					<a :href="`https://viewblock.io/arweave/tx/${r._id}`" target="_blank">
						<img src="@/assets/img/miniViewblock.png" />
						<span>Open in Viewblock</span>
					</a>
				</p>
				<p>
					<a :href="`https://arweave.net/${r._id}`" target="_blank">
						<img class="invert-colors" src="@/assets/img/arweaveSmall.png" />
						<span>Open in Arweave</span>
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
							<pre>{{ r[k] }}</pre>
						</td>
					</tr>
				</tbody>
			</table>
			<hr>
		</div>
		<div class="text-center">
			<button
				class="more-results-btn primary"
				:disabled="loadingSearch">
				<span>Load next results</span>
			</button>
		</div>
	</template>
	<template v-if="resultsByTags && resultsByTags.length">
		<div v-for="r of resultsByTags" :key="r._id">
			<p>
				<strong>TX:</strong>&nbsp;<span>{{ r._id }}</span>
			</p>
			<div v-if="isMainnet" class="link-container text-left">
				<p v-if="txIsContract(r._tags)">
					<a :href="`https://sonar.warp.cc/#/app/contract/${r._id}`" target="_blank">
						<img src="@/assets/img/warpLogoSmall.png" />
						<span>Open in SonAR</span>
					</a>
				</p>
				<p>
					<a :href="`https://viewblock.io/arweave/tx/${r._id}`" target="_blank">
						<img src="@/assets/img/miniViewblock.png" />
						<span>Open in Viewblock</span>
					</a>
				</p>
				<p>
					<a :href="`https://arweave.net/${r._id}`" target="_blank">
						<img class="invert-colors" src="@/assets/img/arweaveSmall.png" />
						<span>Open in Arweave</span>
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
							<pre>{{ r[k] }}</pre>
						</td>
					</tr>
				</tbody>
			</table>
			<hr>
		</div>
	</template>
	
	<p 
		class="no-results"
		v-if="(!resultsTX || Object.keys(resultsTX).length <= 0) && 
					(!resultsByAddress || resultsByAddress.length <= 0) && 
					(!resultsByTags || resultsByTags.length <= 0) && 
					!loadingSearch">
		No results.
	</p>
	<div 
		class="no-results text-center"
		v-if="loadingSearch">
		<div
		class="lds-ring lds-ring-small"
		v-if="loadingSearch"><div></div><div></div><div></div><div></div></div>
		<span>Loading ...</span>
	</div>
	
</div>
</template>

<script setup lang="ts">
import {ref, computed, reactive} from 'vue';
import DefaultIcon from '@/components/atomic/DefaultIcon';
import { ArweaveWrapper, arweaveNetworks } from '@/core/ArweaveWrapper';
import { ArDBWrapper, ArDBTag } from '@/core/ArDBWrapper';
import { createToast } from 'mosha-vue-toastify';
const props = defineProps({
	mainAddress: String,
	login: Object,
	tx: String
});

const txtTxId = ref('');
const txtAddress = ref('');
const txtResLimit = ref(5);
const txtResLimitTags = ref(5);
const selSearchMethod = ref('tx');
const selNetwork = ref('arweave-mainnet');
const loadingSearch = ref(false);
const resultsTX = ref({});
const resultsTXIsContract = ref(false);
const resultsByAddress = ref([]);
const resultsByTags = ref([]);
const rdFilter = ref('');
const rdSortingOrderByAddress = ref('HEIGHT_DESC');
const tagsList = reactive<Array<{name: string, values: string}>>([]);
const mainAddress = ref(props.login.mainAddress);

const networks = computed(() => {
	return arweaveNetworks;
});

const searchByTX = async (tx: string) => {
	if (!tx) {
		return;
	}
	resultsTX.value = {};
	resultsByAddress.value = [];
	resultsByTags.value = [];
	loadingSearch.value = true;
	resultsTXIsContract.value = false;
	try {
		const arweaveWrapper = new ArweaveWrapper(selNetwork.value);
		const arweave = arweaveWrapper.arweave;
		const ardbWrapper = new ArDBWrapper(arweave);
		const tmpRes = await ardbWrapper.findOneTx(tx);

		if (tmpRes) {
			resultsTX.value = tmpRes;
			resultsTX.value._tags.forEach(tag => {
				const key = tag.name ? tag.name : '';
				const value = tag.value ? tag.value : '';
				if (key == 'App-Name' && value == 'SmartWeaveContract') {
					resultsTXIsContract.value = true;
				}
			});
		}

	} catch (err) {
		console.error('searchByTx', err);
		const errorMsg = 'No results found.';
		createToast(`${errorMsg}`,
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
	const sortOrder = rdSortingOrderByAddress.value;
	try {
		const tags: ArDBTag[] = [];
		const arweaveWrapper = new ArweaveWrapper(selNetwork.value);
		const arweave = arweaveWrapper.arweave;
		const ardbWrapper = new ArDBWrapper(arweave);

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
		resultsByAddress.value = await ardbWrapper.findFromOwners(
			address, limit, tags, sortOrder
		);

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
		const key = tag.name ? tag.name : '';
		const value = tag.value ? tag.value : '';
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
	const owners = [];
	resultsByAddress.value = [];
	resultsTX.value = {};
	resultsByTags.value = [];
	loadingSearch.value = true;
	try {
		const tags: ArDBTag[] = [];
		const arweaveWrapper = new ArweaveWrapper(selNetwork.value);
		const arweave = arweaveWrapper.arweave;
		const ardbWrapper = new ArDBWrapper(arweave);

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

		resultsByTags.value = await ardbWrapper.findFromOwners(owners, limit, tags);

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
	const arweaveWrapper = new ArweaveWrapper(selNetwork.value);
	return arweaveWrapper.onMainnet();
};

const resetResults = () => {
	resultsTX.value = {};
	resultsByAddress.value = [];
	resultsByTags.value = [];
	loadingSearch.value = false;
	resultsTXIsContract.value = false;
}

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
	line-height: 14px;
	font-size: 14px;
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
	width: 60%;
	height: 100%;
	line-height: 16px;
	border: 0;
	cursor: pointer;
	font-size: 14px;
	text-align: center;
  vertical-align: middle;
	color: gray;
	cursor: default;
	background-color: rgba(0,0,0,0.1);
	border-radius: 6px;
}

.search-menu li button.primary {
	background-color: var(--app-toolbar-panel-title-bgcolor);
  color: var(--app-toolbar-panel-title-color);
  cursor: pointer;
}

.search-menu li button span {
	font-size: 14px;
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

.table pre {
  white-space: pre-wrap; 

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

.link-container img {
	width: 25px;
}
.link-container span {
	margin-left: 12px;
	line-height: 16px;
}

.no-results {
	font-size: 12px;
	margin-bottom: 20px;
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

.more-results-btn {
	width: 100%;
	height: 100%;
	line-height: 12px;
	border: 0;
	cursor: pointer;
	font-size: 16px;
	padding: 12px;
	text-align: center;
  vertical-align: middle;
	color: gray;
	cursor: default;
	background-color: rgba(0,0,0,0.1);
}

.more-results-btn.primary {
	background-color: var(--app-toolbar-panel-title-bgcolor);
  color: var(--app-toolbar-panel-title-color);
  cursor: pointer;
}

.more-results-btn span {
	font-size: 16px;
	margin-left: 6px;
	line-height: 14px;

}

.more-results-btn:hover {
	background-color: rgba(0,0,0,0.3);
}

</style>