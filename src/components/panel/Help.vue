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