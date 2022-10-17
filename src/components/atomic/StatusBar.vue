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
  const numBytes = new Blob([content]).size;
  const pluralLines = numLines != 1 ? 's' : '';
  const pluralBytes = numBytes != 1 ? 's' : '';
  const pluralCharacters = numChar != 1 ? 's' : '';
	const s = `Current file: ${fname} | ${numChar} character${pluralCharacters} | ${numBytes} byte${pluralBytes} | ${numLines} line${pluralLines}`;
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