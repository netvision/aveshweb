<!-- eslint-disable no-alert -->
<script setup>
import axios from 'axios'

const feeds = ref([])

const delFeed = async (id) => {
  const res = await axios.delete(`https:avesh.netserve.in/complaints/${id}`)
  if (res.status === 204)
    feeds.value = feeds.value.filter(f => f.id !== id)
  alert('removed the complaint')
}

onMounted(async () => {
  feeds.value = await axios.get('https://avesh.netserve.in/complaints?sort=-id').then(r => r.data)
})
</script>

<template>
  <h2>Complaints</h2>
  <el-table :data="feeds" style="width: 100%">
    <el-table-column prop="name" label="Name" />
    <el-table-column prop="mobile" label="Mobile No" />
    <el-table-column prop="alt_mobile" label="Alt Mobile" />
    <el-table-column prop="address" label="Address" />
    <el-table-column prop="product_name" label="Product" />
    <el-table-column prop="model_no" label="Model" />
    <el-table-column prop="Serial_no" label="Serial" />
    <el-table-column prop="problem" label="Issue" />
    <el-table-column prop="date_of_purchase" label="Purchase Date" />
    <el-table-column fixed="right" label="Operations" width="120">
      <template #default="scope">
        <el-button
          link
          type="primary"
          size="small"
          @click.prevent="delFeed(scope.row.id)"
        >
          Delete
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>
