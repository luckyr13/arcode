<template>
<ul class="file-list" v-if="workspace">
	<li 
		class="folder">
		<span><Icon 
			class="fd-icon" 
			@click="workspace.deleteEditor(editor.id, $event)"
			icon="codicon:folder-opened" />/</span>
	</li>
	<li class="empty" v-if="!workspace.getFileTree().children.length" >
		<span>Empty folder</span> 
	</li>
	<li v-for="editor in workspace.getFileTree().children" 
		:key="editor.id"
		class="file"
		:class="{ active: editor.id == workspace.getCurrentEditorId() }"
		@click="workspace.selectEditor(editor.id, $event)">
		<span>{{ editor.name }}</span>
		<Icon 
			class="menu-icon" 
			@click="workspace.deleteEditor(editor.id, $event)"
			icon="codicon:close" />
	</li>
</ul>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';

const props = defineProps({
	workspace: Object
});

</script>

<style scoped lang="scss">
.menu-icon {
	float: right;
	cursor: pointer;
	line-height: 15px;
	font-size: 15px;
	margin-left: 4px;
}
.fd-icon {
	margin-right: 6px;
}
.file-list {
	padding: 0px;
	margin-top: 0px;
	margin-bottom: 0px;
}
.file-list li {
	padding: 10px;
	font-size: 12px;
	line-height: 12px;
	list-style: none;
	overflow: hidden;

}

.file-list li span {
	text-overflow: ellipsis;
  white-space: nowrap;
	width: 80%;
	float: left;
	display: block;
	overflow: hidden;
}

.file-list li.active:hover,
.file-list li.file:hover,
 {
	background-color: rgba(0,0,0,0.3);
}

.file-list li.active {
	background-color: rgba(0,0,0,0.3);
}
.file-list li.folder {
	background-color: rgba(0,0,0,0.6);
}
.file-list li.file {
	padding-left: 20px;
	cursor: pointer;
}
.file-list li.empty {
	font-style: italic;
	padding-left: 20px;
}
</style>