<template>
<div class="arcode-main-toolbar-panel-title panel-title">
  ArCode Gallery
</div>
<div class="gallery-container" >
  <ul class="gallery-menu" v-if="mainAddress">
    <li 
      v-if="mainAddress">
      <button 
        tabindex="0" 
        @click="showModalMyGalleryOpen()">
        <DefaultIcon class="menu-icon"
        icon="codicon-circuit-board" />
        <span>My Gallery</span>
      </button>
    </li>
    <li v-else>
      <button class="disabled">
        <DefaultIcon class="menu-icon"
        icon="codicon-circuit-board" />
        <span>My Gallery</span>
      </button>
    </li>
    <li 
      v-if="mainAddress">
      <button 
        tabindex="0" 
        @click="showModalPublishWorkspaceFunc()">
        <DefaultIcon class="menu-icon"
        icon="codicon-cloud-upload" />
        <span>Publish Workspace</span>
      </button>
    </li>
    <li v-else>
      <button class="disabled">
        <DefaultIcon class="menu-icon"
        icon="codicon-cloud-upload" />
        <span>Publish Workspace</span>
      </button>
    </li>
  </ul>
  <div class="text-center-f " v-else-if="!mainAddress">
    <DefaultIcon class="icon-login" icon="codicon-lock" />
    <p class="text-center no-results">Please login first!</p>
  </div>

  <ul class="bottom-menu">
    <li>
      <router-link 
        class="gallery-link"
        tabindex="0" 
        to="/gallery">
        <DefaultIcon class="menu-icon"
        icon="codicon-link-external" />
        <span>Visit ArCode Gallery</span>
      </router-link>
    </li>
  </ul>
  <transition name="fade">
    <PublishWorkspaceInGalleryDialog
      :show="showModalPublishWorkspace"
      :workspace="workspace"
      :login="login"
      :tokenState="tokenState"
      @close="showModalPublishWorkspace= false"></PublishWorkspaceInGalleryDialog>
  </transition>
  <transition name="fade">
    <MyGalleryDialog
      :show="showModalMyGallery"
      :login="login"
      @close="showModalMyGallery = false"></MyGalleryDialog>
  </transition>
</div>
</template>


<script setup lang="ts">
//import {EditorView} from "@codemirror/view";
import { ref, computed } from 'vue';
import DefaultIcon from '@/components/atomic/DefaultIcon';
import MyGalleryDialog from '@/components/dialogs/MyGalleryDialog.vue';
import PublishWorkspaceInGalleryDialog from '@/components/dialogs/PublishWorkspaceInGalleryDialog.vue';

const showModalPublishWorkspace = ref(false);
const showModalMyGallery = ref(false);

const props = defineProps({
  workspace: Object,
  tx: String,
  login: Object,
  tokenState: Object
});

const mainAddress = computed(() => {
  return props.login.mainAddress;
});
const showModalPublishWorkspaceFunc = () => {
  showModalPublishWorkspace.value = true;
};
const showModalMyGalleryOpen = () => {
  showModalMyGallery.value = true;
};

</script>

<style scoped lang="scss">
$title-height: 28px;

* {
  font-family: 'Open Sans', sans-serif;
}

.panel-title {
  height: $title-height;
  line-height: $title-height;
  font-size: 12px;
  padding-left: 20px;
}
.menu-icon {
  float: right;
  line-height: 15px;
  font-size: 15px !important;
  margin-left: 4px;
  width: 10%;
  display: inline;
  text-align: right;
  padding: 6px 0px;
}
h3 span {
  margin-left: 12px;
}

.gallery-menu, .bottom-menu {
  padding: 0px;
  margin-top: 0px;
  margin-bottom: 0px;
}
.gallery-menu li, .bottom-menu li {
  padding: 0px;
  height: 32px;
  list-style: none;
  width: 100%;
}

.gallery-menu li button, .gallery-menu li a,
.bottom-menu li button, .bottom-menu li a {
  width: 100%;
  height: 100%;
  line-height: 32px;
  border: 0;
  cursor: pointer;
  text-align: left;
  font-size: 12px;
  background-color: inherit;
  color: inherit;
  display: block;
}

.gallery-menu li a,
.bottom-menu li a {
  padding: 0px 6px 0px 6px;

}

.gallery-menu li button:hover, .gallery-menu li a:hover,
.bottom-menu li button:hover, .bottom-menu li a:hover {
  background-color: rgba(0,0,0,0.3);
}

.gallery-menu li button.disabled {
  color: gray;
  cursor: default;
}

.bottom-menu {
}
.gallery-link {
}

.text-center-f {
  text-align: center !important;
}

.icon-login {
  margin-top: 30px;
  margin-bottom: 20px;
  font-size: 36px !important;
}
.no-results {
  font-size: 12px;
}

.gallery-container {
  width: 100%;
  height: calc(100% - $title-height);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

</style>