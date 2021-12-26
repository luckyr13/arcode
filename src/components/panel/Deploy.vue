<template>
<div class="arcode-main-toolbar-panel-title">
	Deploy contract
</div>
<div class="deploy-container">
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
	<ul class="deploy-menu">
		<li>
			<button
				:class="{primary: selDeployFileStateLocation && selDeployFileContractLocation}" 
				:disabled="!selDeployFileStateLocation || !selDeployFileContractLocation"
				@click="deployContract()">
				<Icon class="icon-btn" icon="codicon-rocket" /><span>Deploy Now</span>
			</button>
		</li>
	</ul>
</div>

</template>

<script setup lang="ts">
import { ref } from 'vue';
import Icon from '@/components/atomic/Icon';

const selDeployFileContractLocation = ref('');
const selDeployFileStateLocation = ref('');
const props = defineProps({
	workspace: Object
});
const deployContract = () => {
	alert('Coming soon...')
};


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
        display: table-cell;
        vertical-align: middle;
}

.deploy-menu li button.primary {
	background-color: var(--app-toolbar-panel-title-bgcolor);
  color: var(--app-toolbar-panel-title-color);
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

</style>