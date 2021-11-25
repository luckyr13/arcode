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
        <div class="tabs-container">
          <div class="tab" v-for="editor in editors"
            :key="editor.id"> 
            {{ editor.name }} 
            <button class="button" type="button" >x</button>
          </div>
        </div>
        <div class="tabs-menu">
          <button type="button" @click="addEditor()">+</button>
        </div>
      </div>
      <div class="editor" 
        v-for="editor in editors" 
        :key="editor.id"
        :ref="el => { if (el) { divs[editor.id] = el; } }"></div>
    </div>
  </div>
  
</template>

<script lang="ts">
import { 
  defineComponent, ref,
  onBeforeUpdate, watchEffect 
} from 'vue';
import { Workspace, EditorMetadata } from '@/core/Workspace';

export default defineComponent({
  name: 'Workspace',
  props: {
    theme: String
  },
  setup(props) {
    const workspace = new Workspace(props.theme);
    const editors = ref<EditorMetadata[]>([]);
    const divs = ref([]);
    const getEditor = (editorId: number) => {
      return workspace.getEditor(editorId);
    };
    const addEditor = () => {
      const editorId = workspace.createEditor();
      editors.value.push({ id: editorId, name: `Untitled-${editorId}`});
    };
    // make sure to reset the refs before each update
    onBeforeUpdate(() => {
      divs.value = []
    });
    watchEffect(() => {
      const divsCopy = divs.value;
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
      divs
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
  width: 70%;
  float: left;
  display: flex;
  flex-direction: row;
  overflow-x: hidden;
}

.workspace .tabs .tabs-container .tab:hover {
  cursor: pointer;
}
.workspace .tabs .tabs-container .tab .button {
  border: 0;
}
.workspace .tabs .tabs-container .tab {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  line-height: $workspace-tabs-height;
  font-size: 12px;
  padding-left: 10px;
  padding-right: 10px;
  min-width: 110px;
}

.workspace .tabs .tabs-container .tab .button {
  margin-left: 8px;
}

.workspace .tabs .tabs-menu{
  height: 100%;
  width: 30%;
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

</style>
