<template>
<div class="arcode-main-toolbar-panel-title">
	File Explorer
</div>
<div v-if="workspace.editors.length">
	<div v-for="editor in workspace.editors" :key="editor.id">
		{{ editor.name }}
		{{ workspace.getEditorData(editor.id).state.doc }}
	</div>
</div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps({
	workspace: Object
});

</script>

<style scoped lang="scss">
.arcode-main-toolbar-panel-title {
	height: 28px;
	line-height: 28px;
	font-size: 12px;
	padding-left: 20px;
}
</style>