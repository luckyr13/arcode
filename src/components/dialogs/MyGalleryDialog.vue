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
      <div class="small-txt">
        <strong>Wallet:</strong> {{ mainAddress }}
      </div>
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
import { ref, computed } from 'vue';
import DefaultModal from '@/components/atomic/DefaultModal.vue';
import DefaultIcon from '@/components/atomic/DefaultIcon';
import { 
  ArweaveWrapper, arweaveNetworks, onMainnetByString,
  onTestnetByString } from '@/core/ArweaveWrapper';
import { ArDBWrapper, ArDBTag } from '@/core/ArDBWrapper';

const props = defineProps({
  show: Boolean,
  login: Object
});
const emit = defineEmits(['close']);
const mainAddress = computed(() => {
  return props.login.mainAddress;
});
const closeModal = () => {
  emit('close');
};

</script>

<style scoped lang="scss">

</style>