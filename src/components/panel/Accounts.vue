<template>
<div class="arcode-main-toolbar-panel-title">
	Wallet manager
</div>
<div class="accounts-container">
	<h4>Login option:</h4>
	<ul class="accounts-menu">
		<li>
			<span>ArConnect</span>
		</li>
		<li>
			<span>Arweave.app</span>
		</li>
		<li>
			<span>Upload your keyfile</span>
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
.accounts-container {
	padding: 20px;
	font-size: 12px;
}
.accounts-menu {
	padding: 0px;
	margin-top: 0px;
	margin-bottom: 0px;
}
.accounts-menu li {
	padding: 10px;
	font-size: 12px;
	line-height: 12px;
	list-style: none;
	cursor: pointer;
}
.accounts-menu li:hover {
	background-color: rgba(0,0,0,0.3);
}
.close-icon {
	float: right;
	cursor: pointer;
	line-height: 12px;
}
</style>