<template>
  <img class="logo" alt="arCode" src="@/assets/logo.png">
  <h2>
    arCode
  </h2>

</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Workspace',
  props: {
    msg: String,
  },
});
</script>

<style scoped lang="scss">
.logo {
  width: 200px;
}
</style>
