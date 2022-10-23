<template>
  <DefaultModal v-if="show">
    <template v-slot:header>
      <h3><DefaultIcon class="title-icon"
        icon="codicon-mirror" /><span>Import Workspace from TX</span></h3>
    </template>
    <template v-slot:body>
      <template v-if="!loadingContractTX">
        <div class="form-input">
          <label>Destination Folder</label>
          <select v-model.trim="selLoadTXLocation">
            <option value="/">/</option>
            <template v-for="path of workspace.getFileTreePaths()" :key="path">
              <option v-if="path" :value="path">{{ path }}</option>
            </template>
          </select>
        </div>
        
        <div class="form-input">
          <label>TX ID</label>
          <input 
            v-model.trim="txtLoadTXTxField" 
            @keyup.enter="txtLoadTXTxField != '' ? loadFromTXModal(txtLoadTXTxField, selLoadTXLocation) : false"
            type="text">
        </div>
        <div class="form-input">
          <label>
            <strong>Data size: </strong> {{ txDataSize }} bytes / {{ byte2kb(txDataSize) }} kb / {{ kb2mb(byte2kb(txDataSize)) }} mb
          </label>
        </div>
        <p class="tx" v-if="txDataSize && kb2mb(byte2kb(txDataSize)) >= 1">
          <strong class="warning">⚠️ Overflow Warning!</strong> Data size is too big.
        </p>
      </template>
      <template v-if="loadingContractTX">
        Loading ... Please hold on!
      </template>
    </template>
    <template v-slot:footer>
      <div class="modal-footer text-right">
        <button 
          class="modal-button" 
          :class="{ 'modal-button-primary': txtLoadTXTxField }"
          :disabled="!txtLoadTXTxField"
          v-if="!loadingContractTX && !loadingMetadata"
          @click="loadFromTXModal(txtLoadTXTxField, selLoadTXLocation)">
          <span >Load Workspace</span >
        </button>
        <button 
          class="modal-button" 
          disabled
          v-if="loadingContractTX || loadingMetadata">
          <span >Loading ...</span >
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
import { ref, watchEffect, onMounted } from 'vue';
import { ArweaveWrapper, arweaveNetworks, defaultNetwork } from '@/core/ArweaveWrapper';
import { ArDBWrapper } from '@/core/ArDBWrapper';
import { WarpContracts, WasmSrc } from '@/core/WarpContracts';
import { createToast } from 'mosha-vue-toastify';
import DefaultIcon from '@/components/atomic/DefaultIcon';
import DefaultModal from '@/components/atomic/DefaultModal.vue';
import { JSZipWrapper } from '@/core/JSZipWrapper';

const props = defineProps({
  show: Boolean,
  workspace: Object,
  tx: String,
  txField: String,
  networkParam: String
});
const emit = defineEmits(['close']);
const showTracker = ref(false);

const txtLoadTXTxField = ref('');
const selLoadTXLocation = ref('');
const loadingContractTX = ref(false);
const defaultSelNetwork = props.networkParam ? props.networkParam : defaultNetwork;
const selNetwork = ref(defaultSelNetwork);
const txDataSize = ref(0);
const loadingMetadata = ref(false);

const closeModal = () => {
  showTracker.value = false;
  emit('close');
};

const initModalFields = async () => {
  // Init fields
  txtLoadTXTxField.value = props.txField;
  selLoadTXLocation.value = '/';
  await loadTxMetadata();
  selNetwork.value = defaultSelNetwork;
};

async function loadTxMetadata() {
  loadingMetadata.value = true;
  try {
    // Load metadata
    const arweaveWrapper = new ArweaveWrapper();
    const ardbWrapper = new ArDBWrapper(arweaveWrapper.arweave);
    const txMetadata = await ardbWrapper.findOneTx(props.txField);
    txDataSize.value = 0;

    if (txMetadata && txMetadata.data && txMetadata.data.size) {
      txDataSize.value = parseInt(txMetadata.data.size);
    }

  } catch (error) {
    createToast(`${error}`,
      {
        type: 'danger',
        showIcon: true,
        position: 'bottom-right',
      });
  }
  loadingMetadata.value = false;
}

