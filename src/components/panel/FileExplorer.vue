<template>
<div class="arcode-main-toolbar-panel-title panel-title">
	File Explorer
</div>
<ul class="file-menu" v-if="workspace">
	<li>
		<button
			tabindex="0"
			@click="showModalNewFile = true; selNewFileLocation = '/'; txtNewFileName = getProposedFileName(workspace);">
			<Icon class="menu-icon"
				icon="codicon-new-file" />
			<span>New File</span>
		</button>
	</li>
	<li>
		<button
			tabindex="0"
			@click="openFile('txt_file_openFile')">
			<Icon class="menu-icon"
				icon="codicon-folder-opened" />
			<span>Open File...</span>
		</button>
		<input type="file" 
			id="txt_file_openFile" 
			style="display: none" 
			accept=".json,application/json,.js,text/javascript" 
			@change="openFile_helper($event, workspace)">
	</li>
	<li>
		<button
			tabindex="0"
			@click="showModalAddFolder = true; selNewFolderLocation = '/'; txtNewFolderName='';">
			<Icon class="menu-icon"
				icon="codicon-new-folder" />
			<span>Add Folder</span>
		</button>
	</li>
	<li>
		<button
			tabindex="0"
			@click="showModalLoadContractFromTX = true; selLoadTXLocation = '/'; txtLoadTXFileName = ''; txtLoadTXGetLastState = false; selNetwork = 'arweave-mainnet'">
			<Icon class="menu-icon"
				icon="codicon-mirror" />
			<span>Load Contract from TX</span>
		</button>
	</li>
</ul>
<div class="arcode-main-toolbar-panel-title panel-title">
	Files In Workspace
</div>
<ul class="file-menu">
	<li 
		v-if="workspace.getCurrentEditorId() >= 0">
		<button 
			tabindex="0" 
			@click="showModalEditFile = true; txtEditFileName = getEditorsFilename(workspace.getCurrentEditorId(), workspace)">
			<Icon class="menu-icon"
			icon="codicon-edit" />
			<span>Edit File Name</span>
		</button>
	</li>
	<li v-else>
		<button class="disabled">
			<Icon class="menu-icon"
			icon="codicon-edit" />
			<span>Edit File Name</span>
		</button>
	</li>
	<li 
		v-if="workspace.getCurrentEditorId() >= 0">
		<button
			tabindex="0"
			@click="downloadFile(getEditor(workspace.getCurrentEditorId(), workspace))">
			<Icon class="menu-icon"
				icon="codicon-desktop-download" />
			<span>Download File</span>
		</button>
	</li>
	<li v-else>
		<button class="disabled">
			<Icon class="menu-icon"
				icon="codicon-desktop-download" />
			<span>Download File</span>
		</button>
	</li>
</ul>
<FileList 
		v-if="workspace" 
		:workspace="workspace" 
		:level="0"
		:fileTree="workspace.getFileTree()" />
<transition name="fade">
	<DefaultModal v-if="showModalLoadContractFromTX" @close="showModalLoadContractFromTX = false">
		<template v-slot:header>
			<h3>Load Contract from TX</h3>
		</template>
		<template v-slot:body>
			<template v-if="!loadingContractTX">
				<div class="form-input">
					<label>Workspace Location</label>
					<select v-model.trim="selLoadTXLocation">
						<option value="/">/</option>
						<template v-for="path of workspace.getFileTreePaths()" :key="path">
							<option v-if="path" :value="path">{{ path }}</option>
						</template>
					</select>
				</div>
				<div class="form-input">
					<label>Network</label>
					<select 
						v-model.trim="selNetwork">
						<option 
							v-for="(nItem, nIndex) in networks" 
							v-bind:key="nIndex" 
							:value="nIndex">{{ nItem.host }} ({{ nIndex }})</option>
					</select>
				</div>
				<div class="form-input">
					<label>TX ID</label>
					<input 
						v-model.trim="txtLoadTXFileName" 
						@keyup.enter="txtLoadTXFileName != '' ? loadFromTXModal(txtLoadTXFileName, selLoadTXLocation, workspace) : false"
						type="text">
					<a v-if="tx" class="link" @click="txtLoadTXFileName = tx">Use TX address from URL</a>
				</div>
				<div class="text-right form-radio">
					<label class="">
						<input 
							v-model.trim="txtLoadTXGetLastState" 
							type="checkbox"> Get latest state
					</label>
				</div>
			</template>
			<template v-if="loadingContractTX">
				Loading ... Please hold on!
			</template>
		</template>
		<template v-slot:footer>
			<div class="modal-footer text-right">
				<button 
					class="modal-button" 
					:class="{ 'modal-button-primary': txtLoadTXFileName }"
					:disabled="!txtLoadTXFileName"
					v-if="workspace && !loadingContractTX"
					@click="loadFromTXModal(txtLoadTXFileName, selLoadTXLocation, workspace)">
					<span >Load files into Workspace</span >
				</button>
				<button 
					class="modal-button" 
					disabled
					v-if="loadingContractTX">
					<span >Loading ...</span >
				</button>

				<button 
					class="modal-button" 
					@click="showModalLoadContractFromTX = false">
					Close
				</button>
			</div>
		</template>
	</DefaultModal>
