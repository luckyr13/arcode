<template>
	<div class="arcode-main-toolbar">
		<div class="menu-container">
			<ul class="toolbar-menu top-menu">
				<li v-for="option in options['primary']" :key="option.id">
					<a tabindex="0" 
						:data-tippy-content="option.label"
						:class="{ active: option.active }"
						@click="select(option.id, 'primary', $event)"
						@keyup.enter="select(option.id, 'primary', $event)">
							<DefaultIcon class="icon-toolbar" :icon="option.icon" />
					</a>
				</li>
			</ul>
			
			<ul class="toolbar-menu bottom-menu">
				<li v-if="iframe">
					<a tabindex="0" 
						class="icon-toolbar-link"
						data-tippy-content="Open in a New tab"
						:href="arcodeExternalTab" target="_blank">
							<DefaultIcon class="icon-toolbar" icon="codicon-link-external" />
					</a>
				</li>
				<li v-for="optionSec in options['secondary']" :key="optionSec.id">
					<a tabindex="0" 
						:data-tippy-content="optionSec.label"
						:class="{ active: optionSec.active }"
						@click="select(optionSec.id, 'secondary', $event)"
						@keyup.enter="select(optionSec.id, 'secondary', $event)">
							<DefaultIcon class="icon-toolbar" :icon="optionSec.icon" />
					</a>
				</li>
			</ul>
		</div>
		<div class="side-container" :style="{ width: `${sideContainerWidth}px` }" v-if="showPanel">
			<FileExplorer 
					v-if="options['primary']['file-explorer'].active"
					:tx="tx"
					:workspace="workspace" />
			<RunAndDebug 
				:tx="tx"
				:login="login"
				:iframe="iframe"
				v-if="options['primary']['compile'].active" 
				:workspace="workspace"
				:tokenState="tokenState" />
			<SearchArweave
				:tx="tx"
				:login="login"
				v-if="options['primary']['explore'].active" />
			<DeployContract
				:login="login"
				:iframe="iframe"
				v-if="options['primary']['deploy'].active"
				:workspace="workspace" 
				:tokenState="tokenState" />
			<UserSettings v-if="options['secondary']['settings'].active" :workspace="workspace" />
			<AccountsManager
				:login="login"
				v-if="options['secondary']['accounts'].active"
				:iframe="iframe"
				:tokenState="tokenState" />
			<HelpInfo
				v-if="options['secondary']['help'].active" 
				:tokenState="tokenState" />
		</div>
		<div class="side-resize" v-if="showPanel" @mousedown="resize($event)">
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ToolbarOption } from '@/core/interfaces/ToolbarOption';
import FileExplorer from '@/components/panel/FileExplorer.vue';
import RunAndDebug from '@/components/panel/RunAndDebug.vue';
import UserSettings from '@/components/panel/UserSettings.vue';
import AccountsManager from '@/components/panel/AccountsManager.vue';
import DeployContract from '@/components/panel/DeployContract.vue';
import HelpInfo from '@/components/panel/HelpInfo.vue';
import SearchArweave from '@/components/panel/SearchArweave.vue';
import DefaultIcon from '@/components/atomic/DefaultIcon';
import tippy from 'tippy.js';

const props = defineProps({
	workspace: Object,
	tokenState: Object,
	iframe: Boolean,
	tx: String,
	hideToolbar: Boolean,
	login: Object
});
const showPanel = ref(false);
const selectedOption = ref('');
const options = reactive<Record<string, Record<string, ToolbarOption>>>({
	'primary': {
		'file-explorer': {
			id: 'file-explorer',
			icon: 'codicon-files',
			label: 'File Explorer',
			active: false
		},
		'explore': {
			id: 'explore',
			icon: 'codicon-search',
			label: 'Arweave Explorer',
			active: false
		},
		'deploy': {
			id: 'deploy',
			icon: 'codicon-rocket',
			label: 'Deploy',
			active: false
		},
		'compile': {
			id: 'compile',
			icon: 'codicon-debug-alt',
			label: 'Run and Debug',
			active: false
		},
	},
	'secondary': {
		'accounts': {
			id: 'accounts',
			icon: 'codicon-account',
			label: 'Accounts',
			active: false
		},
		'settings': {
			id: 'settings',
			icon: 'codicon-gear',
			label: 'Settings',
			active: false
		},
		'help': {
			id: 'help',
			icon: 'codicon-question',
			label: 'Help',
			active: false
		}
	}
	
});

const initialContainerWidth = 220;
const sideContainerWidth = ref(initialContainerWidth);
const arcodeExternalTab = computed(() => {
	return `#/${props.tx}`;
});

const select = (optionId: string, optionType: string, event: Event) => {
	let target: HTMLAnchorElement = event.currentTarget as HTMLAnchorElement;

	// Clear previous selected option
	if (selectedOption.value && 
			options['primary'][selectedOption.value] && 
			options['primary'][selectedOption.value].active) {
		options['primary'][selectedOption.value].active = false;
	}
	else if (selectedOption.value && 
					options['secondary'][selectedOption.value] &&
					options['secondary'][selectedOption.value].active) {
		options['secondary'][selectedOption.value].active = false;
	}

	// Show/hide panel
	if (showPanel.value && 
			(target.className === 'active' || target.className === 'active focus-visible')) {
		showPanel.value = false;
		target.className = '';
	} else {
		showPanel.value = true;
		target.className = 'active';
		sideContainerWidth.value = initialContainerWidth;
	}
	options[optionType][optionId].active = true;

	// Save selected option
	selectedOption.value = optionId;
};

const resize = () => {
	const doResize = (event: MouseEvent) => {
			sideContainerWidth.value = event.clientX - 48;
	};

	const stopResize = () => {
		document.documentElement.removeEventListener('mousemove', doResize, false);
		document.documentElement.removeEventListener('mouseup', stopResize, false);
	};
	document.documentElement.addEventListener('mouseup', stopResize, false);
	document.documentElement.addEventListener('mousemove', doResize, false);
};

onMounted(() => {
	tippy('[data-tippy-content]', {
		arrow: true,
		placement: 'right',
		delay: [1000, 100]
	});

	function responsiveToolbar(x) {
		if (x.matches) { 
			showPanel.value = true;
			selectedOption.value = 'file-explorer';
			options['primary']['file-explorer'].active = true;
		} else {
			showPanel.value = false;
			selectedOption.value = '';
			options['primary']['file-explorer'].active = false;
		}
	}

	// Collapse/show toolbar 
	if (!props.hideToolbar) {
		var x = window.matchMedia("(min-width: 700px)")
		responsiveToolbar(x);
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
	display: block;
}
.top-menu li a:hover {
	cursor: pointer;
}
.top-menu li a:active {
	border-left: 2px solid;
}
.top-menu li a.active {
	border-left: 2px solid;
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
	display: block;
}
.bottom-menu li a:hover {
	cursor: pointer;
}
.bottom-menu li a:active {
	border-left: 2px solid;
}
.bottom-menu li a.active {
	border-left: 2px solid;
}
.side-container {
	width: $toolbar-container-width;
	height: 100%;
	float: left;
	overflow-x: hidden;
}

.side-resize {
	width: 3px;
	height: 100%;
	float: left;
}

.side-resize:hover {
	width: 4px;
	cursor: col-resize;
}

.icon-toolbar-link {
	text-decoration: none;
}

.icon-toolbar {
	padding: 8px 0px;
	font-size: 24px !important;
}

</style>