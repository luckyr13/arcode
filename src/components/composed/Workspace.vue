<template>
  <div class="arcode-workspace">
    <div class="workspace-bg text-center" >
      <img class="logo" alt="arCode" src="@/assets/logo.png">
      <h4 class="text-center arcode-title" >
        ArCode Studio v{{ appVersion }}
      </h4>
      <h5 class="text-center arcode-instructions">
         Double Click to Start 
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
import Icon from '@/components/atomic/Icon';
import { appVersion } from '@/core/AppSettings';
import { createToast } from 'mosha-vue-toastify';
import tippy from 'tippy.js';
import { lootContract } from '@/core/contracts/LootContract';
import { token } from '@/core/contracts/Token';
import { tokenPST } from '@/core/contracts/TokenPST';

const props = defineProps({
  theme: String
});
// const emit = defineEmits(['workspace-change']);

const divs = ref([]);
const baseTheme = ref(props.theme);
const workspace = new Workspace(baseTheme.value, 'arcode-editor-tabs-container');
const editors = workspace.editors;
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
const closeEditor = (editorId: number, event: Event) => {
  workspace.closeEditor(editorId, event);
};
const scrollEditor = (direction: string, translate = 120) => {
  workspace.scrollEditor(direction, translate);
};
const getEditorData = (editorId: number) => {
  return workspace.getEditorView(editorId);
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
  getCurrentContent
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

onMounted(() => {
  tippy('[data-tippy-workspace-content]', {
    arrow: true,
    placement: 'bottom',
    content: (reference) => reference.getAttribute('data-tippy-workspace-content')
  });

  const tree = getFileTree();
  if (tree.children.length === 0) {
    // Load examples
    loadExamples();
  } else {
    loadTree();
  }

});




</script>

<style scoped lang="scss">
$workspace-tabs-height: 35px;
.logo {
  width: 20%;
}

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