</transition>
<transition name="fade">
	<DefaultModal v-if="showModalAddFolder" @close="showModalAddFolder = false">
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
				<input 
					v-model.trim="txtNewFolderName" 
					@keyup.enter="txtNewFolderName != '' ? addFolderModal(workspace, selNewFolderLocation, txtNewFolderName) : false"
					type="text">
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
	</DefaultModal>
</transition>
<transition name="fade">
	<DefaultModal v-if="showModalNewFile" @close="showModalNewFile = false">
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
				<input 
					v-model.trim="txtNewFileName" 
					@keyup.enter="newFileModal($event, workspace, txtNewFileName, selNewFileLocation)"
					type="text">
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
	</DefaultModal>
</transition>
<transition name="fade">
	<DefaultModal v-if="showModalOpenFile" @close="showModalOpenFile = false">
		<template v-slot:header>
			<h3>Open File: Select Location</h3>
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
	<DefaultModal v-if="showModalEditFile" @close="showModalEditFile = false">
		<template v-slot:header>
			<h3>Edit File Name</h3>
		</template>
		<template v-slot:body>
			<div class="form-input">
				<label>New File Name</label>
				<input 
					v-model.trim="txtEditFileName" 
					@keyup.enter="editFileModal(workspace, txtEditFileName, workspace.getCurrentEditorId())"
					type="text">
			</div>
		</template>
		<template v-slot:footer>
			<div class="modal-footer text-right">
				<button 
					class="modal-button" 
					:class="{ 'modal-button-primary': txtEditFileName }"
					:disabled="!txtEditFileName"
					v-if="workspace"
					@click="editFileModal(workspace, txtEditFileName, workspace.getCurrentEditorId())">
					<span >Update File</span >
				</button>
				<button 
					class="modal-button" 
					@click="showModalEditFile = false">
					Close
				</button>
			</div>
		</template>
	</DefaultModal>
</transition>
</template>


<script setup lang="ts">
//import {EditorView} from "@codemirror/view";
import { ref, watchEffect, computed } from 'vue';
import Icon from '@/components/atomic/Icon';
import Workspace from '@/components/composed/Workspace.vue';
import DefaultModal from '@/components/atomic/DefaultModal.vue';
import FileList from '@/components/atomic/FileList.vue';
import fileDownload from 'js-file-download';
import { EditorViewMetadata } from '@/core/interfaces/EditorViewMetadata';
import { ArweaveHandler } from '@/core/ArweaveHandler';
import { createToast } from 'mosha-vue-toastify';
import { WasmSrc } from 'redstone-smartweave';

const showModalLoadContractFromTX = ref(false);
const loadingContractTX = ref(false);
const showModalAddFolder = ref(false);
const showModalNewFile = ref(false);
const showModalOpenFile = ref(false);
const showModalEditFile = ref(false);
const globalArweaveHandler = new ArweaveHandler();
const selNetwork = ref('arweave-mainnet');

const networks = computed(() => {
	return globalArweaveHandler.networks;
});

const props = defineProps({
	workspace: Object,
	tx: String
});

