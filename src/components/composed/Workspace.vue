<template>
  <div class="arcode-workspace">
    <div class="workspace-bg text-center" >
      <Logo />
      <h4 class="text-center arcode-title" >
        ArCode Studio v{{ appVersion }}
      </h4>
      <h5 class="text-center arcode-instructions">
         Double Click to Start 
      </h5>
      <h5 v-if="loadingFromTX" class="text-center">
        Loading data ...
      </h5>
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
              <Icon icon="codicon-new-file" />
          </button>
          <button 
            class="button" 
            type="button" 
            @click="scrollEditor('left')"
            data-tippy-workspace-content="Scroll left">
              <Icon icon="codicon-chevron-left" />
          </button>
          <button 
            class="button" 
            type="button" 
            @click="scrollEditor('right')"
            data-tippy-workspace-content="Scroll right">
              <Icon icon="codicon-chevron-right" />
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
import Logo from '@/components/atomic/Logo';
import Icon from '@/components/atomic/Icon';
import { appVersion } from '@/core/AppSettings';
import { createToast } from 'mosha-vue-toastify';
import tippy from 'tippy.js';
import { lootContract } from '@/core/contracts/LootContract';
import { token } from '@/core/contracts/Token';
import { tokenPST } from '@/core/contracts/TokenPST';
import { ArweaveHandler } from '@/core/ArweaveHandler';
import { WasmSrc } from 'redstone-smartweave';

const props = defineProps({
  theme: String,
  tx: String
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

const addFolder =  (path: string, folderName: string) => {
  try {
    workspace.fileTree.addFolder(path, folderName);
  } catch (err) {
    createToast(`${err}`,
      {
        type: 'danger',
        showIcon: true,
        position: 'bottom-right',
      });
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
  addFolder('/Contracts', 'loot-contract');
  addFolder('/Contracts', 'token');
  addFolder('/Contracts', 'token-pst');
  const emptyEvent = new Event('emptyEvent');

  addEditor(
    emptyEvent,
    false,
    lootContract.state,
    lootContract.stateName,
    '/contracts/loot-contract',
    false);
  addEditor(
    emptyEvent,
    false,
    lootContract.contract,
    lootContract.name,
    '/contracts/loot-contract',
    false);
  addEditor(
    emptyEvent,
    false,
    token.contract,
    token.name,
    '/contracts/token',
    false);
  addEditor(
    emptyEvent,
    false,
    token.state,
    token.stateName,
    '/contracts/token',
    false);
  addEditor(
    emptyEvent,
    false,
    tokenPST.contract,
    tokenPST.name,
    '/contracts/token-pst',
    false);
  addEditor(
    emptyEvent,
    false,
    tokenPST.state,
    tokenPST.stateName,
    '/contracts/token-pst',
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
    createToast(`Running Single File mode.`,
      {
        type: 'warning',
        showIcon: true,
        position: 'bottom-right',
      });
    loadingFromTX.value = true;
    try {
      addFolder('/', tx);
      await loadEditorFromTX(tx, `/${tx}`);
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

const loadEditorFromTX = async (tx: string, path: string) => {
  const arweave = new ArweaveHandler();
  const res = await arweave.ardb.search('transaction').id(
    tx
  ).findOne();
  if (res) {
    const tags = {};
    // Get contract if possible
    res.tags.forEach(async tag => {
      let key = tag.name;
      let value = tag.value;
      tags[key] = value;
    });
    const datatype = res.data.type;
    const onlyInParent= false;
    const inputEvent = new Event('empty-event');

    let data = '';
    let filename = `${tx}`;
    if (datatype === 'application/javascript') {
      filename = `${tx}.js`;
      data = await arweave.getTXData(tx);
      createToast(`JS file found!`,
        {
          type: 'success',
          showIcon: true,
          position: 'bottom-right',
        });
    } else if (datatype === 'application/json') {
      filename = `${tx}.json`;
      data = await arweave.getTXData(tx);
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
      data = await arweave.getTXData(tx, false);
      var buffer = Buffer.from(data);
      filename = `${tx}.wasm`;

      const fileId = workspace.fileTree.findFileIdByName(path, filename);
      if (fileId < 0) {
        addEditor(inputEvent, onlyInParent, buffer.toString(), filename, path);
      } else {
        console.log(`${filename} already in workspace!`);
        workspace.selectEditor(fileId, new Event('selectEditor'));
      }

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
        const fileId = workspace.fileTree.findFileIdByName(path, tmpFName);
        if (fileId < 0) {
          addEditor(inputEvent, onlyInParent, data.get(tmpFName), tmpFName, path);
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
      await loadEditorFromTX(tags['Contract-Src'], path);
    }
    
  }
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
