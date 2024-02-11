<!-- eslint-disable no-console -->
<script setup>
import axios from 'axios'
import { useAuthStore } from '~/stores/authStore'
const authStore = useAuthStore()
const router = useRouter()
const csv = ref()
const ids = ref([])
const logout = () => {
  authStore.signout()
}
const formatDate = (inputDate) => {
  const dateParts = inputDate.split('/')
  const day = dateParts[1]
  const month = dateParts[0]
  const year = +dateParts[2] + 2000
  const ids = ref([])
  // Create a new Date object using the extracted components
  const dateObj = new Date(year, month - 1, day)

  // Extract the year, month, and day from the date object
  const formattedYear = dateObj.getFullYear()
  const formattedMonth = String(dateObj.getMonth() + 1).padStart(2, '0')
  const formattedDay = String(dateObj.getDate()).padStart(2, '0')

  // Concatenate the components to form the final formatted date string
  const formattedDate = `${formattedYear}-${formattedMonth}-${formattedDay}`

  return formattedDate
}
const handleFileChange = (event) => {
  console.log(event.target.files[0])
  const reader = new FileReader()
  reader.addEventListener(
    'load',
    () => {
      const data = []
      const lines = reader.result.split(/\r\n|\r|\n/)
      lines.forEach((el) => {
        const cols = el.split(',')
        const row = {
          name: cols[0],
          m_name: cols[1],
          f_name: cols[2],
          dob: formatDate(cols[3]),
          doa: formatDate(cols[5]),
          contact_no1: cols[4],
        }
        data.push(row)
      })
      csv.value = data
    },
    false,
  )

  if (event.target.files[0])
    reader.readAsText(event.target.files[0])
}

const save = () => {
  const promises = []
  csv.value.forEach((row) => {
    const data = { ...row, institute_id: 1, sr_no: 'NA' }
    promises.push(
      axios.post('https://schoolsapi.netserve.in/students', data)
        .then((res) => {
          ids.value.push(res.data.id)
        })
        .catch((err) => {
          console.log(err)
        }),
    )
  })
  Promise.all(promises)
    .then(() => {
      console.log('All requests completed.')
    })
    .catch((error) => {
      console.error('One or more requests failed:', error)
    })
}
</script>

<template class="min-h-screen">
  <header>
    <nav class="flex justify-between px-20 py-10 items-center bg-white">
      <h1 class="text-xl text-gray-800 font-bold">
        School Management System
      </h1>
      <div class="flex items-center">
        <img :src="authStore.photoURL" class="rounded-xl w-10"> &nbsp; &nbsp; &nbsp;
        <button class="bg-blue-500 text-white rounded-md px-2 py-1" @click="logout">
          Logout
        </button>
      </div>
    </nav>
  </header>
  <main>
    <div class="pb-10 text-center">
      <input id="" type="file" name="" @change="handleFileChange($event)">
    </div>
    <div>
      <ol v-if="csv && csv.length > 0" class="list-decimal list-inside">
        <li v-for="(data, i) in csv" :key="i">
          {{ data.name }}
        </li>
      </ol>
    </div>
    <div>
      <button class="bg-blue-500 text-white" @click="save">
        Save
      </button>
    </div>
  </main>
</template>

<route lang="json">
  {
    "meta" : {
      "requireAuth" : true
    }
  }
</route>
