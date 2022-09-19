<template>
  <div class="arcode-workspace">
    <div class="workspace-bg text-center" >
      <AnimatedLogo />
      <h4 class="text-center arcode-title" >
        ArCode Studio v{{ appVersion }}
      </h4>
      <h5 class="text-center arcode-instructions">
         Double Click to Start 
      </h5>
      <div v-if="loadingFromTX" class="text-center">
        <div
        class="lds-ring lds-ring-small">
        <div></div><div></div><div></div><div></div></div>
      </div>
    </div>
    <div class="workspace" @dblclick="addEditor($event, true)">
      <div class="tabs">
        <div 
          id="arcode-editor-tabs-container" 
          class="tabs-container" 
          @dblclick="addEditor($event, true)">
          <template
            v-for="editor in editors"
            :key="editor.id">
            <div 
              class="tab" 
              @click="selectEditor(editor.id, $event)"
              v-if="editor.active"
              :class="{ active: editor.id == getCurrentEditorId() }"> 
              <div class="tab-button-label">{{ editor.name }}</div>
              <button 
                class="button tab-button-close" 
                type="button" 
                @click="closeEditor(editor.id, $event)">x</button>
            </div>
          </template>
        </div>
        <div class="tabs-menu">
          <button 
            class="button" 
            type="button" 
            @click="addEditor($event)"
            data-tippy-workspace-content="New File">
              <DefaultIcon icon="codicon-new-file" />
          </button>
          <button 
            class="button" 
            type="button" 
            @click="scrollEditor('left')"
            data-tippy-workspace-content="Scroll left">
              <DefaultIcon icon="codicon-chevron-left" />
          </button>
          <button 
            class="button" 
            type="button" 
            @click="scrollEditor('right')"
            data-tippy-workspace-content="Scroll right">
              <DefaultIcon icon="codicon-chevron-right" />
          </button>
        </div>
      </div>

      <template
        v-for="editor in editors"
        :key="editor.id">
        <div class="editor"
          v-if="editor.active && getCurrentEditorId() >= 0"
          :class="{ active: editor.id == getCurrentEditorId() }"
          :ref="el => { if (el) { divs[editor.id] = el; } }"></div>
      </template>
      
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { 
  ref, onBeforeUpdate, watchEffect, onMounted
} from 'vue';
import { Workspace } from '@/core/Workspace';
import AnimatedLogo from '@/components/atomic/AnimatedLogo';
import DefaultIcon from '@/components/atomic/DefaultIcon';
import { appVersion } from '@/core/AppSettings';
import { createToast } from 'mosha-vue-toastify';
import tippy from 'tippy.js';
import { greeterContract } from '@/core/contract-sources/Greeter';
import { ArweaveWrapper } from '@/core/ArweaveWrapper';
import { ArDBWrapper } from '@/core/ArDBWrapper';
import { WasmSrc } from '@/core/WarpContracts';

const props = defineProps({
  theme: String,
  tx: String,
  networkParam: String
});
// const emit = defineEmits(['workspace-change']);

const divs = ref([]);
const baseTheme = ref(props.theme);
const workspace = new Workspace(baseTheme.value, 'arcode-editor-tabs-container', props.tx);
const editors = workspace.editors;
const loadingFromTX = ref(false);

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
    workspace.addEditor(
      event, onlyInParent, content,
      path, fileName, baseTheme.value,
      active, inFileTree, editorId);
  } catch (err) {
    createToast(`${err}`,
      {
        type: 'danger',
        showIcon: true,
        position: 'bottom-right',
      });
  }
  // emit('workspace-change', editors);
};
const selectEditor = (editorId: number, event: Event) => {
  workspace.selectEditor(editorId, event);
};
const deleteEditor = (editorId: number, event: Event) => {
  workspace.deleteEditor(editorId, event);
};

const deleteFolder = (path: string, event: Event) => {
  event.stopPropagation();
  event.preventDefault();
  workspace.deleteFolder(path);
};
const closeEditor = (editorId: number, event: Event) => {
  workspace.closeEditor(editorId, event);
};
const scrollEditor = (direction: string, translate = 120) => {
  workspace.scrollEditor(direction, translate);
};
const getEditorData = (editorId: number) => {
  return workspace.getEditorView(editorId);
};

const findFileIdByName = (path: string, filename: string) => {
  return workspace.fileTree.findFileIdByName(path, filename);
};

const setTheme = (editorId: number, theme: string) => {
  return workspace.setTheme(editorId, theme);
};
const setAppTheme = (theme: string) => {
  baseTheme.value = theme;
};

const getCurrentEditorId = () => {
  return workspace.currentEditorId;
};

const getFileTree = () => {
  return workspace.fileTree.tree;
};

const addFolder =  (path: string, folderName: string, debugInConsole=false) => {
  try {
    workspace.fileTree.addFolder(path, folderName);
  } catch (err) {
    if (debugInConsole) {
      console.error('addFolder', err);
    } else {
      createToast(`${err}`,
        {
          type: 'danger',
          showIcon: true,
          position: 'bottom-right',
        });
    }
  }
};

