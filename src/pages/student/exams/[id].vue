<script setup>
const props = defineProps(['id'])
</script>

<template>
  <Header />
  <StudentLeftMenu :id="props.id" />
</template>

<route lang="json">
  {
    "meta" : {
      "requireAuth" : true
    }
  }
</route>