watchEffect(() => {
  if (props.show && !showTracker.value) {
    showTracker.value = true;
    initModalFields();
  }
});


const loadFromTXModal = async (tx: string, path: string) => {
  loadingContractTX.value = true;
  try {
    await loadWorkspaceFromParam(tx, path);

  } catch (err) {
    createToast(`${err}`,
      {
        type: 'danger',
        showIcon: true,
        position: 'bottom-right',
      });
  }
  loadingContractTX.value = false;
  closeModal();
};

const loadWorkspaceFromParam = async (workspaceId: string, path: string) => {
  const arweaveWrapper = new ArweaveWrapper();
  const asString = false;
  const file = await arweaveWrapper.getTXData(workspaceId, asString);
  await openWorkspace_helper(file, path);
};


const openWorkspace_helper = (zipFile: File, path: string): Promise<void> => {
  const zip = new JSZipWrapper();
  const method = new Promise<string>((resolve, reject) => {
    zip.openZip(zipFile).then((zFile) => {
      const files = [];

      zFile.forEach(function (relativePath, zipEntry) {
        if (zipEntry.dir) {
          const fullPath = zipEntry.name.slice(0, -1);
          createDirectoryStructureFromPath(fullPath, path);
        } else {
          files.push(zipEntry);
        }
      });

      // Add files
      for (const file of files) {
        const emptyEvent = new Event('emptyEvent');
        const fragments = file.name.split('/');
        const realFName = fragments[fragments.length - 1];
        const rootPath = path.length && path[path.length - 1] !== '/' ?
          `${path}/` : path;
        const tmpPath = rootPath + file.name.substring(0, file.name.length - (realFName.length + 1));
        
        zFile.file(file.name).async("string").then((data) => {
          addEditor(
            emptyEvent,
            false,
            data,
            realFName,
            tmpPath,
            false);
        }).catch((error) => {
          console.error('zipFE:', error);
        })

        
      }
      resolve();
    }).catch((error) => {
      createToast(`${error}`,
      {
        type: 'danger',
        showIcon: true,
        position: 'bottom-right',
      });
      reject(error);
    });

  });
  return method;
};

const createDirectoryStructureFromPath = (fullPath: string, basePath: string) => {
  const elements = fullPath.split('/');
  let tmpPath = basePath;

  for (const e of elements) {
    try {
      addFolder(tmpPath, e, true);
      if (e) {
        tmpPath += `/${e}`;
      }
    } catch (err) {
      console.log('dirStructure:', err);
    }
  }
};

const addEditor = (
  event: Event, 
  onlyInParent= false, 
  content='', 
  fileName='', 
  path='/',
  active=true,
  inFileTree=true,
  editorId=-1) => {
  try {
    props.workspace.addEditor(
      event, onlyInParent, content,
      fileName, path, 
      active, inFileTree, editorId);
  } catch (err) {
    createToast(`editor: ${err}`,
      {
        type: 'danger',
        showIcon: true,
        position: 'bottom-right',
      });
  }
  // emit('workspace-change', editors);
};


const addFolder =  (path: string, folderName: string, debugInConsole=false) => {
  try {
    props.workspace.addFolder(path, folderName, debugInConsole);
  } catch (err) {
    if (debugInConsole) {
      console.error('addFolder', err);
    } else {
      createToast(`folder: ${err}`,
        {
          type: 'danger',
          showIcon: true,
          position: 'bottom-right',
        });
    }
  }
};
function byte2kb(bytes: number) {
  return (bytes / 1024).toFixed(4);
}

function kb2mb(kb: number) {
  return (kb / 1024).toFixed(4);
}
</script>
<style scoped lang="scss">
.link {
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
}
.warning {
  color:  red;
}
.tx {
  font-size: 16px;
  margin-bottom: 12px;
  text-align: center;
}
</style>