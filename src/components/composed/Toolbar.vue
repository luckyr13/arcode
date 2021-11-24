<template>
	<div class="arcode-main-toolbar">
		<div class="menu-container">
			<ul class="top-menu">
				<li v-for="option in options" :key="option.id">
					<a tabindex="0" 
						:class="{ active: option.active }"
						@click="select(option.id, $event)"
						@keyup.enter="select(option.id, $event)">
							<Icon :icon="option.icon" />
					</a>
				</li>
			</ul>
			
			<ul class="bottom-menu">
				<li><a tabindex="0"><Icon icon="codicon:account" /></a></li>
				<li><a tabindex="0"><Icon icon="codicon:gear" /></a></li>
			</ul>
		</div>
		<div class="side-container" :style="{ width: `${sideContainerWidth}px` }" v-if="showPanel">
			hi
			
		</div>
		<div class="side-resize" v-if="showPanel" @mousedown="resize($event)" @mouseup="stopResize($event)">
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue';
import { Icon } from '@iconify/vue';

interface ToolbarOption {
	id: string,
	icon: string,
	active: boolean
}

export default defineComponent({
	name: 'Toolbar',
	components: {
		Icon
	},
	setup() {
		const showPanel = ref(false);
		const selectedOption = ref('');
		const options = reactive<Record<string, ToolbarOption>>({
			'file-explorer': {
				id: 'file-explorer',
				icon: 'codicon:files',
				active: false
			}, 
			'compile': {
				id: 'compile',
				icon: 'codicon:debug-alt',
				active: false
			}
		});
		const initialContainerWidth = 220;
		const sideContainerWidth = ref(initialContainerWidth);

		const select = (optionId: string, event: Event) => {
			let target: HTMLAnchorElement = event.currentTarget as HTMLAnchorElement;

			// Clear previous selected option
			if (selectedOption.value) {
				options[selectedOption.value].active = false;
			}

			if (showPanel.value && 
					(target.className === 'active' || target.className === 'active focus-visible')) {
				showPanel.value = false;
				target.className = '';
			} else {
				showPanel.value = true;
				target.className = 'active';
				sideContainerWidth.value = initialContainerWidth;
			}

			options[optionId].active = true;
			selectedOption.value = optionId;
		};
		const resize = (event: MouseEvent) => {
				document.documentElement.addEventListener('mousemove', doResize, false);
				document.documentElement.addEventListener('mouseup', stopResize, false);
		};

		const doResize = (event: MouseEvent) => {
				sideContainerWidth.value = event.clientX - 48;
		};

		const stopResize = () => {
			document.documentElement.removeEventListener('mousemove', doResize, false);
			document.documentElement.removeEventListener('mouseup', stopResize, false);
		};

		

		return {
			select,
			showPanel,
			options,
			selectedOption,
			sideContainerWidth,
			resize
		};
	}
});
</script>

<style scoped lang="scss">
$toolbar-width: 48px;
$toolbar-container-width: 180px;

.arcode-main-toolbar {
	height: 100%;
	width: 100%;
}
.menu-container {
	height: 100%;
	width: $toolbar-width;
	float: left;
	display: flex;
	flex-direction: column;
  justify-content: space-between;
}
.top-menu {
	list-style: none;
	margin: 0;
	padding: 0;
}
.top-menu li {
	width: 100%;
	height: $toolbar-width;
	line-height: $toolbar-width;
}

.top-menu li a {
	width: 100%;
	height: $toolbar-width;
	line-height: $toolbar-width;
	text-align: center;
	font-size: 24px;
	color: #727F7F;
	display: block;
}
.top-menu li a:hover {
	cursor: pointer;
	color: #FEFEFF;
}
.top-menu li a:active {
	border-left: 2px solid #017ED4;
}
.top-menu li a.active {
	border-left: 2px solid #FEFEFF;
	color: #FEFEFF;
}
.bottom-menu {
	width: 100%;
	list-style: none;
	margin: 0;
	padding: 0;
	display: flex;
	flex-direction: column;

}
.bottom-menu li {
	width: 100%;
	height: $toolbar-width;
	line-height: $toolbar-width;
}
.bottom-menu li a {
	width: 100%;
	height: $toolbar-width;
	line-height: $toolbar-width;
	text-align: center;
	font-size: 24px;
	color: #727F7F;
	display: block;
}
.bottom-menu li a:hover {
	cursor: pointer;
	color: #FEFEFF;
}
.bottom-menu li a:active {
	border-left: 2px solid #017ED4;
}
.bottom-menu li a.active {
	border-left: 2px solid #FEFEFF;
	color: #FEFEFF;
}
.side-container {
	width: $toolbar-container-width;
	height: 100%;
	float: left;
	overflow-x: hidden;
}

.side-resize {
	width: 2px;
	height: 100%;
	float: left;
	background-color: var(--app-toolbar-bgcolor);
}

.side-resize:hover {
	width: 3px;
	background-color: var(--app-toolbar-panel-resize-bgcolor);
	cursor: col-resize;
}

</style>