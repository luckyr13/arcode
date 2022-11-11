<template>
  <DefaultModal v-if="show">
    <template v-slot:header>
      <h3>
        <DefaultIcon class="title-icon"
        icon="codicon-cloud-upload" />
        <span>Publish on ArCode Gallery</span>
      </h3>
    </template>
    <template v-slot:body>
      <template v-if="!loadingPublishingWorkspace && !publishWorkspaceTxId">
        <div class="form-input">
          <label>Workspace Name</label>
          <input 
            v-model.trim="txtPublishWorkspaceName"
            type="text">
        </div>
        <div class="form-input">
          <label>Description</label>
          <textarea 
            v-model.trim="txtPublishWorkspaceDescription"></textarea>
        </div>
        <div class="form-input">
          <label>Files in Workspace</label>
          <textarea 
            readonly 
            v-model.trim="txtPublishWorkspaceFilesList"></textarea>
        </div>
        <div class="text-right small-txt">
          <strong>Estimated Data Size: </strong>{{ workspaceSize }}bytes
        </div>
        <div class="text-right small-txt">
          <strong>Wallet: </strong>{{ mainAddress }}
        </div>
        <div v-if="usageFee" class="text-right small-txt">
          <strong class="usage-fee-txt">Usage Fee:</strong> <span class="span-balance">{{ usageFee }}</span> AR
        </div>
        <div class="text-right form-radio">
          <label class="">
            <input 
              :disabled="!isDispatchAvailable"
              v-model.trim="txtPublishWorkspaceDispatch" 
              type="checkbox"> Publish for FREE (Dispatch method)
          </label>
        </div>
      </template>
      <template v-if="loadingPublishingWorkspace">
        Loading ... Please hold on!
      </template>
      <template v-if="!loadingPublishingWorkspace && publishWorkspaceTxId">
        🥳Workspace succesfully published!
        <br>
        Tx Id: {{ publishWorkspaceTxId }}
      </template>
      
    </template>
    <template v-slot:footer>
      <div class="modal-footer text-right">
        <button 
          class="modal-button" 
          :class="{ 'modal-button-primary': txtPublishWorkspaceName }"
          :disabled="!txtPublishWorkspaceName"
          v-if="workspace && !loadingPublishingWorkspace && !publishWorkspaceTxId"
          @click="publishWorkspaceModal()">
          <span >Publish Now!</span >
        </button>
        <button 
          class="modal-button" 
          disabled
          v-if="loadingPublishingWorkspace">
          <span >Loading ...</span >
        </button>

        <button 
          :disabled="loadingPublishingWorkspace"
          class="modal-button" 
          @click="closeModal()">
          Close
        </button>
      </div>
    </template>
  </DefaultModal>
</template>
<script setup lang="ts">
//import {EditorView} from "@codemirror/view";
import { ref, watchEffect, computed } from 'vue';
import DefaultIcon from '@/components/atomic/DefaultIcon';
import DefaultModal from '@/components/atomic/DefaultModal.vue';
import { ArweaveWrapper } from '@/core/ArweaveWrapper';
import { createToast } from 'mosha-vue-toastify';
import { WarpContracts } from '@/core/WarpContracts';
import { JSZipWrapper } from '@/core/JSZipWrapper';
import { protocolName, protocolVersion } from '@/core/AppSettings';

const props = defineProps({
  workspace: Object,
  login: Object,
  tokenState: Object,
  show: Boolean
});
const emit = defineEmits(['close']);
const showTracker = ref(false);
const mainAddress = computed(() => {
  return props.login.mainAddress;
});
const selNetwork = ref('arweave-mainnet');

const loadingPublishingWorkspace = ref(false);
const publishWorkspaceTxId = ref('');
const txtPublishWorkspaceName = ref('');
const txtPublishWorkspaceDescription = ref('');
const txtPublishWorkspaceFilesList = ref('');
const txtPublishWorkspaceDispatch = ref(false);
const isDispatchAvailable = ref(false);

const workspaceSize = ref(0);
const contractSettings = computed(() => {
  const settings = props.tokenState.settings ? props.tokenState.settings : [];
  return new Map(settings);
});
const appFeeInWinston = computed(() => {
  return contractSettings.value.get('appFeeInWinston');
});
const globalArweaveWrapper = new ArweaveWrapper();
const vipMinimumBalance = computed(() => {
  return parseInt(contractSettings.value.get('vipMinimumBalance'));
});
const pstBalance = computed(() => {
  const balances = props.tokenState.balances ? props.tokenState.balances : {};
  const res = Object.prototype.hasOwnProperty.call(balances, mainAddress.value) ? 
    parseInt(props.tokenState.balances[mainAddress.value]) : 0;
  return res;
});
const balances = computed(() => {
  const balances = props.tokenState.balances ? props.tokenState.balances : {};
  return balances;
});
const dataSizeLimitDispatch = computed(() => {
  return globalArweaveWrapper.dataSizeLimitDispatch;
});


