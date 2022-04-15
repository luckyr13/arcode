<template>
	<div class="arcode-status-bar">
		<div v-if="workspace && workspace.getCurrentEditorId() >= 0">
			{{ statusBarText }}
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Workspace from '@/components/composed/Workspace.vue';

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

const statusBarText = computed(() => {
	const workspace = props.workspace;
	const content = workspace.getCurrentContent();
	const fname = getEditorsFilename(workspace.getCurrentEditorId(), workspace);
	const numChar = content.length;
	const numLines = content.match(/\n/g) ?
		content.match(/\n/g).length + 1 :
		1;
	const s = `Current file: ${fname} | ${numChar} characters | ${numLines} line${numLines > 1 ? 's' : ''}`;
	return s;
});



</script>

<style scoped lang="scss">
	.arcode-status-bar {
		height: 22px;
		font-size: 11px;
		line-height: 22px;
		width: 100%;
		padding-left: 12px;
	}
</style>