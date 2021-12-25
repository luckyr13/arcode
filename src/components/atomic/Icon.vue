<template>
	<div class="codicon" :class="icon">
	</div>
</template>

<script setup lang="ts">
const props = defineProps({
	icon: String
});


</script>

<style scoped lang="scss">
	.codicon {
		height: 100%;
		line-height: 100%;
		width: 100%;
	}
</style>