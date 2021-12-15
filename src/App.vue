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
        <Console />
      </div>
    </div>
    <StatusBar/>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Workspace from '@/components/composed/Workspace.vue';
import Console from '@/components/atomic/Console.vue';
import Toolbar from '@/components/composed/Toolbar.vue';
import StatusBar from '@/components/atomic/StatusBar.vue';
import { UserSettings } from '@/core/UserSettings';
import { EditorMetadata } from '@/core/interfaces/EditorMetadata';
import 'tippy.js/dist/tippy.css';
import 'xterm/css/xterm.css';

const us: UserSettings = new UserSettings();
const settings = us.settings;
const theme = settings.theme;
us.setAppTheme(theme);

const workspaceChange = (data: Array<EditorMetadata>) => {
  console.log(data, 'workspace-change')
  // editors.value = data;
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
  overflow-y: auto;
}
.toolbar-container {
  height: 100%;
}
.workspace-container {
  height: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
.tippy-box {
  font-family: 'Open Sans', sans-serif;
  font-size: 12px;
}
/* Scrollbar */
::-webkit-scrollbar {
  width: 10px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #888;
}
::-webkit-scrollbar-thumb:hover {
  background: #555;
}


.xterm .xterm-viewport {
  width: 100% !important;
}

.xterm .xterm-screen {
  width: 100% !important;

}

.xterm .xterm-screen canvas {
  width: 100% !important;
}
</style>
