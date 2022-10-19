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
      <div class="small-txt text-center" v-if="loading || loadingMore">
        <div
          class="lds-ring lds-ring-small">
          <div></div><div></div><div></div><div></div></div>
        <br>
        <span>Loading ...</span>
      </div>
      <div class="gallery-card" v-for="g in galleryResults" :key="g.id">
        <h4>Workspace: {{ g.name }}</h4>
        <h5>Tx: {{ g.id }}</h5>
        <h5>Created: {{ g.date }}</h5>
        <p>Description: {{ g.description }}</p>
        <div class="text-right card-footer">
          <a 
            class="modal-button modal-button-primary" 
            :href="`./#/?workspace=${g.id}`"
            target="_blank">
            Open in new window
          </a>
        </div>
      </div>
      <div
        class="more-results"
        @click="nextResultsSearchByAddress()"
        v-if="galleryResults.length && !loading && !loadingMore && !noMoreResults">
        Load more results
      </div>
      <div class="no-results" v-if="!galleryResults.length && !loading">
        No results.
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
  date: string;
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
const loading = ref(false);
const loadingMore = ref(false);
let gArDBWrapper: ArDBWrapper|null = null;
const noMoreResults = ref(false);

const loadGallery = async (address: string, limit: number) => {
  limit = parseInt(limit);
  galleryResults.value = [];
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
    const maxHeight = await arweaveWrapper.getCurrentHeight();
    const tmpRes = await ardbWrapper.findFromOwners(
      address, limit, tags, sortOrder, maxHeight
    );

    for (let i = 0; i < tmpRes.length; i++) {
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
      galleryResults.value.push(...nextRes.map(formatResultTx));

    } else if (nextRes && Object.prototype.hasOwnProperty.call(nextRes, 'length') &&
        nextRes.length === 0) {
      createToast(`No more results found.`,
      {
        type: 'warning',
        showIcon: true,
        position: 'bottom-right',
      });
      noMoreResults.value = true;
    }else if (nextRes && Object.keys(nextRes)) {
      galleryResults.value.push(nextRes);
    } else {
      createToast(`No more results found.`,
      {
        type: 'danger',
        showIcon: true,
        position: 'bottom-right',
      });
      noMoreResults.value = true;
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
  const limit = 10;
  if (props.show && !showTracker.value) {
    showTracker.value = true;
    await loadGallery(mainAddress.value, limit);
  }
});

const closeModal = () => {
  showTracker.value = false;
  emit('close');
};

const formatResultTx = (tx): GalleryItem => {
  const res: GalleryItem = {
    id: tx.id,
    name: '',
    description: '',
    date: ''
  };
  const tags = tx.tags;

  res.name = searchKeyNameInTags(tags, 'WorkspaceName');
  res.description = searchKeyNameInTags(tags, 'WorkspaceDescription');
  const timestamp = tx.block && tx.block.timestamp ? tx.block.timestamp : null;
  res.date = dateFormat(timestamp);
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

const dateFormat = (d: number|string) => {
  if (!d) {
    return '';
  }
  const prev = new Date(+d * 1000);
  const current = new Date();
  const millisecondsEllapsed = current.getTime() - prev.getTime(); 
  const seconds = Math.floor(millisecondsEllapsed / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  if (days) {
    const month = months[prev.getMonth()];
    const date = prev.getDate();
    const year = prev.getFullYear();
    const currentYear = current.getFullYear();
    if (currentYear === year) {
      return `${month} ${date}`;
    }
    return `${month} ${date}, ${year}`;
  } else if (hours) {
    return `${hours}h`;
  } else if (minutes) {
    return `${minutes}m`;
  } else if (seconds) {
    return `${seconds}s`;
  }


  return ``;
}
</script>

<style scoped lang="scss">
.gallery-card {
  margin: 20px;
  padding: 6px;
  margin-bottom: 6px;
}
h4, h5 {
  margin: 0;
}

hr {
  margin-bottom: 6px;
  margin-top: 6px;
}

.card-footer {
  height: 42px;
  border-bottom: 1px solid;
  border-color: inherit;
}

.no-results {
  padding: 20px;
}

.more-results {
  cursor: pointer;
  width: 100%;
  height: 42px;
  text-align: center;
  margin-top: 20px;
  font-weight: bold;
}
</style>