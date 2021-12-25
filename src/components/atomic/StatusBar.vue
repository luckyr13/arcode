<template>
	<div class="arcode-status-bar">
		<div v-if="workspace && workspace.getCurrentEditorId() >= 0">
			Current file: {{ getEditorsFilename(workspace.getCurrentEditorId(), workspace) }}, 
			{{ workspace.getCurrentContent().length }} characters
		</div>
	</div>
</template>

<script setup lang="ts">
import Workspace from '@/components/composed/Workspace.vue';
import { computed } from 'vue';

const props = defineProps({
	workspace: Object
});

const getEditorsFilename = (editorId: number, workspace: Workspace): string => {
	const i = workspace.editors.findIndex(ed => ed.id == editorId);
	let name = '';
	if (workspace && workspace.editors && workspace.editors[i] &&
			workspace.editors[i].name) {
		name = workspace.editors[i].name;
	}
	return name;
};



</script>

<style scoped lang="scss">
	.arcode-status-bar {
		height: 22px;
		font-size: 12px;
		line-height: 22px;
		width: 100%;
	}
</style>