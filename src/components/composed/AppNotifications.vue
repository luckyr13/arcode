<template>
<div class="arcode-notification-container">
	Welcome to arCode IDE!
</div>

</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'AppNotifications'
});


</script>

<style scoped lang="scss">
	
.arcode-notification-container {
	height: 28px;
	line-height: 28px;
	font-size: 12px;
	padding-left: 20px;
}
</style>