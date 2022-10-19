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
      <div class="small-txt text-center" v-if="loading">
        <br>
        Loading ...
      </div>
      <div class="gallery-card" v-for="g in galleryResults" :key="g.id">
        <h4>Workspace name: {{ g.name }}</h4>
        <h5>Tx: {{ g.id }}</h5>
        <p>Description: {{ g.description }}</p>
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
import { ref, computed, watchEffect } from 'vue';
import DefaultModal from '@/components/atomic/DefaultModal.vue';
import DefaultIcon from '@/components/atomic/DefaultIcon';
import { 
  ArweaveWrapper, arweaveNetworks, onMainnetByString,
  onTestnetByString } from '@/core/ArweaveWrapper';
import { ArDBWrapper, ArDBTag } from '@/core/ArDBWrapper';
import { createToast } from 'mosha-vue-toastify';

interface GalleryItem {
  id: string;
  name: string;
  description: string;
}

const props = defineProps({
  show: Boolean,
  login: Object
});
const showTracker = ref(false);
const emit = defineEmits(['close']);
const mainAddress = computed(() => {
  return props.login.mainAddress;
});
const selNetwork = ref('arweave-mainnet');
const galleryResults = ref([]);
const galleryResultsMetadata = ref([]);
const loading = ref(false);
const loadingMore = ref(false);
let gArDBWrapper: ArDBWrapper|null = null;

const loadGallery = async (address: string, limit: number) => {
  limit = parseInt(limit);
  galleryResults.value = [];
  galleryResultsMetadata.value = [];
  loading.value = true;
  const sortOrder = 'HEIGHT_DESC';
  try {
    const tags: ArDBTag[] = [];
    const arweaveWrapper = new ArweaveWrapper(selNetwork.value);
    const arweave = arweaveWrapper.arweave;
    gArDBWrapper = new ArDBWrapper(arweave);
    const ardbWrapper = gArDBWrapper;

    if (!address) {
      // throw Error('');
      return;
    } else if (limit <= 0 || limit > 100) {
      throw Error('Limit must be between 1 - 100');
    }

    tags.push({
      name: 'App-Name',
      values: ['ArCode'],
    }, {
      name: 'Type',
      values: 'Workspace'
    },);
    
    const tmpRes = await ardbWrapper.findFromOwners(
      address, limit, tags, sortOrder
    );

    for (let i = 0; i < tmpRes.length; i++) {
      galleryResultsMetadata.value.push({ visible: false });
      const fr = await formatResultTx(tmpRes[i]);
      galleryResults.value.push(fr);
    }

    
  } catch (err) {
    createToast(`${err}`,
      {
        type: 'danger',
        showIcon: true,
        position: 'bottom-right',
      });
  }
  loading.value = false;
};

const nextResultsSearchByAddress = async () => {
  const ardbWrapper = gArDBWrapper;
  loadingMore.value = true;
  try {
    const nextRes = await ardbWrapper.nextResults();
    if (nextRes && Object.prototype.hasOwnProperty.call(nextRes, 'length') &&
        nextRes.length) {
      galleryResults.value.push(...nextRes);

      for (let i = 0; i < nextRes.length; i++) {
        galleryResultsMetadata.value.push({ visible: false });
      }

    } else if (nextRes && Object.prototype.hasOwnProperty.call(nextRes, 'length') &&
        nextRes.length === 0) {
      createToast(`No more results found.`,
      {
        type: 'warning',
        showIcon: true,
        position: 'bottom-right',
      });
    }else if (nextRes && Object.keys(nextRes)) {
      galleryResults.value.push(nextRes);
      galleryResultsMetadata.value.push({ visible: false });
    } else {
      createToast(`No more results found.`,
      {
        type: 'danger',
        showIcon: true,
        position: 'bottom-right',
      });
    }
    loadingMore.value = false;
  } catch (err) {
    createToast(`${err}`,
      {
        type: 'danger',
        showIcon: true,
        position: 'bottom-right',
      });
    loadingMore.value = false;
  }
};



watchEffect(async () => {
  if (props.show && !showTracker.value) {
    showTracker.value = true;
    await loadGallery(mainAddress.value, 10);
  }
});

const closeModal = () => {
  showTracker.value = false;
  emit('close');
};

const formatResultTx = async (tx): GalleryItem => {
  const res: GalleryItem = {
    id: tx.id,
    name: '',
    description: ''
  };
  const tags = tx.tags;

  res.name = searchKeyNameInTags(tags, 'WorkspaceName');
  res.description = searchKeyNameInTags(tags, 'WorkspaceDescription');
  
  return res;
};

const searchKeyNameInTags = (_arr: any[], _key: string) => {
  for (const a of _arr) {
    if (a.name.toUpperCase() === _key.toUpperCase()) {
      return a.value;
    }
  }
  return '';
}
</script>

<style scoped lang="scss">
.gallery-card {
  margin: 20px;
  padding: 6px;
  margin-bottom: 6px;
}
</style>