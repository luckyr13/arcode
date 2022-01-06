<template>
<div class="arcode-main-toolbar-panel-title">
	Help and info
</div>
<div class="links-container">
	<h4>Useful Links:</h4>
	<ul class="links-menu">
		<li>
			<a tabindex="0" href="https://github.com/luckyr13/arcode" target="_blank">ArCode GitHub</a>
		</li>
		<li>
			<a tabindex="0" href="https://community.xyz/#XFZxNNpgb043Doa7-4sra5dnbBB5RkOHRyQJ_YOzLAg" target="_blank">ArCode PSCommunity</a>
		</li>
		<li>
			<a tabindex="0" href="https://arweave.org" target="_blank">Arweave.org</a>
		</li>
		<li>
			<a tabindex="0" href="https://github.com/redstone-finance/redstone-smartcontracts" target="_blank">RedStone SmartContracts SDK</a>
		</li>
		<li>
			<a tabindex="0" href="https://arweave.app" target="_blank">Arweave.app Wallet</a>
		</li>
		<li>
			<a tabindex="0" href="https://arconnect.io" target="_blank">ArConnect Wallet</a>
		</li>
		<li>
			<a tabindex="0" href="https://arwiki.wiki" target="_blank">ArWiki</a>
		</li>
	</ul>
	<template v-if="Object.keys(tokenState).length > 0">
		<h4>dApp Usage cost:</h4>
		<ul class="links-menu">
			<li>
				- Contract deployment fee: {{ appFeeInAr }} AR
			</li>
			<li>
				- Contract write interaction fee: {{ appFeeInAr }} AR
			</li>
			<li>
				- You can use this dApp for free as long as you have a minimum balance of {{ vipMinimumBalance }} $CODE tokens.
			</li>
		</ul>
		<p><strong>Wallet:</strong> {{mainAddress}}</p>
		<p><strong>Your balance:</strong> {{balance}} $CODE</p>
	</template>
	<template  v-else>
		Error loading Community contract!
	</template>
</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ArweaveHandler } from '@/core/ArweaveHandler';
import { Login } from '@/core/Login';
import { UserSettings } from '@/core/UserSettings';

const arweave = new ArweaveHandler();
const userSettings = new UserSettings();
const settings = userSettings.settings;
const login = new Login(settings.stayLoggedIn);
const mainAddress = ref(login.mainAddress);

const props = defineProps({
	tokenState: Object
});
const contractSettings = computed(() => {
	const settings = props.tokenState.settings ? props.tokenState.settings : [];
	return new Map(settings);
});
const appFeeInWinston = computed(() => {
	return contractSettings.value.get('appFeeInWinston');
});
const appFeeInAr = computed(() => {
	return arweave.arweave.ar.winstonToAr(appFeeInWinston.value);
});
const vipMinimumBalance = computed(() => {
	return parseInt(contractSettings.value.get('vipMinimumBalance'));
});
const balance = computed(() => {
	const balances = props.tokenState.balances ? props.tokenState.balances : {};
	const res = Object.prototype.hasOwnProperty.call(balances, mainAddress.value) ? 
		parseInt(props.tokenState.balances[mainAddress.value]) : 0;
	return res;
});
</script>

<style scoped lang="scss">
.arcode-main-toolbar-panel-title {
	height: 28px;
	line-height: 28px;
	font-size: 12px;
	padding-left: 20px;
}
.links-container {
	padding: 10px;
	font-size: 12px;
}
.links-menu {
	padding: 0px;
	margin-top: 0px;
	margin-bottom: 40px;
}
.links-menu li {
	padding: 0px;
	height: 32px;
	list-style: none;
	width: 100%;
}

.links-menu li a {
	width: 100%;
	height: 100%;
	line-height: 32px;
	border: 0;
	cursor: pointer;
	text-align: left;
	font-size: 12px;
	background-color: inherit;
	color: inherit;
	display: block;
	padding-left: 10px;

}

.links-menu li a:hover {
	background-color: rgba(0,0,0,0.3);
}
.close-icon {
	float: right;
	cursor: pointer;
	line-height: 12px;
}
a {
	color: inherit;
}
</style>