<template>
<div class="arcode-main-toolbar-panel-title panel-title">
  ArCode Lab
</div>
<div>
  
  <div class="form-input">
    <label>Method</label>
    <select 
      @change="resetForms()"
      v-model.trim="selOption">
      <option value="transpile-src-file">Transpile TS File</option>
    </select>
  </div>
  <template v-if="selOption === 'transpile-src-file'">
    <TranspileTSFile
      :workspace="workspace"></TranspileTSFile>
  </template>
</div>
</template>


<script setup lang="ts">
//import {EditorView} from "@codemirror/view";
import { ref } from 'vue'
import TranspileTSFile from '@/components/atomic/TranspileTSFile'

const selOption = ref('transpile-src-file')
// eslint-disable-next-line
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

.form-input input,
.form-input select
 {
  padding: 6px;
}
</style>