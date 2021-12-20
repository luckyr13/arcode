<template>
<div class="arcode-main-toolbar-panel-title panel-title">
	File Explorer
</div>
<ul class="file-menu">
	<li @click="showModalNewFile = true">
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
	<li @click="showModalAddFolder = true">
		<Icon class="menu-icon"
			icon="codicon:new-folder" />
		<span>Add Folder</span>
	</li>
	<li @click="showModalLoadContractFromTX = true">
		<Icon class="menu-icon"
			icon="codicon:mirror" />
		<span>Load Contract from TX</span>
	</li>
	<li>
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
			<p>Body</p>
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
			<p>Body</p>
		</template>
		<template v-slot:footer>
			<div class="modal-footer text-right">
				<button 
					class="modal-button modal-button-primary" 
					v-if="workspace"
					@click="addFolderModal(workspace, '/', 'test23')">
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
			<p>Body</p>
			
		</template>
		<template v-slot:footer>
			<div class="modal-footer text-right">
				<button 
					class="modal-button modal-button-primary" 
					v-if="workspace"
					@click="newFileModal($event, workspace)">
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
const newFileModal = (inputEvent: Event, workspace: Workspace) => {
	const onlyInParent= false;
  const content= '';
  const path='/';
  const fileName='';

	workspace.addEditor(inputEvent, onlyInParent, content, fileName, path);
	showModalNewFile.value = false;
};
const loadFromTXModal = (inputEvent: Event, workspace: Workspace) => {
	showModalNewFile.value = false;
	showModalLoadContractFromTX.value = false;
	console.log(inputEvent, workspace);
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
</style>