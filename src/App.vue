<template>
  <router-view/>
</template>

<script setup lang="ts">
import 'mosha-vue-toastify/dist/style.css'
import 'tippy.js/dist/tippy.css';
import '@vscode/codicons/dist/codicon.css';
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


</style>
