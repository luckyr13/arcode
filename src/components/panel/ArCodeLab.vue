<template>
<div class="arcode-main-toolbar-panel-title panel-title">
  ArCode Lab
</div>
<div>
  <h3>
    👷 Coming Soon ...
  </h3>
</div>
</template>


<script setup lang="ts">
//import {EditorView} from "@codemirror/view";
import { ref, watchEffect, computed } from 'vue';

const props = defineProps({
  workspace: Object,
  tx: String,
  login: Object,
  tokenState: Object
});


</script>

<style scoped lang="scss">
$title-height: 28px;

* {
  font-family: 'Open Sans', sans-serif;
}

h3 {
  padding: 12px;
}

.panel-title {
  height: $title-height;
  line-height: $title-height;
  font-size: 12px;
  padding-left: 20px;
}
.modal-btn-icon {
  font-size: 15px;
  margin-left: 4px;
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
.fd-icon {
  margin-right: 6px;
}
.title-icon {
  float: left;
  line-height: 32px;
  font-size: 32px !important;
}
h3 span {
  margin-left: 12px;
}

</style>