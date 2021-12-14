<template>
<div class="arcode-main-toolbar-panel-title">
	File Explorer
</div>
<ul class="file-list" v-if="workspace">
	<li v-for="editor in workspace.editors" 
		:key="editor.id" 
		:class="{ active: editor.active }"
		@click="workspace.selectEditor(editor.id, $event)">
			{{ editor.name }}
		<Icon 
			class="close-icon" 
			@click="workspace.deleteEditor(editor.id, $event)"
			icon="codicon:close" />
	</li>
</ul>
</template>

<script setup lang="ts">
import {EditorView} from "@codemirror/view";
import { Icon } from '@iconify/vue';

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
$title-height: 28px;
.arcode-main-toolbar-panel-title {
	height: $title-height;
	line-height: $title-height;
	font-size: 12px;
	padding-left: 20px;
}
.close-icon {
	float: right;
	cursor: pointer;
	line-height: 12px;
}
.file-list {
	padding: 0px;
	margin-top: 0px;
	margin-bottom: 0px;
}
.file-list li {
	padding: 10px;
	font-size: 12px;
	line-height: 12px;
	list-style: none;
}

.file-list li.active {
	background-color: rgba(0,0,0,0.3);
}
</style>