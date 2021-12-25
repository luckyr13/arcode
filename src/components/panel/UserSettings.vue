<template>
<div class="arcode-main-toolbar-panel-title">
	User settings
</div>
<div class="theme-selector-container">
	<h4>Select a theme:</h4>
	<ul class="theme-menu">
		<li 
			v-for="t in themeNames" :key="t">
			<button 
				tabindex="0" 
				:class="{ active: t == theme }" 
				@click="setTheme(t)">{{ t ? t : 'default' }}</button>
		</li>
	</ul>

	<h4>Clear settings:</h4>
	<ul class="theme-menu">
		<li>
			<button tabindex="0" @click="clearSettings()">Reset Workspace</button>
		</li>
	</ul>
</div>


</template>

<script setup lang="ts">
import { ref } from 'vue';
import { UserSettings } from '@/core/UserSettings';
const props = defineProps({
	workspace: Object
});

const us = new UserSettings();
const settings = ref(us.settings);
const theme = ref(us.settings.theme);
const themes = us.themes;
const themeNames = Object.keys(themes);

const setTheme = (newTheme: string) => {
	us.setAppTheme(newTheme);
	settings.value = us.settings;
	theme.value = us.settings.theme;
	const editors = props.workspace.editors;
	props.workspace.setAppTheme(newTheme);
	for (const e of editors) {
		props.workspace.setTheme(e.id, newTheme);
	}
	
};

const clearSettings = () => {
	window.localStorage.clear();
	document.location.reload();
};

</script>

<style scoped lang="scss">
.arcode-main-toolbar-panel-title {
	height: 28px;
	line-height: 28px;
	font-size: 12px;
	padding-left: 20px;
}
.theme-selector-container {
	padding: 20px;
	font-size: 12px;
}

.theme-menu {
	padding: 0px;
	margin-top: 0px;
	margin-bottom: 0px;
}
.theme-menu li {
	padding: 0px;
	height: 32px;
	list-style: none;
}
.theme-menu li button {
	width: 100%;
	height: 100%;
	line-height: 12px;
	border: 0;
	cursor: pointer;
	text-align: left;
	font-size: 12px;
	background-color: inherit;
	color: inherit;
}
.theme-menu li button:hover {
	background-color: rgba(0,0,0,0.3);
}

.theme-menu li button.active {
	background-color: rgba(0,0,0,0.3);
}

.close-icon {
	float: right;
	cursor: pointer;
	line-height: 12px;
}
</style>