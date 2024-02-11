<!-- eslint-disable no-console -->
<script setup>
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useAuthStore } from './stores/authStore'
const authStore = useAuthStore()
const auth = getAuth()
onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid
    authStore.isLoggedIn = true
    authStore.name = user.displayName
    authStore.uid = user.uid
    authStore.email = user.email
    authStore.photoURL = user.photoURL
  }
  else {
    authStore.isLoggedIn = false
    authStore.name = ''
    authStore.uid = ''
    authStore.email = ''
    authStore.photoURL = ''
  }
})
</script>

<template>
  <router-view />
  <Footer />
</template>
