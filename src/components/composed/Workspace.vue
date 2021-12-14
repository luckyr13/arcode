<template>
  <div class="arcode-workspace">
    <div class="workspace-bg text-center" >
      <img class="logo" alt="arCode" src="@/assets/logo.png">
      <h4 class="text-center arcode-title" >
        arCode IDE v{{ appVersion }}
      </h4>
      <h5 class="text-center arcode-instructions">
         Double click to start 
      </h5>
    </div>
    <div class="workspace" @dblclick="addEditor($event, true)">
      <div class="tabs">
        <div 
          id="arcode-editor-tabs-container" 
          class="tabs-container" 
          @dblclick="addEditor($event, true)">
          <div 
            class="tab" 
            @click="selectEditor(editor.id, $event)"
            v-for="editor in editors"
            :key="editor.id"
            :class="{ active: editor.active }"> 
            <div class="tab-button-label">{{ editor.name }}</div>
            <button 
              class="button tab-button-close" 
              type="button" 
              @click="deleteEditor(editor.id, $event)">x</button>
          </div>
        </div>
        <div class="tabs-menu">
          <button 
            class="button" 
            type="button" 
            @click="addEditor($event)"
            data-tippy-workspace-content="Add New File">
              <Icon icon="codicon:file" />
          </button>
          <button 
            class="button" 
            type="button" 
            @click="scrollEditor('left')"
            data-tippy-workspace-content="Move left">
              <Icon icon="codicon:chevron-left" />
          </button>
          <button 
            class="button" 
            type="button" 
            @click="scrollEditor('right')"
            data-tippy-workspace-content="Move right">
              <Icon icon="codicon:chevron-right" />
          </button>
        </div>
      </div>
      <div class="editor" 
        v-for="editor in editors" 
        :key="editor.id"
        :class="{ active: editor.active }"
        :ref="el => { if (el) { divs[editor.id] = el; } }"></div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { 
  ref, onBeforeUpdate, watchEffect, onMounted
} from 'vue';
import { ReactiveWorkspace } from '@/core/ReactiveWorkspace';
import { Icon } from '@iconify/vue';
import { appVersion } from '@/core/AppSettings';
import tippy from 'tippy.js';

const props = defineProps({
  theme: String
});
const emit = defineEmits(['workspace-change']);

const divs = ref([]);
const workspace = new ReactiveWorkspace(props.theme, 'arcode-editor-tabs-container');
const editors = workspace.editors;
const addEditor = (event: Event, onlyInParent= false, content='', fileName='') => {
  workspace.addEditor(event, onlyInParent, content, fileName);
  emit('workspace-change', editors);
};
const selectEditor = (editorId: number, event: Event) => {
  workspace.selectEditor(editorId, event);
};
const deleteEditor = (editorId: number, event: Event) => {
  workspace.deleteEditor(editorId, event);
  emit('workspace-change', editors);
};
const scrollEditor = (direction: string, translate = 120) => {
  workspace.scrollEditor(direction, translate);
};
const getEditorData = (editorId: number) => {
  return workspace.getEditor(editorId);
};

// Expose public methods
defineExpose({
  getEditorData,
  editors,
  deleteEditor,
  selectEditor,
  addEditor
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
  width: 64%;
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
  font-size: 14px;
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
}
.workspace .tabs .tabs-container .tab-button-close {
}

.workspace .tabs .tabs-menu{
  height: 100%;
  width: 36%;
  float: left;
  text-align: center;
  line-height: $workspace-tabs-height;
}


@media(min-width: 600px) {
  .workspace .tabs .tabs-container{
    width: 90%;
  }
  .workspace .tabs .tabs-menu{
    width: 10%;
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
