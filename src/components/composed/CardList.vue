<template>
<ul v-if="elements">
  <li v-for="e in elements" :key="e.id">
    <BasicCard
      :id="e.id"
      :name="e.name"
      :description="e.description"
      :owner="e.owner"
      :deployingDate="e.deployingDate"></BasicCard>
  </li>
</ul>
</template>
<script setup lang="ts">
import BasicCard from '@/components/atomic/BasicCard.vue'
import type { WorkspaceMetadata } from '@/core/interfaces/WorkspaceMetadata.ts'

const props = defineProps({
  elements: Array<WorkspaceMetadata>
});


</script>
<style scoped>
ul {
  list-style: none;
  margin:  0;
  padding:  0;
  width:  100%;
}
li {
  width: 80%;
  margin: 0 auto;
  margin-bottom: 20px;
}
</style>