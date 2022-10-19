<template>
  <DefaultModal v-if="show" modalSize="medium">
    <template v-slot:header>
      <h3>
        <DefaultIcon class="title-icon"
        icon="codicon-circuit-board" />
        <span>My Gallery</span>
      </h3>
    </template>
    <template v-slot:body>
      --
    </template>
    <template v-slot:footer>
      <div class="modal-footer text-right">
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
import DefaultModal from '@/components/atomic/DefaultModal.vue';
import DefaultIcon from '@/components/atomic/DefaultIcon';

const props = defineProps({
  show: Boolean
});
const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};

</script>

<style scoped lang="scss">

</style>