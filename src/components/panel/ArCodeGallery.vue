<template>
<div class="arcode-main-toolbar-panel-title panel-title">
  ArCode Gallery
</div>
<ul class="file-menu">
  <li 
    v-if="mainAddress">
    <button 
      tabindex="0" 
      @click="showModalMyGalleryOpen()">
      <DefaultIcon class="menu-icon"
      icon="codicon-circuit-board" />
      <span>My Gallery</span>
    </button>
  </li>
  <li v-else>
    <button class="disabled">
      <DefaultIcon class="menu-icon"
      icon="codicon-circuit-board" />
      <span>My Gallery</span>
    </button>
  </li>
  <li 
    v-if="mainAddress">
    <button 
      tabindex="0" 
      @click="showModalPublishWorkspaceFunc()">
      <DefaultIcon class="menu-icon"
      icon="codicon-cloud-upload" />
      <span>Publish Workspace</span>
    </button>
  </li>
  <li v-else>
    <button class="disabled">
      <DefaultIcon class="menu-icon"
      icon="codicon-cloud-upload" />
      <span>Publish Workspace</span>
    </button>
  </li>
  
  <li>
    <a 
      class="gallery-link"
      tabindex="0" 
      href="https://gallery.arcode.studio"
      target="_blank">
      <DefaultIcon class="menu-icon"
      icon="codicon-link-external" />
      <span>Visit ArCode Gallery</span>
    </a>
  </li>
  
</ul>
<transition name="fade">
  <DefaultModal v-if="showModalPublishWorkspace" @close="showModalPublishWorkspace = false">
    <template v-slot:header>
      <h3><DefaultIcon class="title-icon"
        icon="codicon-cloud-upload" /><span>Publish on ArCode Gallery</span></h3>
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
        {{ publishWorkspaceTxId }}
      </template>
      
    </template>
    <template v-slot:footer>
      <div class="modal-footer text-right">
        <button 
          class="modal-button" 
          :class="{ 'modal-button-primary': txtPublishWorkspaceName }"
          :disabled="!txtPublishWorkspaceName"
          v-if="workspace && !loadingPublishingWorkspace"
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
          @click="showModalPublishWorkspace = false; txtPublishWorkspaceFilesList = ''">
          Close
        </button>
      </div>
    </template>
  </DefaultModal>
</transition>
<transition name="fade">
  <DefaultModal v-if="showModalMyGallery" @close="showModalMyGallery = false">
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
          @click="showModalMyGallery = false;">
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
import DefaultIcon from '@/components/atomic/DefaultIcon';
import DefaultWorkspace from '@/components/composed/DefaultWorkspace.vue';
import DefaultModal from '@/components/atomic/DefaultModal.vue';

import fileDownload from 'js-file-download';
import { EditorViewMetadata } from '@/core/interfaces/EditorViewMetadata';
import { ArweaveWrapper, arweaveNetworks } from '@/core/ArweaveWrapper';
import { ArDBWrapper } from '@/core/ArDBWrapper';
import { createToast } from 'mosha-vue-toastify';
import { WarpContracts } from '@/core/WarpContracts';
import { JSZipWrapper } from '@/core/JSZipWrapper';
import { protocolName, protocolVersion } from '@/core/AppSettings';

const showModalPublishWorkspace = ref(false);
const showModalMyGallery = ref(false);
const loadingPublishingWorkspace = ref(false);
const selNetwork = ref('arweave-mainnet');
const networks = computed(() => {
  return arweaveNetworks;
});

const props = defineProps({
  workspace: Object,
  tx: String,
  login: Object,
  tokenState: Object
});

const txtPublishWorkspaceName = ref('');
const txtPublishWorkspaceDescription = ref('');
const txtPublishWorkspaceFilesList = ref('');
const txtPublishWorkspaceDispatch = ref(false);
const publishWorkspaceTxId = ref('');
const isDispatchAvailable = ref(false);
const mainAddress = computed(() => {
  return props.login.mainAddress;
});
const workspaceSize = ref(0);
const contractSettings = computed(() => {
  const settings = props.tokenState.settings ? props.tokenState.settings : [];
  return new Map(settings);
});
const appFeeInWinston = computed(() => {
  return contractSettings.value.get('appFeeInWinston');
});
const globalArweaveWrapper = new ArweaveWrapper();
const appFeeInAr = computed(() => {
  return globalArweaveWrapper.winstonToAr(appFeeInWinston.value);
});
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
const balance = ref('0');
const dataSizeLimitDispatch = computed(() => {
  return globalArweaveWrapper.dataSizeLimitDispatch;
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
    const disableDispatch = true;
    const tx = await arweaveWrapper.uploadFileToArweave(
      content,
      contentType,
      key,
      tags,
      loginMethod,
      disableDispatch
    );

    publishWorkspaceTxId.value = tx;

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



const showModalPublishWorkspaceFunc = () => {
  showModalPublishWorkspace.value = true;
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

const showModalMyGalleryOpen = () => {
  showModalMyGallery.value = true;
};

watchEffect(async () => {
  try {
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
.title-icon {
  float: left;
  line-height: 32px;
  font-size: 32px !important;
}
h3 span {
  margin-left: 12px;
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

.file-menu li button, .file-menu li a {
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

.file-menu li a {
  padding: 0px 6px 0px 6px;

}

.file-menu li button:hover, .file-menu li a:hover {
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
.form-input select,
.form-input textarea
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
.gallery-link {
  margin-top: 40px;
}
</style>