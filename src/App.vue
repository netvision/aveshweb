<!-- eslint-disable no-console -->
<script setup>
import { useAuthStore } from './stores/authStore'
useAuthStore()
</script>

<template>
  <router-view />
  <Footer />
</template>
