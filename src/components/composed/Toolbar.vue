<template>
	<div class="arcode-main-toolbar">
		<div class="menu-container">
			<ul class="top-menu">
				<li>
					<a tabindex="0"><Icon icon="codicon:files" /></a>
				</li>
				<li>
					<a  tabindex="0"><Icon icon="codicon:debug-alt" /></a>
				</li>
			</ul>
			
			<ul class="bottom-menu">
				<li><a tabindex="0"><Icon icon="codicon:account" /></a></li>
				<li><a tabindex="0"><Icon icon="codicon:gear" /></a></li>
			</ul>
		</div>
		<div class="side-container" v-if="false">
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Icon } from '@iconify/vue';


export default defineComponent({
	name: 'Toolbar',
	components: {
		Icon
	}
});
</script>

<style scoped lang="scss">
$toolbar-width: 48px;
$toolbar-container-width: 140px;

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
.side-container {
	width: $toolbar-container-width;
	height: 100%;
	float: left;
}

</style>