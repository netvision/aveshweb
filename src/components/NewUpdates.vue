<!-- eslint-disable no-alert -->
<!-- eslint-disable no-console -->
<script setup>
import axios from 'axios'
import { Delete, Plus } from '@element-plus/icons-vue'
const docModal = ref(false)
const newUpdate = ref({})
const visibility = ref()
const images = ref([])
const updates = ref([])

const openDocModal = (up) => {
  newUpdate.value = up
  visibility.value = (up?.visibility) ? up.visibility.split(',') : []
  images.value = (up?.images) ? [...up.images] : []
  docModal.value = true
}

const handleUploads = (res, f, files) => {
  newUpdate.value.images = newUpdate.value?.images ?? []
  newUpdate.value.images.push(res)
}
const handleRemove = (f, files) => {
  const index = newUpdate.value.images.findIndex(im => im.url === f.url)
  newUpdate.value.images.splice(index, 1)
  // console.log(newUpdate.value.images)
  console.log(index)
}

const saveDoc = async () => {
  const currentDate = new Date()
  newUpdate.value.date = newUpdate.value.date ?? currentDate.toISOString().split('T')[0]
  newUpdate.value.image_urls = JSON.stringify(newUpdate.value.images)
  newUpdate.value.visibility = visibility.value.join(',')
  const res = (newUpdate.value.id) ? await axios.put(`https://avesh.netserve.in/new-updates/${newUpdate.value.id}`, newUpdate.value) : await axios.post('https://avesh.netserve.in/new-updates', newUpdate.value)
  if (res.status === 201)
    updates.value.push(res.data)
  else if (res.status === 200)
    alert('Edited successfully')
  else
    alert('Try Again later')
  docModal.value = false
}

const delDoc = async (id) => {
  if (confirm('Are you sure you want to delete?')) {
    const res = await axios.delete(`https://avesh.netserve.in/new-updates/${id}`)
    if (res.status === 204) {
      updates.value = updates.value.filter(doc => doc.id !== id)
      alert('Deleted succesfully')
    }
    else {
      alert ('Couldnt delete! Try Again...')
    }
  }
  else {
    docModal.value = false
  }
  docModal.value = false
}

onMounted(async () => {
  updates.value = await axios.get('https://avesh.netserve.in/new-updates').then(r => r.data)
  updates.value.forEach((r) => {
    r.images = JSON.parse(r.image_urls)
  })
})
</script>

<template>
  <h2 class="font-bold text-blue-900 border-b-2 border-blue-400 p-3">
    Updates
  </h2>
  <el-button text :icon="Plus" @click="openDocModal({})">
    New Update
  </el-button>
  <el-table :data="updates" border style="width:100%">
    <el-table-column prop="date" label="Date" />
    <el-table-column prop="title" label="Title" />
    <el-table-column prop="description" label="Description" />
    <el-table-column label="" width="50">
      <template #default="scope">
        <el-button link type="primary" size="small" @click="openDocModal(scope.row)">
          <el-icon :size="15">
            <Edit />
          </el-icon>
        </el-button>
      </template>
    </el-table-column>
  </el-table>
  <el-dialog
    v-model="docModal"
    :title="(newUpdate.id) ? 'Edit' : 'New Update'"
    width="800"
  >
    <el-upload
      v-model:file-list="images"
      class="upload-demo"
      action="https://avesh.netserve.in/new-update/up"
      :on-success="handleUploads"
      :on-remove="handleRemove"
      list-type="picture-card"
      :limit="4"
    >
      <el-button text type="success" :icon="Plus" />
    </el-upload>
    <el-form :model="newUpdate" label-width="auto" style="max-width: 600px" label-position="top">
      <el-row :gutter="10">
        <el-col :span="8">
          <el-form-item label="Title">
            <el-input v-model="newUpdate.title" />
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="Description">
            <el-input v-model="newUpdate.description" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="Visibility">
        <el-checkbox-group v-model="visibility">
          <el-checkbox label="Distributor" value="1" />
          <el-checkbox label="Retailer" value="2" />
          <el-checkbox label="Electrician" value="3" />
        </el-checkbox-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button v-if="newUpdate.id" :icon="Delete" type="danger" text @click="delDoc(newUpdate.id)" />
        <el-button @click="docModal = false">
          Cancel
        </el-button>
        <el-button @click="saveDoc">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