const openFile = (inputId: string) => {
	if (document.getElementById(inputId)) {
		document.getElementById(inputId).click();
	}
};
const openFile_helper = (inputEvent: Event): Promise<string> => {
	txtOpenFileContent.value = '';
  let method = new Promise<string>((resolve, reject) => {
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
				showModalOpenFile.value = true;

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

const openFileModal = (
	inputEvent: Event,
	workspace: Workspace,
	fileName: string,
	path: string,
	content='') => {
	const onlyInParent= false;
	workspace.addEditor(inputEvent, onlyInParent, content, fileName, path);
	txtOpenFileContent.value = '';
	showModalOpenFile.value = false;
};
const editFileModal = (
	workspace: Workspace,
	newFileName: string,
	editorId: number) => {
	workspace.updateEditorName(editorId, newFileName);
	txtEditFileName.value = '';
	showModalEditFile.value = false;
};
const loadEditorFromTX = async (tx: string, path: string, workspace: Workspace) => {
	const arweave = new ArweaveHandler(selNetwork.value);
	const res = await arweave.ardb.search('transaction').id(
		tx
	).findOne();
	if (res) {
		const tags = {};
		// Get contract if possible
		res.tags.forEach(async tag => {
			let key = tag.name;
			let value = tag.value;
			tags[key] = value;
		});
		const datatype = res.data.type;
		const onlyInParent= false;
		const inputEvent = new Event('empty-event');
		let data = '';
		let filename = `${tx}`;
		if (datatype === 'application/javascript') {
			filename = `${tx}.js`;

			data = await arweave.getTXData(tx);
			createToast(`JS file found!`,
				{
					type: 'success',
					showIcon: true,
					position: 'bottom-right',
				});
		} else if (datatype === 'application/json') {
			filename = `${tx}.json`;
			data = await arweave.getTXData(tx);
			const replacer = undefined;
			const space = 4;
			if (data) {
				data = JSON.stringify(JSON.parse(data), replacer, space);
			}
			createToast(`JSON file found!`,
				{
					type: 'success',
					showIcon: true,
					position: 'bottom-right',
				});
		} else if (datatype === 'application/wasm') {
      data = await arweave.getTXData(tx, false);
      var buffer = Buffer.from(data);
      filename = `${tx}.wasm`;
      const wasmSrc = new WasmSrc(buffer);
      data = await wasmSrc.sourceCode();

      workspace.addEditor(inputEvent, onlyInParent, buffer.toString(), filename, path);
      createToast(`WASM source found!`,
      {
        type: 'success',
        showIcon: true,
        position: 'bottom-right',
      });

      // Load all source files
      for (const tmpFName of data.keys()) {
        workspace.addEditor(inputEvent, onlyInParent, data.get(tmpFName), tmpFName, path);
      }
      
      // force End wasm
      return;
    } else {
			data = Object.prototype.hasOwnProperty.call(tags, 'Init-State') ?
			tags['Init-State'] : '';
			if (data) {
				filename = `${tx}.json`;
				const replacer = undefined;
				const space = 4;
				data = JSON.stringify(JSON.parse(data), replacer, space);
				createToast(`NFT Atomic Asset found! Loading state ...`,
				{
					type: 'success',
					showIcon: true,
					position: 'bottom-right',
				});
			} else {
				throw Error('Invalid contract source!');
			}
		}

		workspace.addEditor(inputEvent, onlyInParent, data, filename, path);
		// Search if it has a contract src available
		const contractSrc = Object.prototype.hasOwnProperty.call(tags, 'Contract-Src') ?
			tags['Contract-Src'] : '';

		if (contractSrc) {
			await loadEditorFromTX(tags['Contract-Src'], path, workspace);
		}

		
	}
};

const loadLatestContractStateFromTX = async (tx: string, path: string, workspace: Workspace) => {
	const arweave = new ArweaveHandler(selNetwork.value);
	const contract = await arweave.smartweave.contract(tx);
	// Read state
	const { state } = await contract.readState();
	const onlyInParent= false;
	const inputEvent = new Event('empty-event');
	const filename = `${tx}-latest.json`;
	const replacer = undefined;
	const space = 4;
	workspace.addEditor(
		inputEvent,
		onlyInParent,
		JSON.stringify(state, replacer, space),
		filename, path);
	createToast(`Contract latest state loaded!`,
		{
			type: 'success',
			showIcon: true,
			position: 'bottom-right',
		});
};

const loadFromTXModal = async (tx: string, path: string, workspace: Workspace) => {
	loadingContractTX.value = true;
	try {
		await loadEditorFromTX(tx, path, workspace);

		if (txtLoadTXGetLastState.value) {
			await loadLatestContractStateFromTX(tx, path, workspace);
		}
	} catch (err) {
		createToast(`${err}`,
      {
        type: 'danger',
        showIcon: true,
        position: 'bottom-right',
      });
	}
	loadingContractTX.value = false;
	showModalLoadContractFromTX.value = false;
};

const getProposedFileName = (workspace: Workspace): string => {
	let newEditorId = 0;
	const ids = workspace.editors.map((v) => {
		return parseInt(v.id)
	});
	if (ids.length) {
		newEditorId = Math.max(...ids) + 1;

	}
	return `Untitled-${newEditorId}`;
};

const getEditorsFilename = (editorId: number, workspace: Workspace): string => {
	const i = workspace.editors.findIndex(ed => ed.id == editorId);
	return workspace.editors[i].name;
};


const getEditor = (editorId: number, workspace: Workspace): string => {
	const i = workspace.editors.findIndex(ed => ed.id == editorId);
	return workspace.editors[i];
};


const downloadFile = (doc: EditorViewMetadata) => {
	fileDownload(doc.view.state.doc.toString(), doc.name);
}

const txtNewFileName = ref('');
const txtNewFolderName = ref('');
const txtOpenFileName = ref('');
const txtOpenFileContent = ref('');
const selOpenFileLocation = ref('/');
const txtEditFileName = ref('');
const txtLoadTXFileName = ref('');
const selLoadTXLocation = ref('');
const txtLoadTXGetLastState = ref(false);

watchEffect(() => {
	const r = new RegExp('/|\\\\', 'g');
	txtNewFileName.value = txtNewFileName.value.replace(r, '');
	txtNewFolderName.value = txtNewFolderName.value.replace(r, '');
	txtOpenFileName.value = txtOpenFileName.value.replace(r, '');
	txtEditFileName.value = txtEditFileName.value.replace(r, '');
});


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
	line-height: 15px;
	font-size: 15px !important;
	margin-left: 4px;
	width: 10%;
	display: inline;
	text-align: right;
	padding: 6px 0px;
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


.form-radio {
	padding: 10px;
}
.form-radio label {
	font-size: 12px;
	margin-bottom: 4px;
	display: block;
}
.form-radio input
 {
	padding: 12px;
	border-radius: 4px;
	border: 1px solid var(--app-background-color);
	background: inherit;
	color: inherit;
}


.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.link {
	font-size: 12px;
	cursor: pointer;
	text-decoration: underline;
}
</style>