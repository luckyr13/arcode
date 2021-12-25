<template>
<div class="arcode-main-toolbar-panel-title">
	Wallet manager
</div>
<div class="accounts-container">
	<h4>Login option:</h4>
	<ul class="accounts-menu">
		<li>
			<button>ArConnect</button>
		</li>
		<li>
			<button>Arweave.app</button>
		</li>
		<li>
			<button>Upload your keyfile</button>
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
	padding: 0px;
	height: 32px;
	list-style: none;
}
.accounts-menu li button {
	width: 100%;
	height: 100%;
	line-height: 12px;
	border: 0;
	cursor: pointer;
	text-align: left;
	font-size: 12px;
	background-color: inherit;
	color: inherit;
}
.accounts-menu li button:hover {
	width: 100%;
	height: 100%;
	line-height: 12px;
	background-color: rgba(0,0,0,0.3);
}
.close-icon {
	float: right;
	cursor: pointer;
	line-height: 12px;
}
</style>