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
          <Toolbar 
            :iframe="iframe"
            :tx="tx"
            :workspace="workspace"
            :hideToolbar="hideToolbar"
            :theme="theme" :tokenState="tokenState" />
        </div>
        <div class="workspace-container">
          <Workspace 
            ref="workspace"
            :tx="tx"
            :theme="theme" />
          <!--
            <Console />
          -->
        </div>
      </div>
      <StatusBar :workspace="workspace" />
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Workspace from '@/components/composed/Workspace.vue';
// import Console from '@/components/atomic/Console.vue';
import Toolbar from '@/components/composed/Toolbar.vue';
import StatusBar from '@/components/atomic/StatusBar.vue';
import { UserSettings } from '@/core/UserSettings';
import { ArweaveHandler } from '@/core/ArweaveHandler';
import { createToast } from 'mosha-vue-toastify';
import { useRoute } from 'vue-router'

const props = defineProps({
  tx: String,
  hideToolbar: Boolean,
  theme: String
});

const us: UserSettings = new UserSettings();
const settings = us.settings;
const theme = ref(settings.theme);
const arweave = new ArweaveHandler();
const workspace = ref(null);
const loadingAppContract = ref(true);
const tokenState = ref({});

const route = useRoute()
// const tx = ref(route.params.tx);
// const tx = ref(props.tx);
const iframe = ref(false);

// Page inside iframe
if (window && window.self !== window.top) {
  console.log('IFrame detected ...');
  iframe.value = true;
  window.top.postMessage({message: 'arCodeLoaded'}, '*');
  window.addEventListener("message", (event) => {
    // Do we trust the sender of this message?
    if (event.origin !== 'http://localhost' &&
        event.origin !== 'https://scanner.redstone.tools') {
      return;
    }
    // TODO
  }, false);
}

onMounted(async () => {
  try {
    // Set theme 
    // Check first URL parameter
    if (props.theme) {
      try {
        const t = props.theme === 'default' ? '' : props.theme;
        us.setAppTheme(t);
        theme.value = t;
      } catch (err) {
        console.error(`Theme: ${err}`)
      }
    } else {
      us.setAppTheme(theme.value);
    }

    // Load contract state
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
    loadingAppContract.value = false;
  }
});
</script>

<style lang="scss">

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
