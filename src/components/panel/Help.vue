<template>
<div class="arcode-main-toolbar-panel-title">
	Help and info
</div>
<div class="links-container">
	<h4>Useful Links:</h4>
	<ul class="links-menu">
		<li>
			<a href="https://github.com/luckyr13/arcode" target="_blank">ArCode GitHub</a>
		</li>
		<li>
			<a href="https://arweave.org" target="_blank">Arweave.org</a>
		</li>
		<li>
			<a href="https://github.com/redstone-finance/redstone-smartcontracts" target="_blank">RedStone SmartContracts SDK</a>
		</li>
		<li>
			<a href="https://arweave.app" target="_blank">Arweave.app Wallet</a>
		</li>
		<li>
			<a href="https://arconnect.io" target="_blank">ArConnect Wallet</a>
		</li>
		<li>
			<a href="https://arwiki.wiki" target="_blank">ArWiki</a>
		</li>
	</ul>
</div>
</template>

<script setup lang="ts">
// import { Icon } from '@iconify/vue';

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
	margin-bottom: 0px;
}
.links-menu li {
	padding: 10px;
	font-size: 12px;
	line-height: 12px;
	list-style: none;
	cursor: pointer;
}
.links-menu li:hover {
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