<template>
  <AppNotifications/>
  <Toolbar/><Workspace/>
  <StatusBar/>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Workspace from '@/components/composed/Workspace.vue';
import Toolbar from '@/components/composed/Toolbar.vue';
import AppNotifications from '@/components/composed/AppNotifications.vue';
import StatusBar from '@/components/composed/StatusBar.vue';

export default defineComponent({
  name: 'App',
  components: {
    Workspace,
    Toolbar,
    AppNotifications,
    StatusBar
  },
  setup() {
    console.log('done')
  }
});
</script>

<style lang="scss">
#app {
  font-family: 'Open Sans', sans-serif;
}
</style>
