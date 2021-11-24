<template>
	<div class="arcode-status-bar">
		Status
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'StatusBar'
});


</script>

<style scoped lang="scss">
	.arcode-status-bar {
		height: 22px;
		font-size: 12px;
		line-height: 22px;
		width: 100%;
	}
</style>