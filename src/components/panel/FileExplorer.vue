<template>
<div class="arcode-main-toolbar-panel-title panel-title">
	File Explorer
</div>
<ul class="file-menu" v-if="workspace">
	<li>
		<button
			tabindex="0"
			@click="showModalNewFileOpen()">
			<DefaultIcon class="menu-icon"
				icon="codicon-new-file" />
			<span>New File</span>
		</button>
	</li>
	<li 
		v-if="workspace.getCurrentEditorId() >= 0">
		<button 
			tabindex="0" 
			@click="showModalEditFileOpen()">
			<DefaultIcon class="menu-icon"
			icon="codicon-edit" />
			<span>Edit File Name</span>
		</button>
	</li>
	<li v-else>
		<button class="disabled">
			<DefaultIcon class="menu-icon"
			icon="codicon-edit" />
			<span>Edit File Name</span>
		</button>
	</li>
	<li>
		<button
			tabindex="0"
			@click="openFile('txt_file_openFile')">
			<DefaultIcon class="menu-icon"
				icon="codicon-folder-opened" />
			<span>Open File...</span>
		</button>
		<input type="file" 
			id="txt_file_openFile" 
			style="display: none" 
			:accept="acceptedFileTypes" 
			@change="openFile_helper($event, workspace)">
	</li>
	<li>
		<button
			tabindex="0"
			@click="openWorkspace('txt_file_openWorkspace')">
			<DefaultIcon class="menu-icon"
				icon="codicon-root-folder-opened" />
			<span>Open Workspace...</span>
		</button>
		<input type="file" 
			id="txt_file_openWorkspace" 
			style="display: none" 
			accept=".zip,application/zip" 
			@change="openWorkspace_helper($event)">
	</li>
	<li>
		<button
			tabindex="0"
			@click="showModalAddFolderOpen()">
			<DefaultIcon class="menu-icon"
				icon="codicon-new-folder" />
			<span>Add Folder</span>
		</button>
	</li>
	<li>
		<button
			tabindex="0"
			@click="showModalLoadContractFromTxOpen()">
			<DefaultIcon class="menu-icon"
				icon="codicon-mirror" />
			<span>Import Contract from TX</span>
		</button>
	</li>
</ul>
<ul class="file-menu">
	<li 
		v-if="workspace.getCurrentEditorId() >= 0">
		<button
			tabindex="0"
			@click="downloadFile(getEditor(workspace.getCurrentEditorId(), workspace))">
			<DefaultIcon class="menu-icon"
				icon="codicon-desktop-download" />
			<span>Download File</span>
		</button>
	</li>
	<li v-else>
		<button class="disabled">
			<DefaultIcon class="menu-icon"
				icon="codicon-desktop-download" />
			<span>Download File</span>
		</button>
	</li>
	<li>
		<button
			tabindex="0"
			@click="downloadWorkspace()">
			<DefaultIcon class="menu-icon"
				icon="codicon-file-zip" />
			<span>Download Workspace</span>
		</button>
	</li>
	
</ul>
<div class="arcode-main-toolbar-panel-title panel-title">
	Files In Workspace
</div>
<FileList 
		v-if="workspace" 
		:workspace="workspace" 
		:level="0"
		:fileTree="workspace.getFileTree()" />
<transition name="fade">
	<LoadContractFromTxDialog
		:show="showModalLoadContractFromTx"
		:workspace="workspace"
		:tx="tx"
		:networkParam="networkParam"
		@close="showModalLoadContractFromTx = false"></LoadContractFromTxDialog>
</transition>
<transition name="fade">
	<NewFolderDialog
		:show="showModalAddFolder"
		:workspace="workspace"
		@close="showModalAddFolder = false"></NewFolderDialog>
</transition>
<transition name="fade">
	<NewFileDialog
		:show="showModalNewFile"
    :workspace="workspace"
    @close="showModalNewFile = false"></NewFileDialog>
