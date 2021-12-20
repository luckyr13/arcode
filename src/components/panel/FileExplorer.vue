<template>
<div class="arcode-main-toolbar-panel-title panel-title">
	File Explorer
</div>
<ul class="file-menu">
	<li @click="showModalNewFile = true; selNewFileLocation = '/'; txtNewFileName = getProposedFileName(workspace);">
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
	<li @click="showModalAddFolder = true; selNewFolderLocation = '/'; txtNewFolderName='';">
		<Icon class="menu-icon"
			icon="codicon:new-folder" />
		<span>Add Folder</span>
	</li>
	<li @click="showModalLoadContractFromTX = true">
		<Icon class="menu-icon"
			icon="codicon:mirror" />
		<span>Load Contract from TX</span>
	</li>
	<li v-if="workspace.getCurrentEditorId() >= 0">
		<Icon class="menu-icon"
			icon="codicon:cloud-download" />
		<span>Download File</span>
	</li>
	<li v-else class="disabled">
		<Icon class="menu-icon"
			icon="codicon:cloud-download" />
		<span>Download File</span>
	</li>
</ul>
<FileList v-if="workspace" :workspace="workspace" :fileTree="workspace.getFileTree()" />
<transition name="modal1">
	<Modal v-if="showModalLoadContractFromTX" @close="showModalLoadContractFromTX = false">
		<template v-slot:header>
			<h3>Load Contract from TX</h3>
		</template>
		<template v-slot:body>
			<p>Coming soon...</p>
		</template>
		<template v-slot:footer>
			<div class="modal-footer text-right">
				<button 
					class="modal-button modal-button-primary" 
					v-if="workspace"
					@click="loadFromTXModal($event, workspace)">
					<span >Load files into Workspace</span >
				</button>
				<button 
					class="modal-button" 
					@click="showModalLoadContractFromTX = false">
					Close
				</button>
			</div>
		</template>
	</Modal>
</transition>
<transition name="modal2">
	<Modal v-if="showModalAddFolder" @close="showModalAddFolder = false">
		<template v-slot:header>
			<h3>Add Folder</h3>
		</template>
		<template v-slot:body>
			<div class="form-input">
				<label>Workspace Location</label>
				<select v-model.trim="selNewFolderLocation">
					<option value="/">/</option>
					<template v-for="path of workspace.getFileTreePaths()" :key="path">
						<option v-if="path" :value="path">{{ path }}</option>
					</template>
					
				</select>
			</div>
			<div class="form-input">
				<label>Folder Name</label>
				<input v-model.trim="txtNewFolderName" type="text">
			</div>
		</template>
		<template v-slot:footer>
			<div class="modal-footer text-right">
				<button 
					class="modal-button" 
					:class="{ 'modal-button-primary': txtNewFolderName }"
					:disabled="!txtNewFolderName"
					v-if="workspace"
					@click="addFolderModal(workspace, selNewFolderLocation, txtNewFolderName)">
					<span >Add Folder</span >
				</button>
				<button 
					class="modal-button" 
					@click="showModalAddFolder = false">
					Close
				</button>
			</div>
		</template>
	</Modal>
</transition>
<transition name="modal2">
	<Modal v-if="showModalNewFile" @close="showModalNewFile = false">
		<template v-slot:header>
			<h3>Create a New File</h3>
		</template>
		<template v-slot:body>
			<div class="form-input">
				<label>Workspace Location</label>
				<select v-model.trim="selNewFileLocation">
					<option value="/">/</option>
					<template v-for="path of workspace.getFileTreePaths()" :key="path">
						<option v-if="path" :value="path">{{ path }}</option>
					</template>
					
				</select>
			</div>
			<div class="form-input">
				<label>File Name</label>
				<input v-model.trim="txtNewFileName" type="text">
			</div>
		</template>
		<template v-slot:footer>
			<div class="modal-footer text-right">
				<button 
					class="modal-button modal-button-primary" 
					v-if="workspace"
					@click="newFileModal($event, workspace, txtNewFileName, selNewFileLocation)">
					<span >Add File</span >
				</button>
				<button 
					class="modal-button" 
					@click="showModalNewFile = false">
					Close
				</button>
			</div>
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

const showModalLoadContractFromTX = ref(false);
const showModalAddFolder = ref(false);
const showModalNewFile = ref(false);

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


const addFolderModal = (workspace: Workspace, path: string, folderName: string) => {
	workspace.addFolder(path, folderName);
	showModalAddFolder.value = false;
};
const newFileModal = (
	inputEvent: Event,
	workspace: Workspace,
	fileName: string,
	path: string) => {
	const onlyInParent= false;
  const content= '';
	workspace.addEditor(inputEvent, onlyInParent, content, fileName, path);
	showModalNewFile.value = false;
};
const loadFromTXModal = (inputEvent: Event, workspace: Workspace) => {
	showModalNewFile.value = false;
	showModalLoadContractFromTX.value = false;
	console.log(inputEvent, workspace);
};

const getProposedFileName = (workspace: Workspace): string => {
	let newEditorId = workspace.editors.length;
	if (newEditorId) {
		newEditorId = workspace.editors[newEditorId - 1].id + 1;
	}
	return `Untitled-${newEditorId}`;
};

const txtNewFileName = ref('');
const txtNewFolderName = ref('');


</script>

<style scoped lang="scss">
$title-height: 28px;

* {
  font-family: 'Open Sans', sans-serif;
}

.panel-title {
	height: $title-height;
	line-height: $title-height;
	font-size: 12px;
	padding-left: 20px;
}
.modal-btn-icon {
	font-size: 15px;
	margin-left: 4px;
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
	color: #FFF;
}
.file-menu li.disabled {
	color: gray;
	cursor: default;
}

.subheader {
	font-size: 12px;
	padding-left: 10px;
	padding-top: 4px;
	padding-bottom: 4px;
	margin-top: 20px;
	margin-bottom: 0px;
}


.modal-button {
  display: inline;
  margin-top: 1rem;
  padding: 10px;
  background-color: rgba(55, 55, 55, 1);
  color: #FFF;
  border: 0;
  margin-left: 8px;
  cursor: pointer;
  border-radius: 4px;
}
.modal-button:hover {
  cursor: pointer;
  background-color: rgba(55, 55, 55, 0.5);
}
.modal-button span {
	margin-left: 4px;
}
.modal-button-primary {
  background-color: var(--app-toolbar-panel-title-bgcolor);
  color:  var(--app-toolbar-panel-title-color);
}
.modal-button-primary:hover {
  background-color: #000;
  color: #FFF;
  background-color: rgba(0, 0, 0, 0.5);
}
.modal-footer {
	width: 100%;
}
.form-input {
	padding: 10px;
}
.form-input input,
.form-input select
 {
	width: 100%;
	padding: 12px;
	border-radius: 4px;
	border: 1px solid var(--app-background-color);
	background: inherit;
	color: inherit;
}
.form-input option
 {
	width: 100%;
	padding: 12px;
	border-radius: 4px;
	border: 1px solid var(--app-background-color);
	background: inherit;
	color: #000;
}

.form-input label {
	font-size: 12px;
	margin-bottom: 4px;
	display: block;
}
</style>