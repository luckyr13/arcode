<template>
<div class="arcode-main-toolbar-panel-title">
	Arweave Explorer
</div>
<div class="search-container">
	<div class="form-input">
		<label>Method</label>
		<select v-model.trim="selSearchMethod">
			<option value="tx">Search by TX</option>
			<option value="address">Search by Address</option>
		</select>
	</div>
	<template v-if="selSearchMethod == 'tx'">
		<div class="form-input">
			<label>TX ID</label>
			<input type="text" v-model.trim="txtTxId" @keyup.enter="searchByTX(txtTxId)">
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
			<label>Arweave Address</label>
			<input type="text" v-model.trim="txtAddress">
		</div>
		<div class="form-radio">
			<label>
				<input type="radio" checked name="addressFilter" value="" v-model.trim="rdFilter">
				All TXs
			</label>
			<label>
				<input type="radio" name="addressFilter" value="contracts" v-model.trim="rdFilter">
				Only Smart Contracts
			</label>
			<label>
				<input type="radio" name="addressFilter" value="manifest" v-model.trim="rdFilter">
				Only Manifest Files
			</label>
			<label>
				<input type="radio" name="addressFilter" value="textFiles" v-model.trim="rdFilter">
				Only Text Files
			</label>
			<label>
				<input type="radio" name="addressFilter" value="mediaFiles" v-model.trim="rdFilter">
				Only Media Files
			</label>
		</div>

		<ul class="search-menu">
			<li>
				<button
					:class="{primary: (txtAddress) && !loadingSearch}" 
					:disabled="(!txtAddress || !selSearchMethod) || loadingSearch"
					@click="searchByAddress(txtAddress)">
					<Icon class="icon-btn" icon="codicon-search" /><span>Search</span>
				</button>
			</li>
		</ul>
	</template>
	<h5>Results:</h5>
	<template v-if="resultsTX && Object.keys(resultsTX).length">
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
		<div class="link-container text-left">
			View more: 
			<a :href="`https://viewblock.io/arweave/tx/${txtTxId}`" target="_blank">
				{{ `https://viewblock.io/arweave/tx/${txtTxId}` }}
			</a> 
		</div>
	</template>
	<template v-if="resultsByAddress.length">
		<div v-for="r of resultsByAddress" :key="r._id">
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
			<div class="link-container text-left">
				View more: 
				<a :href="`https://viewblock.io/arweave/tx/${r._id}`" target="_blank">
					{{ `https://viewblock.io/arweave/tx/${r._id}` }}
				</a> 
			</div>
			<hr>
		</div>
	</template>
	<p 
		class="no-results"
		v-if="(!resultsTX || Object.keys(resultsTX).length <= 0) && (!resultsByAddress || resultsByAddress.length <= 0)">
		No results.
	</p>

</div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue';
import Icon from '@/components/atomic/Icon';
import { ArweaveHandler } from '@/core/ArweaveHandler';
import { createToast } from 'mosha-vue-toastify';

const txtTxId = ref('');
const txtAddress = ref('');
const selSearchMethod = ref('');
const loadingSearch = ref(false);
const resultsTX = ref({});
const resultsByAddress = ref([]);
const arweave = new ArweaveHandler();
const rdFilter = ref('');

onMounted(() => {
	selSearchMethod.value = 'tx'
	txtTxId.value = '';
	txtAddress.value = '';
});

const searchByTX = async (tx: string) => {
	if (!tx) {
		return;
	}
	resultsTX.value = {};
	resultsByAddress.value = [];
	loadingSearch.value = true;
	try {
		resultsTX.value = await arweave.ardb.search('transaction').id(tx).findOne();
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


const searchByAddress = async (address: string, limit=100) => {
	if (!address) {
		return;
	}
	resultsByAddress.value = [];
	resultsTX.value = {};
	loadingSearch.value = true;
	try {
		const tags = [];

		if (rdFilter.value === 'contracts') {
			tags.push({
        name: 'App-Name',
        values: ['SmartWeaveContract'],
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
		} else if (rdFilter.value === 'textFiles') {
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
					'image/webp',
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

</style>