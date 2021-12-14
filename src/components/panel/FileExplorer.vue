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
	<li @click="openFile('txt_file_openFile')">
		<Icon class="close-icon"
			icon="codicon:folder-opened" />
		<span>Open File...</span>
		<input type="file" 
			id="txt_file_openFile" 
			style="display: none" 
			accept=".json,application/json,.js,text/javascript" 
			@change="openFile_helper($event, workspace)">
	</li>
</ul>
<div class="arcode-main-toolbar-panel-title subheader">
	Files in workspace
</div>
<ul class="file-list" v-if="workspace">
	<li v-for="editor in workspace.editors" 
		:key="editor.id" 
		:class="{ active: editor.active }"
		@click="workspace.selectEditor(editor.id, $event)">
		<span>{{ editor.name }}</span>
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
import Workspace from '@/components/composed/Workspace.vue';

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

const openFile = (inputId: string) => {
	if (document.getElementById(inputId)) {
		document.getElementById(inputId).click();
	}
}

const openFile_helper = (inputEvent: Event, workspace: Workspace): Promise<string> => {
  let method = new Promise<string>((resolve, reject) => {
     // Transform .json file into key
     try {
      const file = inputEvent.target.files.length ? 
        inputEvent.target.files[0] : null;

      const freader = new FileReader();
      freader.onload = async () => {
        const res = freader.result;
        const fname = file.name;
        workspace.addEditor(inputEvent, false, res, fname)
        inputEvent.target.value = '';
        resolve(res);
      }
      freader.onerror = () => {
        throw Error('Error reading file');
      }
      freader.readAsText(file);

     } catch (error) {
			console.log('Error:', error);
			reject(error);
     }
    
  });

  return method;

}

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
	overflow: hidden;

}

.file-list li span {
	text-overflow: ellipsis;
  white-space: nowrap;
	width: 80%;
	float: left;
	display: block;
	overflow: hidden;
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
	padding-top: 4px;
	padding-bottom: 4px;
	margin-top: 20px;
	margin-bottom: 0px;
}


</style>