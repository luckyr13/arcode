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
        <button type="button" @click="addEditor()">+</button>
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
      editors.value.push({ id: editorId, name: `Untitled-${editorId}.js`});
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
  height: $workspace-tabs-height;
}


.workspace .editor{
  height: calc(100% - $workspace-tabs-height);
  overflow-y: auto;
  width: 100%;
  position: absolute;
  z-index: 0;
}

</style>
