<template>
<div class="arcode-main-toolbar-panel-title panel-title">
	File Explorer
</div>
<ul class="file-menu">
	<li @click="workspace.addEditor($event)">
		<Icon class="close-icon"
			icon="codicon:file" />
		<span>New File</span>
	</li>
	<li @click="openFile(workspace.addEditor($event, false, 'Open File. Coming soon ...'))">
		<Icon class="close-icon"
			icon="codicon:folder-opened" />
		<span>Open File...</span>
	</li>
</ul>
<div class="arcode-main-toolbar-panel-title subheader">
	+ Files in workspace
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
//import {EditorView} from "@codemirror/view";
import { Icon } from '@iconify/vue';

const props = defineProps({
	workspace: Object
});
/*
const getEditorData = (editorV: EditorView) => {
	let data = '';
	if (editorV) {
		data = editorV.state.doc;
	}
	alert(data);
};
*/
const openFile = (data) => {
	console.log(data)
};

</script>

<style scoped lang="scss">
$title-height: 28px;
.panel-title {
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
	cursor: pointer;
}

.file-list li:hover {
	background-color: rgba(0,0,0,0.3);
}

.file-list li.active {
	background-color: rgba(0,0,0,0.3);
}


.file-menu {
	padding: 0px;
	margin-top: 0px;
	margin-bottom: 0px;
}
.file-menu li {
	padding: 10px;
	font-size: 12px;
	line-height: 12px;
	list-style: none;
	cursor: pointer;
}
.file-menu li:hover {
	background-color: rgba(0,0,0,0.3);
}

.subheader {
	font-size: 12px;
	padding-left: 10px;
	margin-top: 20px;
	margin-bottom: 0px;
}

</style>