const isEditorActive = (editorId: number) => {
  return workspace.isEditorActive(editorId);
};

const getFileTreePaths = () => {
  return workspace.fileTree.getTreeAsPathStringArr();
};

const getFileTreeFilenames = () => {
  return workspace.fileTree.getTreeAsFilenameStringArr();
};
const updateEditorName = (editorId: number, newName: string) => {
  try {
    return workspace.updateEditorNameFull(editorId, newName);
  } catch (err) {
    createToast(`${err}`,
      {
        type: 'danger',
        showIcon: true,
        position: 'bottom-right',
      });
  }
};

const loadExamples = () => {
  addFolder('/', 'Contracts');
  addFolder('/Contracts', 'greeter');
  const emptyEvent = new Event('emptyEvent');

  addEditor(
    emptyEvent,
    false,
    greeterContract.contract,
    greeterContract.name,
    '/contracts/greeter',
    false);
  addEditor(
    emptyEvent,
    false,
    greeterContract.state,
    greeterContract.stateName,
    '/contracts/greeter',
    false);
  
  window.setTimeout(() => {
    workspace.currentContent = '';
  }, 400)
};

const loadTree = () => {
  const filenames = getFileTreeFilenames();
  const emptyEvent = new Event('emptyEvent');

  for (const editorId in filenames) {
    //alert(filenames[editorId] + editorId)
    const explodePath = filenames[editorId].split('/');
    const fname = explodePath[explodePath.length - 1];
    const content = workspace.getCachedContent(editorId);
    explodePath.pop();

    addEditor(
      emptyEvent,
      false,
      content,
      fname,
      `${explodePath.join('/')}/`,
      false,
      false,
      editorId);
    
  }

  window.setTimeout(() => {
    workspace.currentContent = '';
  }, 400)
  
};

const getCurrentContent = () => {
  return workspace.currentContent;
};

// Expose public methods
defineExpose({
  getEditorData,
  editors,
  deleteEditor,
  selectEditor,
  addEditor,
  setTheme,
  setAppTheme,
  getFileTree,
  addFolder,
  getCurrentEditorId,
  isEditorActive,
  getFileTreePaths,
  closeEditor,
  updateEditorName,
  getCurrentContent,
  deleteFolder,
  getFileTreeFilenames,
  findFileIdByName
});

// make sure to reset the refs before each update
onBeforeUpdate(() => {
  divs.value = []
});
watchEffect(() => {
  const divsCopy = divs.value;
  // Rebuild editors in workspace
  for (const id in divsCopy) {
    const div: HTMLElement = divsCopy[id] as HTMLElement;
    const divContent: string = div.innerHTML;
    if (divContent.trim() === '') {
      workspace.mountEditor(+id, div);
    }
  }
}, 
{
  flush: 'post'
});

onMounted(async () => {
  tippy('[data-tippy-workspace-content]', {
    arrow: true,
    placement: 'bottom',
    content: (reference) => reference.getAttribute('data-tippy-workspace-content')
  });

  // Load contract from url
  const tx = props.tx;
  // IF Single File Mode
  if (tx) {
    createToast(`Running in Single File Mode.`,
      {
        type: 'warning',
        showIcon: true,
        position: 'bottom-right',
      });
    loadingFromTX.value = true;
    try {
      const network = props.networkParam ? props.networkParam : undefined;
      addFolder('/', tx);
      await loadEditorFromTX(tx, `/${tx}`, network);
    } catch (err) {
      createToast(`${err}`,
        {
          type: 'danger',
          showIcon: true,
          position: 'bottom-right',
        });
    }
    loadingFromTX.value = false;
  } else {
    const tree = getFileTree();
    if (tree.children.length === 0) {
      // Load examples
      loadExamples();
    } else {
     loadTree();
    }
  }

});

