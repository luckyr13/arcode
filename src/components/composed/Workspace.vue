<template>
  <div class="arcode-workspace">
    <div class="workspace-bg text-center">
      <img class="logo" alt="arCode" src="@/assets/logo.png">
      <h4 class="text-center">
        arCode IDE
      </h4>
    </div>
    <div class="workspace">
      <div class="tabs">
        <div id="arcode-editor-tabs-container" class="tabs-container">
          <div 
            class="tab" 
            @click="selectEditor(editor.id)"
            v-for="editor in editors"
            :key="editor.id"
            :class="{ active: editor.active }"> 
            <div class="tab-button-label">{{ editor.name }}</div>
            <button class="button tab-button-close" type="button" >x</button>
          </div>
        </div>
        <div class="tabs-menu">
          <button class="button" type="button" @click="addEditor()">
              <Icon icon="codicon:file" />
          </button>
          <button class="button" type="button" @click="scrollEditor('left')">
              <Icon icon="codicon:chevron-left" />
          </button>
          <button class="button" type="button" @click="scrollEditor('right')">
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

<script lang="ts">
import { 
  defineComponent, ref,
  onBeforeUpdate, watchEffect,
  reactive
} from 'vue';
import { Workspace, EditorMetadata } from '@/core/Workspace';
import { Icon } from '@iconify/vue';


export default defineComponent({
  name: 'Workspace',
  props: {
    theme: String
  },
  components: {
    Icon
  },
  setup(props) {
    const workspace = new Workspace(props.theme);
    const editors = reactive<EditorMetadata[]>([]);
    const divs = ref([]);
    const currentEditorId = ref(-1);
    const getEditor = (editorId: number) => {
      return workspace.getEditor(editorId);
    };
    const addEditor = () => {
      const editorId = workspace.createEditor();
      // Deactivate current editor 
      if (currentEditorId.value >= 0) {
        editors[currentEditorId.value].active = false;
      }
      editors.push({ id: editorId, name: `Untitled-${editorId}`, active: true });
      currentEditorId.value = editorId;
    };
    const selectEditor = (editorId: number) => {
      // Deactivate current editor 
      if (currentEditorId.value >= 0) {
        editors[currentEditorId.value].active = false;
      }
      editors[editorId].active = true;
      currentEditorId.value = editorId;
      workspace.focusEditor(editorId);
    };
    const scrollEditor = (direction: string, translate = 120) => {
      const tabsContainer = document.getElementById('arcode-editor-tabs-container');
      if (!tabsContainer) {
        throw Error('Tabs container undefined!');
      }

      if (direction === 'left') {
        tabsContainer.scrollLeft  -= translate;
      } else if (direction === 'right') {
        tabsContainer.scrollLeft += translate;
      } else {
        throw Error('Wrong direction :)');
      }
    }
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

    return {
      editors,
      getEditor,
      addEditor,
      divs,
      selectEditor,
      scrollEditor
    };
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

</style>
