<template>
  <div class="main-container">
    <AppNotifications :class="theme" />
    <div class="toolbar-and-workspace">
      <div class="toolbar-container">
        <Toolbar :class="theme" />
      </div>
      <div class="workspace-container">
        <Workspace :class="theme"/>
      </div>
    </div>
    <StatusBar/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Workspace from '@/components/composed/Workspace.vue';
import Toolbar from '@/components/composed/Toolbar.vue';
import AppNotifications from '@/components/composed/AppNotifications.vue';
import StatusBar from '@/components/composed/StatusBar.vue';
import { UserSettings } from '@/core/UserSettings';


export default defineComponent({
  name: 'App',
  components: {
    Workspace,
    Toolbar,
    AppNotifications,
    StatusBar
  },
  setup() {
    const version = '0.1';
    const us: UserSettings = new UserSettings();
    const settings = us.settings;
    const theme = settings.theme;
    const body = document.getElementsByTagName('body')[0];
    body.className = theme;

    return {
      theme,
      version
    };
  }
});
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
