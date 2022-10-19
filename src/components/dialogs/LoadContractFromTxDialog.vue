<template>
  <DefaultModal v-if="show">
    <template v-slot:header>
      <h3><DefaultIcon class="title-icon"
        icon="codicon-mirror" /><span>Import Contract from TX</span></h3>
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
          <label>Network</label>
          <select 
            v-model.trim="selNetwork">
            <option 
              v-for="(nItem, nIndex) in arweaveNetworks" 
              v-bind:key="nIndex" 
              :value="nIndex">{{ nItem.host }} ({{ nIndex }})</option>
          </select>
        </div>
        <div class="form-input">
          <label>TX ID</label>
          <input 
            v-model.trim="txtLoadTXFileName" 
            @keyup.enter="txtLoadTXFileName != '' ? loadFromTXModal(txtLoadTXFileName, selLoadTXLocation, workspace) : false"
            type="text">
          <a v-if="tx" class="link" @click="txtLoadTXFileName = tx">Use TX address from URL</a>
        </div>
        <div class="text-right form-radio">
          <label class="">
            <input 
              v-model.trim="txtLoadTXGetLastState" 
              type="checkbox"> Get last state (it can take longer to load)
          </label>
        </div>
      </template>
      <template v-if="loadingContractTX">
        Loading ... Please hold on!
      </template>
    </template>
    <template v-slot:footer>
      <div class="modal-footer text-right">
        <button 
          class="modal-button" 
          :class="{ 'modal-button-primary': txtLoadTXFileName }"
          :disabled="!txtLoadTXFileName"
          v-if="workspace && !loadingContractTX"
          @click="loadFromTXModal(txtLoadTXFileName, selLoadTXLocation, workspace)">
          <span >Load files into Workspace</span >
        </button>
        <button 
          class="modal-button" 
          disabled
          v-if="loadingContractTX">
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
import { ref, watchEffect } from 'vue';
import { ArweaveWrapper, arweaveNetworks } from '@/core/ArweaveWrapper';
import { ArDBWrapper } from '@/core/ArDBWrapper';
import { WarpContracts, WasmSrc } from '@/core/WarpContracts';
import { createToast } from 'mosha-vue-toastify';
import DefaultIcon from '@/components/atomic/DefaultIcon';
import DefaultModal from '@/components/atomic/DefaultModal.vue';

const props = defineProps({
  show: Boolean,
  workspace: Object,
  tx: String
});
const emit = defineEmits(['close']);
const showTracker = ref(false);

const txtLoadTXFileName = ref('');
const selLoadTXLocation = ref('');
const txtLoadTXGetLastState = ref(false);
const loadingContractTX = ref(false);
const selNetwork = ref('arweave-mainnet');

const closeModal = () => {
  showTracker.value = false;
  emit('close');
};

const initModalFields = () => {
  // Init fields
  selLoadTXLocation.value = '/';
  txtLoadTXFileName.value = '';
  txtLoadTXGetLastState.value = false;
  selNetwork.value = 'arweave-mainnet'
};

watchEffect(() => {
  if (props.show && !showTracker.value) {
    showTracker.value = true;
    initModalFields();
  }
});

