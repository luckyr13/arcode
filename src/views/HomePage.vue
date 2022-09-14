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
          <MainToolbar 
            :iframe="iframe"
            :tx="tx"
            :workspace="workspace"
            :hideToolbar="hideToolbar"
            :login="login"
            :theme="theme" :tokenState="tokenState" />
        </div>
        <div class="workspace-container">
          <DefaultWorkspace 
            ref="workspace"
            :tx="tx"
            :theme="theme" />
        </div>
      </div>
      <StatusBar :workspace="workspace" />
    </div>
  </transition>

  <transition name="fade">
    <DefaultModal v-if="showModalArweaveWebWallet" @close="showModalArweaveWebWallet = false">
      <template v-slot:header>
        <h3>Session detected</h3>
      </template>
      <template v-slot:body>
        <div>
          Resume Arweave Web Wallet session?
        </div>
      </template>
      <template v-slot:footer>
        <div class="modal-footer text-right">
          <button
            class="modal-button modal-button-primary" 
            @click="login.arweaveWebWallet(settings.stayLoggedIn, arweave); showModalArweaveWebWallet = false">
            <span >Resume session</span >
          </button>
          <button 
            class="modal-button" 
            @click="login.logout(); showModalArweaveWebWallet = false">
            Dismiss
          </button>
        </div>
      </template>
    </DefaultModal>
  </transition>
</template>



<script setup lang="ts">
import { ref, onMounted } from 'vue';
import DefaultWorkspace from '@/components/composed/DefaultWorkspace.vue';
import MainToolbar from '@/components/composed/MainToolbar.vue';
import StatusBar from '@/components/atomic/StatusBar.vue';
import { UserSettings } from '@/core/UserSettings';
import { ArweaveWrapper } from '@/core/ArweaveWrapper';
import { WarpContracts } from '@/core/WarpContracts';
import { IFrameWalletBridge } from '@/core/IFrameWalletBridge';
import { createToast } from 'mosha-vue-toastify';
import { useRoute } from 'vue-router'
import { Login } from '@/core/Login';
import DefaultModal from '@/components/atomic/DefaultModal.vue';
import { tokenContract } from '@/core/contracts/ArcodeCommunity'

const props = defineProps({
  tx: String,
  hideToolbar: Boolean,
  theme: String
});

const us: UserSettings = new UserSettings();
const settings = us.settings;
const theme = ref(settings.theme);
const arweaveWrapper = new ArweaveWrapper();
const arweave = arweaveWrapper.arweave;
const warp = new WarpContracts(arweave);
const login = new Login();
const workspace = ref(null);
const loadingAppContract = ref(true);
const tokenState = ref({});
const showModalArweaveWebWallet = ref(false);

const route = useRoute()
// const tx = ref(route.params.tx);
// const tx = ref(props.tx);
const iframe = ref(false);


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

    // Load PST contract state
    loadingAppContract.value = true;
    const { sortKey, cachedValue } = await warp.readState(tokenContract);
    const state = cachedValue &&
      Object.prototype.hasOwnProperty.call(cachedValue, 'state') ?
      cachedValue.state : {};
    tokenState.value = state;
    loadingAppContract.value = false;

    // Is editor inside an iframe?
    const iframeBridge = new IFrameWalletBridge();
    iframe.value = iframeBridge.start();

    // Load session data
    if (!iframe.value) {
      const sessInfo = login.loadSession(settings.stayLoggedIn);
      if (sessInfo.method === 'webwallet') {
        // Throw modal
        showModalArweaveWebWallet.value = true;
        // await login.arweaveWebWallet(settings.stayLoggedIn, arweave);
      }
    }

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

.modal-button {
  display: inline;
  margin-top: 1rem;
  padding: 10px;
  background-color: rgba(55, 55, 55, 1);
  color: #FFF;
  border: 0;
  margin-left: 8px;
  cursor: pointer;
  border-radius: 4px;
}
.modal-button:hover {
  cursor: pointer;
  background-color: rgba(55, 55, 55, 0.5);
}
.modal-button span {
  margin-left: 4px;
}
.modal-button-primary {
  background-color: var(--app-toolbar-panel-title-bgcolor);
  color:  var(--app-toolbar-panel-title-color);
}
.modal-button-primary:hover {
  background-color: #000;
  color: #FFF;
  background-color: rgba(0, 0, 0, 0.5);
}

</style>
