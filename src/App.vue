<template>
  <transition name="fade">
    <div class="loading-container text-center" v-if="loadingAppContract">
      <div class="loading-body">
        <div class="lds-ripple"><div></div><div></div></div>
        <div class="loading-txt text-center">
          Loading ...
        </div>
      </div>
    </div>
  </transition>
  <transition name="fade">
    <div class="main-container" v-if="!loadingAppContract">
      <div class="toolbar-and-workspace">
        <div class="toolbar-container">
          <Toolbar :workspace="workspace" :theme="theme" :tokenState="tokenState" />
        </div>
        <div class="workspace-container">
          <Workspace 
            ref="workspace"
            :theme="theme" />
          <Console />
        </div>
      </div>
      <StatusBar :workspace="workspace" />
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Workspace from '@/components/composed/Workspace.vue';
import Console from '@/components/atomic/Console.vue';
import Toolbar from '@/components/composed/Toolbar.vue';
import StatusBar from '@/components/atomic/StatusBar.vue';
import { UserSettings } from '@/core/UserSettings';
import { ArweaveHandler } from '@/core/ArweaveHandler';
import { createToast } from 'mosha-vue-toastify';

import 'mosha-vue-toastify/dist/style.css'
import 'tippy.js/dist/tippy.css';
import 'xterm/css/xterm.css';
import '@vscode/codicons/dist/codicon.css';

const us: UserSettings = new UserSettings();
const settings = us.settings;
const theme = ref(settings.theme);
us.setAppTheme(theme.value);
const arweave = new ArweaveHandler();
const workspace = ref(null);
const loadingAppContract = ref(true);
const tokenState = ref({});

onMounted(async () => {
  try {
    loadingAppContract.value = true;
    const contract = arweave.smartweave.contract(arweave.tokenContract);
    const { state, validity } = await contract.readState();
    tokenState.value = state;
    loadingAppContract.value = false;
  } catch (err) {
    createToast(`${err}`,
    {
      type: 'danger',
      showIcon: true,
      position: 'bottom-right',
    });
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


button {
  font-family: 'Open Sans', sans-serif;
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


/* Responsive xterm */
.xterm .xterm-viewport {
  width: 100% !important;
}
.xterm {
  height: 100%;
  overflow-y: hidden;
}
.xterm .xterm-screen {
  width: 100% !important;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.sub-main-container {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
}
.loading-container {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.loading-body {
  top: 40%;
  position: absolute;
  width: 100%;
  text-align: center;
}
.loading-txt {
  font-size: 12px;
  font-style: italic;
}

.lds-ripple {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}
.lds-ripple div {
  position: absolute;
  border: 4px solid var(--app-background-color);
  opacity: 1;
  border-radius: 50%;
  animation: lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
}
.lds-ripple div:nth-child(2) {
  animation-delay: -0.5s;
}
@keyframes lds-ripple {
  0% {
    top: 36px;
    left: 36px;
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    top: 0px;
    left: 0px;
    width: 72px;
    height: 72px;
    opacity: 0;
  }
}


</style>
