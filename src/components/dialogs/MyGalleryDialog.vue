<template>
  <DefaultModal v-if="show">
    <template v-slot:header>
      <h3><DefaultIcon class="title-icon"
        icon="codicon-circuit-board" /><span>My Gallery</span></h3>
    </template>
    <template v-slot:body>
      --
    </template>
    <template v-slot:footer>
      <div class="modal-footer text-right">
        <button 
          class="modal-button" 
          @click="$emit('close')">
          Close
        </button>
      </div>
    </template>
  </DefaultModal>
</template>

<script setup lang="ts">
import DefaultModal from '@/components/atomic/DefaultModal.vue';
import DefaultIcon from '@/components/atomic/DefaultIcon';

const props = defineProps({
  'show': Boolean
});


</script>

<style scoped lang="scss">

.title-icon {
  float: left;
  line-height: 32px;
  font-size: 32px !important;
}
.modal-footer {
  width: 100%;
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
</style>