const usageFee = computed(() => {
  const arweaveWrapper = new ArweaveWrapper(selNetwork.value);
  const warpContracts = new WarpContracts(arweaveWrapper.arweave);
  const transfer = warpContracts.getTransferData(
      pstBalance.value,
      vipMinimumBalance.value,
      selNetwork.value,
      appFeeInWinston.value,
      mainAddress.value,
      balances.value
    );
  return transfer ? parseFloat(arweaveWrapper.winstonToAr(transfer.winstonQty)) : 0;
});


const getWorkspaceSize = async () => {
  const zip = new JSZipWrapper();
  let size = 0;
  try {
    // Get workspace tree
    const editors = props.workspace.editors;
    const fileTreeRoot = props.workspace.getFileTree();
    zip.loadTreeToZip(fileTreeRoot, fileTreeRoot.name, editors);
    const nameSize = new Blob([txtPublishWorkspaceName.value]).size;
    const descriptionSize = new Blob([txtPublishWorkspaceDescription.value]).size;
    size = await zip.getZipSize();
    size += nameSize + descriptionSize;  
  } catch (error) {
    console.error('workspaceSize', error);
  }
  return size;
};


const getWorkspaceFilesAsString = (): string => {
  let files = '';
  // Get workspace tree
  files += Object.values(props.workspace.getFileTreeFilenames()).join('\n');
  return files;
};

const publishWorkspaceModal = async () => {
  const zip = new JSZipWrapper();
  // Get workspace tree
  const editors = props.workspace.editors;
  const fileTreeRoot = props.workspace.getFileTree();
  loadingPublishingWorkspace.value = true;
  publishWorkspaceTxId.value = '';
  try {
    const name = txtPublishWorkspaceName.value;
    const description = txtPublishWorkspaceDescription.value;
    
    // Load tree to zip
    zip.loadTreeToZip(fileTreeRoot, fileTreeRoot.name, editors);

    const contentBlob = await zip.getZipBlob();
    const content = await contentBlob.arrayBuffer();

    if (!content) {
      throw Error('Error creating zip file');
    }

    const arweaveWrapper = new ArweaveWrapper(selNetwork.value);
    const contentType = contentBlob.type;
    const key = props.login.key;
    const tags: {name: string, value: string}[] = [
      { name: 'App-Name', value: protocolName },
      { name: 'App-Version', value: protocolVersion },
      { name: 'Type', value: 'Workspace' },
      { name: 'WorkspaceName', value: name },
      { name: 'WorkspaceDescription', value: description },
    ]; 
    const loginMethod = props.login.method;
    const disableDispatch = !txtPublishWorkspaceDispatch.value;
    const tx = await arweaveWrapper.uploadFileToArweave(
      content,
      contentType,
      key,
      tags,
      loginMethod,
      disableDispatch
    );

    publishWorkspaceTxId.value = tx.id;

  } catch (err) {
    createToast(`${err}`,
      {
        type: 'danger',
        showIcon: true,
        position: 'bottom-right',
      });
  }
  loadingPublishingWorkspace.value = false;
};


const initModalFields = () => {
  txtPublishWorkspaceFilesList.value = getWorkspaceFilesAsString();
  txtPublishWorkspaceName.value = '';
  txtPublishWorkspaceDescription.value = '';
  publishWorkspaceTxId.value = '';
  txtPublishWorkspaceDispatch.value = false;
  workspaceSize.value = 0;
  getWorkspaceSize().then((size) => {
    if (size) {
      workspaceSize.value = size;
      if (size <= dataSizeLimitDispatch.value && !usageFee.value) {
        isDispatchAvailable.value = true;
      } else {
        isDispatchAvailable.value = false;
        txtPublishWorkspaceDispatch.value = false;
      }
    }
  }).catch((error) => {
    console.error('showModalPublishFunc', error);
  });
};

const closeModal = () => {
  txtPublishWorkspaceFilesList.value = '';
  showTracker.value = false;
  emit('close');
};

watchEffect(async () => {
  try {
    if (props.show && !showTracker.value) {
      showTracker.value = true;
      initModalFields();
    }
    
    const size = await getWorkspaceSize();
    if (size) {
      workspaceSize.value = size;
      if (size <= dataSizeLimitDispatch.value && !usageFee.value) {
        isDispatchAvailable.value = true;
      } else {
        isDispatchAvailable.value = false;
        txtPublishWorkspaceDispatch.value = false;
      }
    }

  } catch (error) {
    console.error('showModalPublishFunc', error);
  }

});

</script>
<style scoped lang="scss">
.small-txt {
  font-size: 12px;
}
.small-txt a {
  color: inherit;
}
.span-balance{
  font-size: 16px;
}
.usage-fee-txt {
  color: red !important;
}

</style>