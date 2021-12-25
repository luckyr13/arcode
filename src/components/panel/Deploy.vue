<template>
<div class="arcode-main-toolbar-panel-title">
	Deploy contract
</div>
<div class="deploy-container">
	<h4>Menu:</h4>
	<ul class="deploy-menu">
		<li>
			<button>Deploy</button>
		</li>
	</ul>
</div>

</template>

<script setup lang="ts">

</script>

<style scoped lang="scss">
.arcode-main-toolbar-panel-title {
	height: 28px;
	line-height: 28px;
	font-size: 12px;
	padding-left: 20px;
}

.deploy-container {
	padding: 20px;
	font-size: 12px;
}
.deploy-menu {
	padding: 0px;
	margin-top: 0px;
	margin-bottom: 0px;
}
.deploy-menu li {
	padding: 0px;
	height: 32px;
	list-style: none;
}

.deploy-menu li button {
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

.deploy-menu li button:hover {
	background-color: rgba(0,0,0,0.3);
}
</style>