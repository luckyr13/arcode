<template>
	<DefaultModal v-if="show">
		<template v-slot:header>
			<h3>
				<DefaultIcon class="title-icon"
				icon="codicon-new-folder" />
				<span>Add Folder</span>
			</h3>
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
					@keyup.enter="txtNewFolderName != '' ? addFolderModal(selNewFolderLocation, txtNewFolderName) : false"
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
					@click="addFolderModal(selNewFolderLocation, txtNewFolderName)">
					<span >Add Folder</span >
				</button>
				<button 
					class="modal-button" 
					@click="closeModal()">
					Close
				</button>
			</div>
		</template>
	</DefaultModal>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import DefaultIcon from '@/components/atomic/DefaultIcon';
import DefaultModal from '@/components/atomic/DefaultModal.vue';

const props = defineProps({
	show: Boolean,
	workspace: Object
});
const emit = defineEmits(['close']);
const selNewFolderLocation = ref('');
const txtNewFolderName = ref('');
const showTracker = ref(false);

const closeModal = () => {
	showTracker.value = false;
	emit('close');
};

const initModalFields = () => {
	selNewFolderLocation.value = '/';
	txtNewFolderName.value = '';
};

const addFolderModal = (path: string, folderName: string) => {
	props.workspace.addFolder(path, folderName);
	closeModal();
};

watchEffect(() => {
	if (props.show && !showTracker.value) {
		showTracker.value = true;
		initModalFields();
	}
	
	const r = new RegExp('/|\\\\', 'g');
	txtNewFolderName.value = txtNewFolderName.value.replace(r, '');
});

</script>