const loadFromTXModal = async (tx: string, path: string) => {
  loadingContractTX.value = true;
  try {
    await loadEditorFromTX(tx, path);

    if (txtLoadTXGetLastState.value) {
      await loadLatestContractStateFromTX(tx, path);
    }
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


const loadEditorFromTX = async (tx: string, path: string) => {
  const arweaveWrapper = new ArweaveWrapper(selNetwork.value);
  const arweave = arweaveWrapper.arweave;
  const ardbWrapper = new ArDBWrapper(arweave);
  const ardb = ardbWrapper.ardb;
  let res = undefined;
  const onlyInParent= false;
  const inputEvent = new Event('empty-event');

  try {
    res = await ardb.search('transaction').id(
      tx
    ).findOne();
  } catch (err) {
    console.log('loadEditorFromTx', err)
  }


  if (res) {
    const tags = {};
    // Get contract if possible
    res.tags.forEach(async tag => {
      const key = tag.name;
      const value = tag.value;
      tags[key] = value;
    });
    const datatype = res.data.type;
    let data = '';
    let filename = `${tx}`;
    if (datatype === 'application/javascript') {
      filename = `${tx}.js`;

      data = await arweaveWrapper.getTXData(tx);
      createToast(`JS file found!`,
        {
          type: 'success',
          showIcon: true,
          position: 'bottom-right',
        });
    } else if (datatype === 'application/json') {
      filename = `${tx}.json`;
      data = await arweaveWrapper.getTXData(tx);
      const replacer = undefined;
      const space = 4;
      if (data) {
        data = JSON.stringify(JSON.parse(data), replacer, space);
      }
      createToast(`JSON file found!`,
        {
          type: 'success',
          showIcon: true,
          position: 'bottom-right',
        });
    } else if (datatype === 'application/wasm') {
      data = await arweaveWrapper.getTXData(tx, false);
      const buffer = Buffer.from(data);
      //filename = `${tx}.wasm`;
      const wasmSrc = new WasmSrc(buffer);
      data = await wasmSrc.sourceCode();

      // workspace.addEditor(inputEvent, onlyInParent, buffer.toString(), filename, path);
      createToast(`WASM source found!`,
      {
        type: 'success',
        showIcon: true,
        position: 'bottom-right',
      });

      // Load all source files
      for (const tmpFName of data.keys()) {
        const finalNameArr = tmpFName.split('/');
        let finalName = '';
        let finalPath = '';
        if (finalNameArr.length) {
          const finalIndex = finalNameArr.length - 1;
          finalName = finalNameArr[finalIndex];

          // Create new directories
          if (finalIndex - 1 >= 0) {
            finalPath = finalNameArr.slice(0, finalIndex).join('/');
            createDirectoryStructure(path, finalPath);
          }
        }

        const fileId = props.workspace.findFileIdByName(path, tmpFName);
        if (fileId < 0) {
          props.workspace.addEditor(
            inputEvent, 
            onlyInParent, 
            data.get(tmpFName), 
            finalName, 
            `${path}/${finalPath}`);
        } else {
          console.log(`${tmpFName} already in workspace!`);
          props.workspace.selectEditor(fileId, new Event('selectEditor'));
        }
      }

      
      // force End wasm
      return;
    } else {
      data = Object.prototype.hasOwnProperty.call(tags, 'Init-State') ?
      tags['Init-State'] : '';
      if (data) {
        filename = `${tx}.json`;
        const replacer = undefined;
        const space = 4;
        data = JSON.stringify(JSON.parse(data), replacer, space);
        createToast(`NFT Atomic Asset found! Loading state ...`,
        {
          type: 'success',
          showIcon: true,
          position: 'bottom-right',
        });
      } else {
        throw Error('Invalid contract source!');
      }
    }

    props.workspace.addEditor(inputEvent, onlyInParent, data, filename, path);
    // Search if it has a contract src available
    const contractSrc = Object.prototype.hasOwnProperty.call(tags, 'Contract-Src') ?
      tags['Contract-Src'] : '';

    if (contractSrc) {
      await loadEditorFromTX(tags['Contract-Src'], path, props.workspace);
    }

  } // If tx not found
  else {
    try {
      const gatewayUrl = arweaveWrapper.secondaryRedstoneGW;
      createToast(`Fetching contract from secondary gw ...`,
        {
          type: 'warning',
          showIcon: true,
          position: 'bottom-right',
      });
      const tmp_res = await fetch(`${gatewayUrl}/gateway/contracts/${tx}`);
      if (tmp_res.ok) {
        const tmp_data = JSON.parse(await tmp_res.text());
        let srcData = tmp_data.src;
        let initStateData = '';

        if (tmp_data.initState) {
          const replacer = undefined;
          const space = 4;
          initStateData = JSON.stringify(tmp_data.initState, replacer, space);
        }

        // Check if it is WASM
        let fileNameJs = `${tx}.js`;
        let WASMbuffer = null;
        if (!srcData && tmp_data.srcBinary) {
          fileNameJs = `${tx}.wasm`;
          srcData = undefined;
          WASMbuffer = Buffer.from(tmp_data.srcBinary);
        }
        const fileIdJs = props.workspace.findFileIdByName(path, fileNameJs);
        if (fileIdJs < 0 && srcData) {
          props.workspace.addEditor(inputEvent, onlyInParent, srcData, fileNameJs, path);
        } else if (fileIdJs >= 0) {
          console.log(`${tx}.js already in workspace!`);
          props.workspace.selectEditor(fileIdJs, new Event('selectEditor'));
        }

        const fileIdJson = props.workspace.findFileIdByName(path, `${tx}.json`);
        if (fileIdJson < 0 && initStateData) {
          props.workspace.addEditor(inputEvent, onlyInParent, initStateData, `${tx}.json`, path);
        } else if (fileIdJson >= 0) {
          console.log(`${tx}.json already in workspace!`);
          props.workspace.selectEditor(fileIdJson, new Event('selectEditor'));
        }

        // Load WASM
        if (!WASMbuffer) {
          // End function
          return;
        }

        const wasmSrc = new WasmSrc(WASMbuffer);
        const sourceCodeObj = await wasmSrc.sourceCode();

        createToast(`WASM source found!`,
        {
          type: 'success',
          showIcon: true,
          position: 'bottom-right',
        });

        // Load all source files
        for (const tmpFName of sourceCodeObj.keys()) {
          const finalNameArr = tmpFName.split('/');
          let finalName = '';
          let finalPath = '';
          if (finalNameArr.length) {
            const finalIndex = finalNameArr.length - 1;
            finalName = finalNameArr[finalIndex];

            // Create new directories
            if (finalIndex - 1 >= 0) {
              finalPath = finalNameArr.slice(0, finalIndex).join('/');
              createDirectoryStructure(path, finalPath);
            }
          }

          const fileId = props.workspace.findFileIdByName(path, tmpFName);
          if (fileId < 0) {
            props.workspace.addEditor(
              inputEvent, 
              onlyInParent, 
              sourceCodeObj.get(tmpFName), 
              finalName, 
              `${path}/${finalPath}`);
          } else {
            console.log(`${tmpFName} already in workspace!`);
            props.workspace.selectEditor(fileId, new Event('selectEditor'));
          }
        }
        
      }
    } catch (err) {
      console.log('loadEditorFromTx2', err)
    }
  }
};


const loadLatestContractStateFromTX = async (tx: string, path: string) => {
  const arweaveWrapper = new ArweaveWrapper(selNetwork.value);
  const arweave = arweaveWrapper.arweave;
  const warpContracts = new WarpContracts(arweave);
  const { sortKey, cachedValue } = await warpContracts.readState(tx);
  const state = cachedValue &&
    Object.prototype.hasOwnProperty.call(cachedValue, 'state') ?
    cachedValue.state : {};
    
  const onlyInParent= false;
  const inputEvent = new Event('empty-event');
  const filename = `${tx}-latest.json`;
  const replacer = undefined;
  const space = 4;
  props.workspace.addEditor(
    inputEvent,
    onlyInParent,
    JSON.stringify(state, replacer, space),
    filename, path);
  createToast(`Contract latest state loaded!`,
    {
      type: 'success',
      showIcon: true,
      position: 'bottom-right',
    });
};

const createDirectoryStructure = (root: string, path: string) => {
  const elements = path.split('/');
  let tmpPath = `${root}`;
  for (const e of elements) {
    try {
      props.workspace.addFolder(`${tmpPath}`, e, true);
      tmpPath += `/${e}`;
    } catch (err) {
      console.log('dirStructure:', err);
    }
  }
};
</script>
<style scoped lang="scss">
.link {
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
}
</style>