<template>
<div class="arcode-console-tab">
	<Icon icon="codicon:terminal" /> <span>Console</span>
</div>

</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';

</script>

<style scoped lang="scss">
	
.arcode-console-tab {
	height: 24px;
	line-height: 24px;
	padding-left: 20px;
	cursor: pointer;
}
.arcode-console-tab .iconify {
	font-size: 12px;

}
.arcode-console-tab span {
	font-size: 10px;
	margin-left: 2px;
	line-height: 24px;
}
</style>