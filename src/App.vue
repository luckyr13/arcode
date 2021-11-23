<template>
  <AppNotifications :class="theme" />
  <div class="main-container">
    <div class="toolbar-container">
      <Toolbar :class="theme" />
    </div>
    <div class="workspace-container">
      <Workspace :class="theme"/>
    </div>
  </div>
  <StatusBar/>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Workspace from '@/components/composed/Workspace.vue';
import Toolbar from '@/components/composed/Toolbar.vue';
import AppNotifications from '@/components/composed/AppNotifications.vue';
import StatusBar from '@/components/composed/StatusBar.vue';
import { UserSettings } from '@/core/UserSettings';

declare const body: any;

export default defineComponent({
  name: 'App',
  components: {
    Workspace,
    Toolbar,
    AppNotifications,
    StatusBar
  },
  setup() {
    const us: UserSettings = new UserSettings();
    const settings = us.settings;
    const theme = settings.theme;
    const body = document.getElementsByTagName('body')[0];
    body.className = theme;

    return {
      theme
    };
  }
});
</script>

<style lang="scss">
#app {
  font-family: 'Open Sans', sans-serif;
}
.main-container {
  width: 100%;
  height: 100%;

}
</style>
