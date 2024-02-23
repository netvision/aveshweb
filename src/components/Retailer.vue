<script setup>
import axios from 'axios'
const props = defineProps(['member'])
const member = ref(props.member)
const points = ref([])

onMounted(async () => {
  points.value = await axios.get(`https://avesh.netserve.in/points?filter[member_id][eq]=${member.value.id}`).then(r => r.data)
  let av = 0
  let ag = 0
  points.value.forEach((point) => {
    if (point.type === 'c') {
      av += point.point
      ag += point.point
    }
    else if (point.type === 'r') {
      av -= point.point
    }
    else {
      ag -= point.point
    }
    point.av = av
    point.ag = ag
  })
})
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="ml-10 my-3">
      <h2 class="text-xl font-bold text-gray-800 transition-colors duration-300 transform dark:text-white lg:text-3xl hover:text-gray-700 dark:hover:text-gray-300">
        {{ member?.firm_title }} <span><el-button>edit</el-button></span>
      </h2>
    </div>
    <div class="mr-10 my-3">
      <span class="text-blue-400 italic ml-10">Available Points: </span><span class="font-bold">{{ member.points_aggregate }}</span>
    </div>
  </div>
  <div class="px-10">
    <h2 class="font-bold py-4">
      Points History
    </h2>
    <el-table :data="points" border style="width:100%">
      <el-table-column prop="date" label="Date" />
      <el-table-column prop="point" label="Point">
        <template #default="scope">
          <span v-if="scope.row.type === 'c'" class="text-green-500 font-bold">{{ scope.row.point }}</span>
          <span v-else-if="scope.row.type === 'r'" class="text-blue-500 font-bold">{{ scope.row.point }}</span>
          <span v-else class="text-red-500 font-bold">{{ scope.row.point }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Point">
        <template #default="scope">
          <span v-if="scope.row.type === 'c'" class="text-green-500 font-bold">Credit</span>
          <span v-else-if="scope.row.type === 'r'" class="text-blue-500 font-bold">Retailer</span>
          <span v-else class="text-red-500 font-bold">Debit</span>
        </template>
      </el-table-column>
      <el-table-column prop="invoice_no" label="Invoice No" />
      <el-table-column prop="invoice_date" label="Invoice Date" />
      <el-table-column prop="invoice_amount" label="Amount" />
      <el-table-column prop="other_info" label="Info" />
      <el-table-column prop="ag" label="Balance" />
    </el-table>
  </div>
</template>
