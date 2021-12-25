<template>
<ul class="file-list" v-if="workspace">
	<li 
		class="folder" @click="showFiles = !showFiles">
		<span :style="{ paddingLeft: `${level * 6}px` }">
			<Icon v-if="showFiles"
			class="fd-icon" 
			icon="codicon-folder-opened" />
			<Icon v-if="!showFiles"
			class="fd-icon" 
			icon="codicon-folder" />
			{{ fileTree.name ? fileTree.name : '/' }}
		</span>
		
		<Icon v-if="showFiles"
			class="menu-icon" 
			icon="codicon-chevron-up" />
		<Icon v-if="!showFiles"
			class="menu-icon" 
			icon="codicon-chevron-down" />
		<Icon v-if="fileTree.name && fileTree.children.length === 0"
			class="menu-icon" 
			@click="workspace.deleteFolder(`${path ? path : ''}`)"
			icon="codicon-trash" />
	</li>
	<template v-if="showFiles">
		<li class="empty" v-if="!fileTree.children.length" >
			<span :style="{ paddingLeft: `${level * 10}px` }">Empty folder</span> 
		</li>
		<template v-for="editor in fileTree.children" :key="editor.id" >
			<li 
				v-if="editor.type == 'FILE'"
				class="file"
				:class="{ 
					active: editor.id == workspace.getCurrentEditorId() && workspace.isEditorActive(editor.id) }"
				@click="workspace.selectEditor(editor.id, $event)">
				<span :style="{ paddingLeft: `${level * 10}px` }">{{ editor.name }}</span>
				<Icon 
					class="menu-icon" 
					@click="workspace.deleteEditor(editor.id, $event)"
					icon="codicon-trash" />
			</li>
			<FileList 
				v-if="editor.type=='FOLDER'" 
				:level="level + 1"
				:path="`${path ? path : ''}/${editor.name}`"
				:workspace="workspace" :fileTree="editor" />
		</template>
	</template>
	
</ul>
</template>

<script setup lang="ts">
import Icon from '@/components/atomic/Icon';
import { ref, onMounted } from 'vue';

const props = defineProps({
	workspace: Object,
	fileTree: Object,
	level: Number,
	path: String
});
const showFiles = ref(false);

onMounted(() => {
	if (props.level === 0 || props.level === 1) {
		showFiles.value = true;
	}
})
</script>

<style scoped lang="scss">
.menu-icon {
	float: right;
	margin-left: 10px;
	width: 5%;
	font-size: 12px;
}
.fd-icon {
	margin-right: 6px;
	float: left;
	width: 10%;
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
	width: 74%;
	float: left;
	display: block;
	overflow: hidden;
	line-height: 16px;
}

.file-list li.active:hover,
.file-list li.file:hover,
 {
	background-color: rgba(0,0,0,0.3);
	color: #FFF;
}

.file-list li.active {
	background-color: rgba(0,0,0,0.3);
	color: #FFF;
}
.file-list li.folder {
	background-color: rgba(0,0,0,0.6);
	color: #FFF;
	cursor: pointer;
}

.file-list li.file {
	cursor: pointer;
}
.file-list li.empty {
	font-style: italic;
}
</style>