<template>
  <DockMenu 
    :items="items" 
    :draggable="false" 
    :on-selected="selected"
    :theme="theme">
  </DockMenu>
</template>

<script>
import { defineComponent } from 'vue';
import { DockMenu } from 'vue-dock-menu';
import 'vue-dock-menu/dist/vue-dock-menu.css';

export default defineComponent({
	name: 'MenuBar',
	components: {
		DockMenu
	},
  props: {
      menuTheme: Object
  },
	setup(props) {
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
    
		return {
			items,
      selected,
      theme: props.menuTheme
		};
	}
});
</script>

<style lang="scss">
.menu-bar-item-container .name-container, .menu-bar-item-container .menu-item {
  font-size: 12px !important;
}
.menu-bar-container {
  height: 2rem !important;
}
</style>