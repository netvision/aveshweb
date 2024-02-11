<!-- eslint-disable no-console -->
<script setup>
import axios from 'axios'
import { useAuthStore } from '~/stores/authStore'
const authStore = useAuthStore()
const member = ref({})
const logout = () => {
  authStore.signout()
}
const isOpen = ref(false)
onMounted(async () => {
  member.value = await authStore.member
})
</script>

<template>
  <Suspense>
    <template #default>
      <nav class="bg-orange-200 dark:bg-gray-800">
        <div class="container px-6 py-4 mx-auto">
          <div class="flex items-center justify-between">
            <div>
              <a class="text-2xl font-bold text-gray-800 transition-colors duration-300 transform dark:text-white lg:text-3xl hover:text-gray-700 dark:hover:text-gray-300" href="/">Avesh - Dashboard</a>
            </div>
            <div class="flex justify-center mt-6 lg:flex lg:mt-0 lg:-mx-2">
              <span class="text-blue-400 italic">{{ member.firm_title }}</span>
              <a href="#" class="mx-2 text-gray-600 transition-colors duration-300 transform dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-300" aria-label="Reddit" @click="logout">
                Logout
              </a>
            </div>
          </div>
        </div>
      </nav>
    </template>
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>
