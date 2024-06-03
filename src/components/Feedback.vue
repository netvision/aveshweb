<!-- eslint-disable no-alert -->
<script setup>
import axios from 'axios'

const feeds = ref([])

const delFeed = async (id) => {
  const res = await axios.delete(`https:avesh.netserve.in/feedbacks/${id}`)
  if (res.status === 204)
    feeds.value = feeds.value.filter(f => f.id !== id)
  alert('removed feedback')
}

onMounted(async () => {
  feeds.value = await axios.get('https://avesh.netserve.in/feedbacks').then(r => r.data)
})
</script>

<template>
  <h2>Feedbacks</h2>
  <el-table :data="feeds" style="width: 100%">
    <el-table-column prop="full_name" label="Name" />
    <el-table-column prop="email" label="Email" />
    <el-table-column prop="phone" label="Phone" />
    <el-table-column prop="firm" label="Business" />
    <el-table-column prop="subject" label="subject" />
    <el-table-column prop="feed" label="Message" />
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