</transition>
<transition name="fade">
	<DefaultModal v-if="showModalOpenFile" @close="showModalOpenFile = false">
		<template v-slot:header>
			<h3><DefaultIcon class="title-icon"
				icon="codicon-folder-opened" /><span>Open File: Select Location</span></h3>
		</template>
		<template v-slot:body>
			<div class="form-input">
				<label>Workspace Location</label>
				<select v-model.trim="selOpenFileLocation">
					<option value="/">/</option>
					<template v-for="path of workspace.getFileTreePaths()" :key="path">
						<option v-if="path" :value="path">{{ path }}</option>
					</template>
					
				</select>
			</div>
			<div class="form-input">
				<label>File Name</label>
				<input 
					v-model.trim="txtOpenFileName" 
					@keyup.enter="openFileModal($event, workspace, txtOpenFileName, selOpenFileLocation, txtOpenFileContent)"
					type="text">
			</div>
		</template>
		<template v-slot:footer>
			<div class="modal-footer text-right">
				<button 
					class="modal-button" 
					:class="{ 'modal-button-primary': txtOpenFileName }"
					:disabled="!txtOpenFileName"
					v-if="workspace"
					@click="openFileModal($event, workspace, txtOpenFileName, selOpenFileLocation, txtOpenFileContent)">
					<span >Open File</span >
				</button>
				<button 
					class="modal-button" 
					@click="showModalOpenFile = false">
					Close
				</button>
			</div>
		</template>
	</DefaultModal>
</transition>
<transition name="fade">
	<EditFileNameDialog
		:show="showModalEditFile"
		@close="showModalEditFile = false"
		:workspace="workspace"></EditFileNameDialog>
</transition>
</template>
<script setup lang="ts">
import { ref, watchEffect, computed } from 'vue';
import DefaultIcon from '@/components/atomic/DefaultIcon';
import DefaultWorkspace from '@/components/composed/DefaultWorkspace.vue';
import DefaultModal from '@/components/atomic/DefaultModal.vue';
import NewFileDialog from '@/components/dialogs/NewFileDialog.vue';
import EditFileNameDialog from '@/components/dialogs/EditFileNameDialog.vue';
import NewFolderDialog from '@/components/dialogs/NewFolderDialog.vue';
import LoadContractFromTxDialog from '@/components/dialogs/LoadContractFromTxDialog.vue';
import FileList from '@/components/atomic/FileList.vue';
import fileDownload from 'js-file-download';
import { EditorViewMetadata } from '@/core/interfaces/EditorViewMetadata';
import { ArweaveWrapper, defaultNetwork } from '@/core/ArweaveWrapper';
import { createToast } from 'mosha-vue-toastify';
import { JSZipWrapper } from '@/core/JSZipWrapper';

const showModalLoadContractFromTx = ref(false);
const showModalAddFolder = ref(false);
const showModalNewFile = ref(false);
const showModalOpenFile = ref(false);
const showModalEditFile = ref(false);
const defaultSelNetwork = props.networkParam ? props.networkParam : defaultNetwork;
const selNetwork = ref(defaultSelNetwork);
const acceptedFileTypes = ref('.json,application/json,.js,text/javascript,.ts,.py,rs,.java,.cpp,.erl,.go,.html,.xml,.graphql,.gql,.sql,.css,.scss');

const props = defineProps({
	workspace: Object,
	tx: String,
	login: Object,
	networkParam: String
});

const openFile = (inputId: string) => {
	if (document.getElementById(inputId)) {
		document.getElementById(inputId).click();
	}
};
const openFile_helper = (inputEvent: Event): Promise<string> => {
	txtOpenFileContent.value = '';
  const method = new Promise<string>((resolve, reject) => {
     // Transform .json file into key
     try {
      const file = inputEvent.target.files.length ? 
        inputEvent.target.files[0] : null;

      const freader = new FileReader();
			freader.onload = async () => {
				const res = freader.result;
				const fname = file.name;
				selOpenFileLocation.value = '/';
				txtOpenFileContent.value = res;
				txtOpenFileName.value = fname;
				// workspace.addEditor(inputEvent, false, res, fname);
				showModalOpenFileOpen();

				inputEvent.target.value = '';
				resolve(res);
			};
			freader.onerror = () => {
				showModalOpenFile.value = false;
				throw Error('Error reading file');
			};
			freader.readAsText(file);
     } catch (error) {
			showModalOpenFile.value = false;
			createToast(`${error}`,
			{
				type: 'danger',
				showIcon: true,
				position: 'bottom-right',
			});
			reject(error);
     }
  });
  return method;
};


