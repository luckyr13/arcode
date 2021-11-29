<template>
  <DockMenu 
    :items="items" 
    :draggable="false" 
    :on-selected="selected"
    :theme="theme">
  </DockMenu>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue';
import { DockMenu } from 'vue-dock-menu';
import 'vue-dock-menu/dist/vue-dock-menu.css';

const props = defineProps({
  theme: String
});
const theme = computed(() => {
  return props.theme;
});

const items = [
  {
    name: "File",
    menu: [
      { name: "New File"},
      {name: "Open File..."},
      { isDivider: true },
      {name: "New Window"},
      { isDivider: true },
      {name: "Exit"}
    ]
  },
  {
    name: "Edit",
    menu: [{ name: "Cut"}, {name: "Copy"}, {name: "Paste"}]
  }
];
const selected = (res) => {
    alert(JSON.stringify(res))
}
</script>

<style lang="scss">
.menu-bar-item-container .name-container, .menu-bar-item-container .menu-item {
  font-size: 12px !important;
}
.menu-bar-container {
  height: 2rem !important;
}
</style>