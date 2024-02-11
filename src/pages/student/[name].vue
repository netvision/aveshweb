<!-- eslint-disable no-console -->
<script setup>
import axios from 'axios'
import { useAuthStore } from '~/stores/authStore'
const props = defineProps({
  name: {
    type: Number,
  },
})
const authStore = useAuthStore()
const router = useRouter()
const student = ref({})
const classList = (id) => {
  router.push(`../class/${id}`)
}
const calcAge = (dob, asOn) => {
  const ageDiffMs = new Date(asOn) - new Date(dob)
  const ageDate = new Date(ageDiffMs)
  return Math.abs(ageDate.getUTCFullYear() - 1970)
}

const dateFormat = (d) => {
  return new Date(d).toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}
onMounted(async () => {
  student.value = await axios.get(`https://schoolsapi.netserve.in/student-class?filter[student_id][eq]=${props.name}&expand=student,class,session`).then(r => r.data)
  console.log(student.value)
})
</script>

<template>
  <Header />
  <div class="container px-6 py-4 mx-auto">
    <div class="grid md:grid-cols-4 gap-3">
      <div class="px-3 py-4 overflow-y-auto rounded bg-gray-50 dark:bg-gray-800">
        <StudentLeftMenu :id="props.name" />
      </div>
      <div class="bg-red-100 md:col-span-3">
        <table class="mx-10 my-5 gap-2 w-3/4">
          <tr class="border border-b-blue-400">
            <td>
              S.R.No.
            </td><td class="px-2 text-lg font-bold">
              {{ student[0]?.student.sr_no }}
            </td>
          </tr>
          <tr class="border border-b-blue-400">
            <td>
              Full Name
            </td><td class="px-2 text-lg font-bold">
              {{ student[0]?.student.name }}
            </td>
          </tr>
          <tr class="border border-b-blue-400">
            <td>Mothers Name</td><td class="px-2 text-lg font-bold">
              {{ student[0]?.student.m_name }}
            </td>
          </tr>
          <tr class="border border-b-blue-400">
            <td>Fathers Name</td><td class="px-2 text-lg font-bold">
              {{ student[0]?.student.f_name }}
            </td>
          </tr>
          <tr class="border border-b-blue-400">
            <td>Current Class</td><td class="px-2 text-lg font-bold hover:cursor-pointer hover:text-blue-600" @click="classList(student[0].class.id)">
              {{ student[0]?.class.name }}
            </td>
          </tr>
          <tr class="border border-b-blue-400">
            <td>Date of Birth</td><td class="px-2 text-lg font-bold">
              {{ dateFormat(student[0]?.student.dob) }} (Age: {{ calcAge(student[0]?.student.dob, student[0]?.session.start_date) }}+)
            </td>
          </tr>
          <tr class="border border-b-blue-400">
            <td>Date of Admission</td><td class="px-2 text-lg font-bold">
              {{ dateFormat(student[0]?.student.doa) }}
            </td>
          </tr>
          <tr class="border border-b-blue-400">
            <td>Address</td><td class="px-2 text-lg font-bold">
              {{ student[0]?.student.address }}
            </td>
          </tr>
          <tr class="border border-b-blue-400">
            <td>City</td><td class="px-2 text-lg font-bold">
              {{ student[0]?.student.city }}
            </td>
          </tr>
          <tr class="border border-b-blue-400">
            <td>State</td><td class="px-2 text-lg font-bold">
              {{ student[0]?.student.state }}
            </td>
          </tr>
          <tr class="border border-b-blue-400">
            <td>Contact No.</td><td class="px-2 text-lg font-bold">
              {{ student[0]?.student.contact_no1 }}
            </td>
          </tr>
        </table>
      </div>
    </div>

    <div>
      <button
        class="btn m-3 text-sm mt-8"
        @click="router.back()"
      >
        Back
      </button>
    </div>
  </div>
</template>

<style>
  table td {
    @apply p-4
  }
</style>

<route lang="json">
  {
    "name" : "Name",
    "meta" : {
      "requireAuth" : true
    }
  }
</route>
