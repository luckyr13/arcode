<template>
<div class="arcode-main-toolbar-panel-title panel-title">
  ArCode Gallery
</div>
<ul class="file-menu">
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
  
  <li>
    <a 
      class="gallery-link"
      tabindex="0" 
      href="https://gallery.arcode.studio"
      target="_blank">
      <DefaultIcon class="menu-icon"
      icon="codicon-link-external" />
      <span>Visit ArCode Gallery</span>
    </a>
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
    @close="showModalMyGallery = false"></MyGalleryDialog>
</transition>
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

.file-menu {
  padding: 0px;
  margin-top: 0px;
  margin-bottom: 0px;
}
.file-menu li {
  padding: 0px;
  height: 32px;
  list-style: none;
  width: 100%;
}

.file-menu li button, .file-menu li a {
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

.file-menu li a {
  padding: 0px 6px 0px 6px;

}

.file-menu li button:hover, .file-menu li a:hover {
  background-color: rgba(0,0,0,0.3);
}

.file-menu li button.disabled {
  color: gray;
  cursor: default;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.gallery-link {
  margin-top: 40px;
}
</style>