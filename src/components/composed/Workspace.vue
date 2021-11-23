<template>
  <div class="arcode-workspace text-center">
    <img class="logo" alt="arCode" src="@/assets/logo.png">
    <h4 class="text-center">
      arCode IDE
    </h4>
  </div>
  
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Workspace'
});
</script>

<style scoped lang="scss">
.logo {
  width: 20%;
}

.arcode-workspace {
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
</style>
