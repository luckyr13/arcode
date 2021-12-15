<template>
<div class="arcode-main-toolbar-panel-title">
	Wallet manager
</div>
<ul class="accounts-menu">
	<li>
		<Icon class="close-icon"
			icon="codicon:file" />
		<span>New File</span>
	</li>
	<li>
		<Icon class="close-icon"
			icon="codicon:folder-opened" />
		<span>Open File...</span>
	</li>
</ul>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';

</script>

<style scoped lang="scss">
.arcode-main-toolbar-panel-title {
	height: 28px;
	line-height: 28px;
	font-size: 12px;
	padding-left: 20px;
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