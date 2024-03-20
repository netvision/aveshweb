<script setup>
import axios from 'axios'

const birthdays = ref([])

onMounted(async () => {
  const users = await axios.get('https://avesh.netserve.in/members').then(r => r.data)
  const today = new Date()
  const weekStart = new Date(today)
  const weekEnd = new Date(today)
  weekStart.setDate(today.getDate())
  weekEnd.setDate(today.getDate() + 7)
  birthdays.value = users.filter((user) => {
    const dob = new Date(user.dob)
    dob.setFullYear(today.getFullYear())
    return dob >= weekStart && dob <= weekEnd
  })
  birthdays.value.forEach((user) => {
    if (user.type === 1)
      user.role = 'Distributor'
    else if (user.type === 2)
      user.role = 'Retailer'
    else if (user.type === 3)
      user.role = 'Electrician'
  })
})
</script>

<template>
  <div v-if="birthdays.length > 0">
    <h2 class="font-bold text-blue-900 border-b-2 border-blue-400 pt-10">
      Upcoming Birthdays
    </h2>
    <el-table :data="birthdays" border style="width:100%">
      <el-table-column prop="dob" label="Dob" />
      <el-table-column label="Description">
        <template #default="scope">
          <el-tooltip
            :content="`<p>Role: ${scope.row.role}<br />Address: ${scope.row.full_address} - ${scope.row.city} <br />Mobile: ${scope.row.contact_no} </p>`"
            raw-content
          >
            {{ scope.row.full_name }}
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
