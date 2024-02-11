<script setup>
import axios from 'axios'
const studentList = ref([])
const classList = ref([])
onMounted(async () => {
  studentList.value = await axios.get('https://schoolsapi.netserve.in/student-class?filter[class_id][eq]=1&expand=student,class,session&per-page=50').then(r => r.data)
  classList.value = await axios.get('https://schoolsapi.netserve.in/the-class').then(r => r.data)
})
</script>

<template>
  <Header />
  <div class="container px-6 py-4 mx-auto">
    <div class="grid md:grid-cols-4 gap-3">
      <div class="overflow-y-auto rounded bg-gray-50 dark:bg-gray-800">
        <ul class="space-y-2">
          <li v-for="cl in classList" :key="cl.id">
            <a
              :href="`../class/${cl.id}`"
              class="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span class="ml-3">{{ cl?.name }}</span>
            </a>
          </li>
        </ul>
      </div>
      <div class="bg-red-100 md:col-span-3">
        <ul class="space-y-2">
          <li v-for="st in studentList" :key="st.id">
            <a
              :href="`../student/${st.student.id}`"
              class="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span class="ml-3">{{ st?.student.name }}</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<route lang="json">
  {
    "meta" : {
      "requireAuth" : true
    }
  }
</route>
