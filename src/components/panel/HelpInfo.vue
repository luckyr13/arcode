<template>
<div class="arcode-main-toolbar-panel-title">
	Help and info
</div>
<div class="links-container">
	<h4>Useful Links</h4>
	<ul class="links-menu">
		<li>
			<a tabindex="0" href="https://github.com/luckyr13/arcode" target="_blank">
				<img class="invert-colors" src="@/assets/img/social-media/github.png">
				<span>ArCode GitHub</span>
			</a>
		</li>
		<li>
			<router-link tabindex="0" to="/gallery">
				<img class="invert-colors" src="@/assets/img/arweaveSmall.png">
				<span>ArCode Gallery</span>
			</router-link>
		</li>
		<li>
			<a tabindex="0" href="https://github.com/luckyr13/arcode#common-arcode-problems" target="_blank">
				<img class="invert-colors" src="@/assets/img/social-media/github.png">
				<span>ArCode Known Issues</span>
			</a>
		</li>
		<li>
			<a tabindex="0" href="https://community.xyz/#XFZxNNpgb043Doa7-4sra5dnbBB5RkOHRyQJ_YOzLAg" target="_blank">
				<img src="@/assets/img/social-media/communitySmall.png">
				<span>ArCode Community</span>
			</a>
		</li>
		<li>
			<a tabindex="0" href="https://discord.gg/KMjZkkWrSS" target="_blank">
				<img src="@/assets/img/social-media/discord0.png">
				<span>Discord Channel</span>
			</a>
		</li>
		<li>
			<a tabindex="0" href="https://sonar.warp.cc/" target="_blank">
				<img src="@/assets/img/warpLogoSmall.png">
				<span>SonAR Scanner</span>
			</a>
		</li>
		<li>
			<a tabindex="0" href="https://github.com/warp-contracts/warp" target="_blank">
				<img src="@/assets/img/warpLogoSmall.png">
				<span>Warp SDK</span>
			</a>
		</li>
		<li>
			<a tabindex="0" href="https://github.com/textury/arlocal" target="_blank">
				<img class="invert-colors" src="@/assets/img/arweaveSmall.png">
				<span>arLocal</span>
			</a>
		</li>
		<li>
			<a tabindex="0" href="https://arwiki.wiki" target="_blank">
				<img class="invert-colors" src="@/assets/img/arweaveSmall.png">
				<span>Arweave ArWiki</span>
			</a>
		</li>
	</ul>
	<h4>Best Arweave Wallets</h4>
	<ul class="links-menu">
		<li>
			<a tabindex="0" href="https://arweave.app" target="_blank">
				<img class="invert-colors" src="@/assets/img/arweaveSmall.png">
				<span>Arweave.app Wallet</span>
			</a>
		</li>
		<li>
			<a tabindex="0" href="https://arconnect.io" target="_blank">
				<img src="@/assets/img/arconnect.png">
				<span>ArConnect Wallet</span>
			</a>
		</li>
	</ul>
	<!-- Usage fees removed 
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
	-->

	<h4>
		ArCode Warranty Info
	</h4>
	<h4 class="text-center">
		No Warranty
	</h4>
	<p class="text-center sm-text">
		"As-Is". The Software is provided "as is," with all faults, defects, bugs, and errors.
	</p>
	<h4>Powered by</h4>
	<ul class="links-menu">
		<li>
			<a tabindex="0" href="https://arweave.org" target="_blank">
				<img class="invert-colors" src="@/assets/img/arweaveSmall.png">
				<span>Arweave</span>
			</a>
		</li>
		<li>
			<a tabindex="0" href="https://spheron.network/" target="_blank">
				<img src="@/assets/img/social-media/spheronSmall.png">
				<span>Spheron</span>
			</a>
		</li>
	</ul>

</div>
</template>

<script setup lang="ts">
// import { computed } from 'vue';
// import { ArweaveWrapper } from '@/core/ArweaveWrapper';

// const arweaveWrapper = new ArweaveWrapper();
// const arweave = arweaveWrapper.arweave;
/*
const props = defineProps({
	tokenState: Object,
	mainAddress: String
});
*/
/*
const contractSettings = computed(() => {
	const settings = props.tokenState.settings ? props.tokenState.settings : [];
	return new Map(settings);
});
*/
/*
const appFeeInWinston = computed(() => {
	return contractSettings.value.get('appFeeInWinston');
});
*/
/*
const appFeeInAr = computed(() => {
	return parseFloat(arweave.ar.winstonToAr(appFeeInWinston.value));
});
*/
/*
const vipMinimumBalance = computed(() => {
	return contractSettings.value.get('vipMinimumBalance');
});
*/
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
.links-menu li a img {
	max-height: 24px;
	max-width: 24px;
	line-height: 24px;
  display: inline-block;
  vertical-align: middle;
}
.links-menu li a span {
	line-height: 32px;
  display: inline-block;
  vertical-align: middle;
  margin-left: 12px;
}
</style>