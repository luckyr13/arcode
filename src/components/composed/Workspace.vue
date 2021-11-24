<template>
  <div class="arcode-workspace">
    <div class="workspace-bg text-center">
      <img class="logo" alt="arCode" src="@/assets/logo.png">
      <h4 class="text-center">
        arCode IDE
      </h4>
    </div>
    <div class="workspace">
      <div class="tabs"></div>
      <div id="arcode-code-editor" class="editor"></div>
    </div>
  </div>
  
</template>

<script lang="ts">
import { defineComponent, onMounted} from 'vue';
import { Workspace } from '@/core/Workspace';

export default defineComponent({
  name: 'Workspace',
  props: {
    theme: String
  },
  setup(props) {
    const workspace = new Workspace(props.theme);
    const view = workspace.createEditor();
    
    onMounted(() => {
      
      const editor = view.dom;
      const editorContainer = document.getElementById('arcode-code-editor');
      if (editorContainer !== null) {
        editorContainer.append(editor);
      }
      
    })

    return {};
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
}

</style>