const loadEditorFromTX = async (tx: string, path: string, networkParam?: string) => {
  const arweaveWrapper = new ArweaveWrapper(networkParam);
  const arweave = arweaveWrapper.arweave;
  const ardbWrapper = new ArDBWrapper(arweave);
  const ardb = ardbWrapper.ardb;
  const gatewayUrl = arweaveWrapper.secondaryRedstoneGW;
  let res = undefined;

  try {
    res = await ardb.search('transaction').id(
      tx
    ).findOne();
  } catch (err) {
    console.log('loadEditorFromTx', err)
  }
  const onlyInParent= false;
  const inputEvent = new Event('empty-event');

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
      /*
      const fileId = workspace.fileTree.findFileIdByName(path, filename);
      if (fileId < 0) {
        addEditor(inputEvent, onlyInParent, buffer.toString(), filename, path);
      } else {
        console.log(`${filename} already in workspace!`);
        workspace.selectEditor(fileId, new Event('selectEditor'));
      }
      */

      const wasmSrc = new WasmSrc(buffer);
      data = await wasmSrc.sourceCode();

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

        const fileId = workspace.fileTree.findFileIdByName(path, tmpFName);
        if (fileId < 0) {
          addEditor(
            inputEvent, 
            onlyInParent, 
            data.get(tmpFName), 
            finalName, 
            `${path}/${finalPath}`);
        } else {
          console.log(`${tmpFName} already in workspace!`);
          workspace.selectEditor(fileId, new Event('selectEditor'));
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

    const fileId = workspace.fileTree.findFileIdByName(path, filename);
    if (fileId < 0) {
      addEditor(inputEvent, onlyInParent, data, filename, path);
    } else {
      console.log(`${filename} already in workspace!`);
      workspace.selectEditor(fileId, new Event('selectEditor'));
    }
    
    
    // Search if it has a contract src available
    const contractSrc = Object.prototype.hasOwnProperty.call(tags, 'Contract-Src') ?
      tags['Contract-Src'] : '';

    if (contractSrc) {
      await loadEditorFromTX(tags['Contract-Src'], path, networkParam);
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
        const WASMbuffer = Buffer.from(tmp_data.srcBinary);
        if (!srcData && tmp_data.srcBinary) {
          fileNameJs = `${tx}.wasm`;
          srcData = undefined;
        }
        const fileIdJs = workspace.fileTree.findFileIdByName(path, fileNameJs);
        if (fileIdJs < 0 && srcData) {
          addEditor(inputEvent, onlyInParent, srcData, fileNameJs, path);
        } else if (fileIdJs >= 0) {
          console.log(`${tx}.js already in workspace!`);
          workspace.selectEditor(fileIdJs, new Event('selectEditor'));
        }

        const fileIdJson = workspace.fileTree.findFileIdByName(path, `${tx}.json`);
        if (fileIdJson < 0 && initStateData) {
          addEditor(inputEvent, onlyInParent, initStateData, `${tx}.json`, path);
        } else if (fileIdJson >= 0) {
          console.log(`${tx}.json already in workspace!`);
          workspace.selectEditor(fileIdJson, new Event('selectEditor'));
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
          

          const fileId = workspace.fileTree.findFileIdByName(path, tmpFName);
          if (fileId < 0) {
            addEditor(
              inputEvent, 
              onlyInParent, 
              sourceCodeObj.get(tmpFName), 
              finalName, 
              `${path}/${finalPath}`);
          } else {
            console.log(`${tmpFName} already in workspace!`);
            workspace.selectEditor(fileId, new Event('selectEditor'));
          }
        }
        
      }
    } catch (err) {
      console.log('loadEditorFromTx2', err)
    }
  }

};


const createDirectoryStructure = (root: string, path: string) => {
  const elements = path.split('/');
  let tmpPath = `${root}`;
  for (const e of elements) {
    try {
      addFolder(`${tmpPath}`, e, true);
      tmpPath += `/${e}`;
    } catch (err) {
      console.log('dirStructure:', err);
    }
  }

  console.log('ttttt', tmpPath)
  // 
};

</script>

<style scoped lang="scss">
$workspace-tabs-height: 35px;

.arcode-workspace {
  height: 100%;
  position: relative;
}
.workspace-bg {
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: absolute;
  z-index: 0;
}

.workspace {
  height: 100%;
  width: 100%;
  z-index: 10;
  position: absolute;
  z-index: 0;
}

.workspace .tabs{
  width: 100%;
  height: $workspace-tabs-height;
}

.workspace .tabs .tabs-container{
  height: 100%;
  width: 54%;
  float: left;
  display: flex;
  flex-direction: row;
  overflow-x: hidden;

}

.workspace .tabs .tabs-container .tab:hover {
  cursor: pointer;
}
.workspace .tabs .button {
  border: 0;
  margin-left: 8px;
  font-size: 16px;
  cursor: pointer;
}
.workspace .tabs .tabs-container .tab {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  line-height: $workspace-tabs-height;
  font-size: 12px;
  min-width: 120px;
  width: 100%;
  display: flex;
  flex-direction: row;

}

.workspace .tabs .tabs-container .tab-button-label {
  flex-basis: 0;
  flex-grow: 1;
  padding-left: 10px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.workspace .tabs .tabs-container .tab-button-close {
}

.workspace .tabs .tabs-menu{
  height: 100%;
  width: 46%;
  float: left;
  text-align: right;
  padding-right: 10px;
  line-height: $workspace-tabs-height;
  overflow: hidden;
}


@media(min-width: 600px) {
  .workspace .tabs .tabs-container{
    width: 70%;
  }
  .workspace .tabs .tabs-menu{
    width: 30%;
  }
}


@media(min-width: 800px) {
  .workspace .tabs .tabs-container{
    width: 84%;
  }
  .workspace .tabs .tabs-menu{
    width: 16%;
  }
}

.workspace .editor{
  height: calc(100% - $workspace-tabs-height);
  overflow-y: auto;
  width: 100%;
  position: absolute;
  z-index: 0;
}

.workspace .editor.active{
  z-index: 100;
}

.arcode-title {
  margin-bottom: 0px;
}

.arcode-instructions {
  font-size: 10px;
  padding: 4px 8px;
  background: black;
  border-radius: 20px;
  color: white;
}

</style>
