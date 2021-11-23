<template>
	<div class="arcode-main-toolbar">
		<div class="menu">
		</div>
		<div class="container">
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'Toolbar'
});
</script>

<style scoped lang="scss">
$toolbar-width: 48px;
$toolbar-container-width: 140px;

.arcode-main-toolbar {
	height: 100%;
	width: 100%;
}
.menu {
	height: 100%;
	width: $toolbar-width;
	float: left;
}
.container {
	width: $toolbar-container-width;
	height: 100%;
	float: left;
}

</style>