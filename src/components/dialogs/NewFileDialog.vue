<template>
  <DefaultModal v-if="show">
    <template v-slot:header>
      <h3>
        <DefaultIcon class="title-icon"
        icon="codicon-new-file" />
        <span>Create a New File</span>
      </h3>
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
          @keyup.enter="newFileModal($event, txtNewFileName, selNewFileLocation)"
          type="text">
      </div>
    </template>
    <template v-slot:footer>
      <div class="modal-footer text-right">
        <button 
          class="modal-button modal-button-primary" 
          v-if="workspace"
          @click="newFileModal($event, txtNewFileName, selNewFileLocation)">
          <span >Add File</span >
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
import { ref, computed, watchEffect, watch } from 'vue';
import DefaultModal from '@/components/atomic/DefaultModal.vue';
import DefaultIcon from '@/components/atomic/DefaultIcon';

const props = defineProps({
  show: Boolean,
  workspace: Object
});
const showTracker = ref(false);
const emit = defineEmits(['close']);
const selNewFileLocation = ref('');
const txtNewFileName = ref('');

const newFileModal = (
  inputEvent: Event,
  fileName: string,
  path: string) => {
  const onlyInParent= false;
  const content= '';
  props.workspace.addEditor(inputEvent, onlyInParent, content, fileName, path);
  closeModal();
};


const getProposedFileName = (): string => {
  let newEditorId = 0;
  const ids = props.workspace.editors.map((v) => {
    return parseInt(v.id)
  });
  if (ids.length) {
    newEditorId = Math.max(...ids) + 1;

  }
  return `Untitled-${newEditorId}`;
};

const initModalFields = () => {
  selNewFileLocation.value = '/';
  txtNewFileName.value = getProposedFileName(props.workspace);
};

const closeModal = () => {
  txtNewFileName.value = '';
  showTracker.value = false;
  emit('close');
};

watchEffect(() => {
  const r = new RegExp('/|\\\\', 'g');
  txtNewFileName.value = txtNewFileName.value.replace(r, '');
  if (props.show && !showTracker.value) {
    showTracker.value = true;
    initModalFields();
  }
});


</script>
<style scoped lang="scss">


</style>