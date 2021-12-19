<template>
<div class="arcode-main-toolbar-panel-title panel-title">
	File Explorer
</div>
<ul class="file-menu">
	<li @click="workspace.addEditor($event)">
		<Icon class="menu-icon"
			icon="codicon:new-file" />
		<span>New File</span>
	</li>
	<li @click="openFile('txt_file_openFile')">
		<Icon class="menu-icon"
			icon="codicon:folder-opened" />
		<span>Open File...</span>
		<input type="file" 
			id="txt_file_openFile" 
			style="display: none" 
			accept=".json,application/json,.js,text/javascript" 
			@change="openFile_helper($event, workspace)">
	</li>
	<li @click="workspace.addFolder('/', 'test')">
		<Icon class="menu-icon"
			icon="codicon:new-folder" />
		<span>Add Folder</span>
	</li>
	<li @click="showModal = true">
		<Icon class="menu-icon"
			icon="codicon:mirror" />
		<span>Load Contract from TX</span>
	</li>
</ul>
<FileList v-if="workspace" :workspace="workspace" :fileTree="workspace.getFileTree()" />
<transition name="modal">
<Modal v-if="showModal" @close="showModal = false">
	<template v-slot:header>
		<h3>Load Contract from TX</h3>
	</template>
</Modal>
</transition>
</template>

<script setup lang="ts">
//import {EditorView} from "@codemirror/view";
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import Workspace from '@/components/composed/Workspace.vue';
import Modal from '@/components/atomic/Modal.vue';
import FileList from '@/components/atomic/FileList.vue';

const showModal = ref(false);
const props = defineProps({
	workspace: Object
});

const openFile = (inputId: string) => {
	if (document.getElementById(inputId)) {
		document.getElementById(inputId).click();
	}
};
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
.menu-icon {
	float: right;
	cursor: pointer;
	line-height: 15px;
	font-size: 15px;
	margin-left: 4px;
}
.fd-icon {
	margin-right: 6px;
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
}
.file-menu li:hover {
	background-color: rgba(0,0,0,0.3);
	cursor: pointer;
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