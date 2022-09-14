<template>
<div class="arcode-main-toolbar-panel-title">
	Help and info
</div>
<div class="links-container">
	<h4>Useful Links</h4>
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
			<a tabindex="0" href="https://sonar.warp.cc/" target="_blank">SonAR Scanner</a>
		</li>
		<li>
			<a tabindex="0" href="https://github.com/warp-contracts/warp" target="_blank">Warp SDK</a>
		</li>
		<li>
			<a tabindex="0" href="https://github.com/textury/arlocal" target="_blank">arlocal GitHub</a>
		</li>
		<li>
			<a tabindex="0" href="https://arweave.app" target="_blank">Arweave.app Wallet</a>
		</li>
		<li>
			<a tabindex="0" href="https://arconnect.io" target="_blank">ArConnect Wallet</a>
		</li>
		<li>
			<a tabindex="0" href="https://arwiki.wiki" target="_blank">Arweave wiki: ArWiki</a>
		</li>
	</ul>
	<template v-if="Object.keys(tokenState).length > 0">
		<h4>Usage fees</h4>
		<ul class="instructions sm-text">
			<li>
				Contract deployment/write interaction: {{ appFeeInAr }} AR
			</li>
			<li>
				VIP users: Use ArCode without extra fees holding a minimum {{ vipMinimumBalance }} $CODE balance.
			</li>
		</ul>
	</template>
	<template  v-else>
		Error loading Community contract!
	</template>
	<h4>
		Common ArCode Problems
	</h4>
	<p class="sm-text">
		<strong style="color: red">Brave Browser and AdBlock users.</strong> Some users have reported issues when trying to connect with ArLocal on localhost (net::ERR_BLOCKED_BY_CLIENT).
	</p>
	<p class="sm-text">
		To solve this, please follow the next steps:
	</p>
	<ul class="instructions sm-text">
		<li>Navigate to: brave://adblock/</li>
		<li>
			Add the next filter:
		</li>
		<li style="list-style: none">
			@@||localhost^$domain=arcode.studio
		</li>
	</ul>

	<h4>
		ArCode Warranty Info
	</h4>
	<h4 class="text-center">
		No Warranty
	</h4>
	<p class="text-center sm-text">
		"As-Is". The Software is provided "as is," with all faults, defects, bugs, and errors.
	</p>

</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ArweaveWrapper } from '@/core/ArweaveWrapper';

const arweaveWrapper = new ArweaveWrapper();
const arweave = arweaveWrapper.arweave;

const props = defineProps({
	tokenState: Object,
	mainAddress: String
});
const contractSettings = computed(() => {
	const settings = props.tokenState.settings ? props.tokenState.settings : [];
	return new Map(settings);
});
const appFeeInWinston = computed(() => {
	return contractSettings.value.get('appFeeInWinston');
});
const appFeeInAr = computed(() => {
	return parseFloat(arweave.ar.winstonToAr(appFeeInWinston.value));
});
const vipMinimumBalance = computed(() => {
	return contractSettings.value.get('vipMinimumBalance');
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
.instructions  {
	padding: 10px;
}
.sm-text {
	font-size: 11px;
}
</style>