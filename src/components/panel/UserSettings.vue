<template>
<div class="arcode-main-toolbar-panel-title">
	User settings
</div>
<div class="theme-selector-container">
	<h4>Select a theme:</h4>
	<ul class="theme-menu">
		<li v-for="t in themeNames" :key="t">
			<span>{{ t ? t : 'default' }}</span>
		</li>
	</ul>
</div>


</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { UserSettings } from '@/core/UserSettings';
const us = new UserSettings();
const settings = us.settings;
const theme = settings.theme;
const themes = us.themes;
const themeNames = Object.keys(themes);

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
	padding: 10px;
	font-size: 12px;
	line-height: 12px;
	list-style: none;
	cursor: pointer;
}
.theme-menu li:hover {
	background-color: rgba(0,0,0,0.3);
}
.close-icon {
	float: right;
	cursor: pointer;
	line-height: 12px;
}
</style>