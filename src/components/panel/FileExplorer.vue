<template>
<div class="arcode-main-toolbar-panel-title">
	File Explorer
</div>
<div v-if="workspace.editors.length">
	<div v-for="editor in workspace.editors" :key="editor.id" 
		@click="getEditorData(workspace.getEditorData(editor.id))">
		{{ editor.name }}
	</div>
</div>
</template>

<script setup lang="ts">
import {EditorView} from "@codemirror/view";
import { } from '';
const props = defineProps({
	workspace: Object
});
const getEditorData = (editorV: EditorView) => {
	let data = '';
	if (editorV) {
		data = editorV.state.doc;
	}
	alert(data);
};

</script>

<style scoped lang="scss">
.arcode-main-toolbar-panel-title {
	height: 28px;
	line-height: 28px;
	font-size: 12px;
	padding-left: 20px;
}
</style>