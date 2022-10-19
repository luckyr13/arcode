<template>
	<DefaultModal v-if="show">
		<template v-slot:header>
			<h3>
        <DefaultIcon class="title-icon"
        icon="codicon-edit" />
        <span>Edit File Name</span>
      </h3>
		</template>
		<template v-slot:body>
			<div class="form-input">
				<label>New File Name</label>
				<input 
					v-model.trim="txtEditFileName" 
					@keyup.enter="editFileModal(txtEditFileName, workspace.getCurrentEditorId())"
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
					@click="editFileModal(txtEditFileName, workspace.getCurrentEditorId())">
					<span >Update File</span >
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
const showTracker = ref(false);
const txtEditFileName = ref('');

const closeModal = () => {
	showTracker.value = false;
	emit('close');
};

const editFileModal = (
	newFileName: string,
	editorId: number) => {
	props.workspace.updateEditorName(editorId, newFileName);
	txtEditFileName.value = '';
	closeModal();
};

const getEditorsFilename = (editorId: number): string => {
	const i = props.workspace.editors.findIndex(ed => ed.id == editorId);
	return props.workspace.editors[i].name;
};

const initModalFields = () => {
	txtEditFileName.value = getEditorsFilename(props.workspace.getCurrentEditorId(), props.workspace);
};

watchEffect(() => {
	if (props.show && !showTracker.value) {
		showTracker.value = true;
		initModalFields();
	}
	const r = new RegExp('/|\\\\', 'g');
	txtEditFileName.value = txtEditFileName.value.replace(r, '');

});

</script>
<style scoped lang="scss">
</style>