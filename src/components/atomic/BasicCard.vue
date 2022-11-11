<template>
	<div class="card fadeIn">
		<h2 class="name">{{ name }}</h2>
		<p class="tx">
			<ArweaveAddress
				:address="id"
				:isAddress="false">
				<template v-slot:label><strong>Id:</strong></template>
			</ArweaveAddress>
		</p>
		<p class="tx" v-if="dataSize">
			<strong>Data size: </strong> {{ dataSize }} bytes / {{ byte2kb(dataSize) }} kb / {{ kb2mb(byte2kb(dataSize)) }} mb
		</p>
		<p class="tx" v-if="dataSize && kb2mb(byte2kb(dataSize)) >= 1">
			<strong class="warning">Overflow Warning!</strong> Data size is too big.
		</p>
		<p class="owner">
			<ArweaveAddress
				:address="owner"
				:isAddress="true"
				:showProfileImage="true"
				:showHandleInAddress="true">
				<template v-slot:label><strong>Owner:</strong></template>
			</ArweaveAddress>
		</p>
		<p class="deployingDate"><strong>Created at:</strong> {{ deployingDate }}</p>
		<p class="description">{{ description }}</p>
		<p class="actions">
			<router-link 
				class="btn"
				:to="`/?workspace=${ id }`"
				target="_blank">
				OPEN IN ArCode
			</router-link>
		</p>
	</div>
</template>
<script setup lang="ts">
import ArweaveAddress from '@/components/atomic/ArweaveAddress.vue'
// eslint-disable-next-line
const props = defineProps({
	id: String,
	name: String,
	description: String,
	owner: String,
	deployingDate: String,
	dataSize: Number
});

function byte2kb(bytes: number) {
	return (bytes / 1024).toFixed(4);
}

function kb2mb(kb: number) {
	return (kb / 1024).toFixed(4);
}
</script>
<style scoped>
:root {
  --color-background: #1E1E1E;
  --color-text: #FFFFFF;
  --card-color-background: #1E1E1E;
  --card-color-text: #FFFFFF;
  
  --color-neon-pink: #FF10F0;
  --color-neon-green: #39ff14;
  --color-neon-green-rgba: rgba(57,255,20,0.2);
  --color-neon-pink-rgba: rgba(255,16,240,0.2);
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  font-family: 'Press Start 2P', cursive;
}

strong {
	color: var(--color-neon-pink);
}
.card {
	width: 100%;
	padding: 32px;
	background-color: var(--card-color-background);
	color: var(--card-color);
	opacity: 0.9;
	min-height: 200px;
}
.tx {
	font-size: 10px;
	margin-bottom: 12px;
}
.owner {
	font-size: 10px;
	margin-bottom: 12px;
}
.deployingDate {
	font-size: 10px;
	margin-bottom: 20px;

}
.name {
	font-size: 22px;
	margin-bottom: 14px;
	color: #FFF;
  text-shadow: 2px 2px 6px var(--color-neon-pink);
}
.description {
	font-size: 14px;
	margin-bottom: 20px;
}
.actions {
	padding: 10px;
	text-align: right;
}

.btn {
  padding: 14px;
  background-color: transparent;
  color: #FFF;
  text-align: center;
  cursor: pointer;
  text-decoration: none;
  font-size: 12px;
  border-radius: 12px;
  border: 2px solid var(--color-neon-pink);
  /* offset-x | offset-y | blur-radius | spread-radius | color */
  box-shadow: 0px 0px 6px 6px var(--color-neon-pink-rgba);
  text-shadow: 2px 2px 6px var(--color-neon-pink);
}
.btn:hover {
  border: 2px solid var(--color-neon-green);
  /* offset-x | offset-y | blur-radius | spread-radius | color */
  box-shadow: 0px 0px 6px 6px var(--color-neon-green-rgba);
  text-shadow: 2px 2px 6px var(--color-neon-green);
}

.btnDisabled, .btnDisabled:hover {
  color: grey;
  border: 2px solid grey !important;
  box-shadow: 0px 0px 6px 6px grey !important;
  text-shadow: 2px 2px 6px grey !important;
  cursor: default;
}

.actions .btn {
  font-size: 8px !important;
}

@media (min-width: 700px) {
  .actions .btn {
    font-size: 12px !important;
  }
}

.warning {
	color:  red;
}
</style>