const openWorkspace = (inputId: string) => {
	if (document.getElementById(inputId)) {
		document.getElementById(inputId).click();
	}
};
const openWorkspace_helper = (inputEvent: Event): Promise<void> => {
	txtOpenFileContent.value = '';
	const zip = new JSZipWrapper();
  const method = new Promise<string>((resolve, reject) => {
		const zipFile = inputEvent.target.files.length ? 
			inputEvent.target.files[0] : null;
		zip.openZip(zipFile).then((zFile) => {
			const files = [];

			zFile.forEach(function (relativePath, zipEntry) {
				if (zipEntry.dir) {
          const fullPath = zipEntry.name.slice(0, -1);
          createDirectoryStructureFromPath(fullPath);
				} else {
					files.push(zipEntry);
				}
			});

			// Add files
			for (const file of files) {
				const emptyEvent = new Event('emptyEvent');
				const fragments = file.name.split('/');
				const realFName = fragments[fragments.length - 1];
				const path = '/' + file.name.substring(0, file.name.length - (realFName.length + 1));
				
				zFile.file(file.name).async("string").then((data) => {
					props.workspace.addEditor(
						emptyEvent,
						false,
						data,
						realFName,
						path,
						false);
				}).catch((error) => {
					console.error('zipFE:', error);
				})

				
			}
			resolve();
		}).catch((error) => {
			showModalOpenFile.value = false;
			createToast(`${error}`,
			{
				type: 'danger',
				showIcon: true,
				position: 'bottom-right',
			});
			reject(error);
		});

		
     
  });
  return method;
};

const openFileModal = (
	inputEvent: Event,
	workspace: DefaultWorkspace,
	fileName: string,
	path: string,
	content='') => {
	const onlyInParent= false;
	workspace.addEditor(inputEvent, onlyInParent, content, fileName, path);
	txtOpenFileContent.value = '';
	showModalOpenFile.value = false;
};

const createDirectoryStructureFromPath = (path: string) => {
  const elements = path.split('/');
  let tmpPath = '';
  for (const e of elements) {
    try {
      props.workspace.addFolder(tmpPath ? tmpPath : '/', e, true);
      tmpPath += `/${e}`;
    } catch (err) {
      console.log('dirStructure:', err);
    }
  }
};


const getEditor = (editorId: number, workspace: DefaultWorkspace): string => {
	const i = workspace.editors.findIndex(ed => ed.id == editorId);
	return workspace.editors[i];
};


const downloadFile = (doc: EditorViewMetadata) => {
	fileDownload(doc.view.state.doc.toString(), doc.name);
}

const downloadWorkspace = async () => {
	const zip = new JSZipWrapper();
	// Get workspace tree
	const editors = props.workspace.editors;
	const fileTreeRoot = props.workspace.getFileTree();
	
	// Load tree to zip
	zip.loadTreeToZip(fileTreeRoot, fileTreeRoot.name, editors);

	// Download file
	const date = new Date();
	const dateF = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}T${date.getHours()}_${date.getMinutes()}_${date.getSeconds()}`;
	await zip.downloadZip(`arcode_workspace_${dateF}.zip`);
}
const txtOpenFileName = ref('');
const txtOpenFileContent = ref('');
const selOpenFileLocation = ref('/');
watchEffect(() => {
	const r = new RegExp('/|\\\\', 'g');
	txtOpenFileName.value = txtOpenFileName.value.replace(r, '');
});

const showModalNewFileOpen = () => {
	showModalNewFile.value = true;
};

const showModalEditFileOpen = () => {
	showModalEditFile.value = true;
};

const showModalAddFolderOpen = () => {
	showModalAddFolder.value = true;
};

const showModalLoadContractFromTxOpen = () => {
	showModalLoadContractFromTx.value = true;
};

const showModalOpenFileOpen = () => {
	showModalOpenFile.value = true;
}


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
.menu-icon {
	float: right;
	line-height: 15px;
	font-size: 15px !important;
	margin-left: 4px;
	width: 10%;
	display: inline;
	text-align: right;
	padding: 6px 0px;
}
h3 span {
	margin-left: 12px;
}

.file-menu {
	padding: 0px;
	margin-top: 0px;
	margin-bottom: 0px;
}
.file-menu li {
	padding: 0px;
	height: 32px;
	list-style: none;
	width: 100%;
}

.file-menu li button {
	width: 100%;
	height: 100%;
	line-height: 32px;
	border: 0;
	cursor: pointer;
	text-align: left;
	font-size: 12px;
	background-color: inherit;
	color: inherit;
	display: block;

}

.file-menu li button:hover {
	background-color: rgba(0,0,0,0.3);
}

.file-menu li button.disabled {
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

</style>