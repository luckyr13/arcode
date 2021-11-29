<template>
  <div class="main-container">
    <div class="toolbar-and-workspace">
      <div class="toolbar-container">
        <Toolbar :class="theme" :workspace="workspace" />
      </div>
      <div class="workspace-container">
        <Workspace 
          ref="workspace"
          :class="theme" 
          :theme="theme" 
          @workspace-change="workspaceChange"/>
      </div>
    </div>
    <StatusBar/>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Workspace from '@/components/composed/Workspace.vue';
import Toolbar from '@/components/composed/Toolbar.vue';
import StatusBar from '@/components/atomic/StatusBar.vue';
import { UserSettings } from '@/core/UserSettings';
import { EditorMetadata } from '@/core/interfaces/EditorMetadata';

const us: UserSettings = new UserSettings();
const settings = us.settings;
const theme = settings.theme;
const body = document.getElementsByTagName('body')[0];
body.className = theme;
const editors = ref([]);
const workspaceChange = (data: Array<EditorMetadata>) => {
  console.log(data, 'workspace-change')
  editors.value = data;
};
onMounted(() => {
  console.log(workspace.value, 'workspace-mounted');
})
const workspace = ref(null);

</script>

<style lang="scss">

#app {
  font-family: 'Open Sans', sans-serif;
  width: 100%;
  height: 100%;
  margin: 0px;
  padding: 0px;
}
.main-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.toolbar-and-workspace {
  height: 100%;
  display: flex;
  flex-direction: row;
}
.toolbar-container {
  height: 100%;
        flex-shrink: 0;
}
.workspace-container {
  height: 100%;
  flex-basis: 0;
        flex-grow: 1;
}
</style>
