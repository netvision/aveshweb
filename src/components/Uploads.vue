<!-- eslint-disable no-alert -->
<!-- eslint-disable no-console -->
<script setup>
import axios from 'axios'
import { Delete, DocumentAdd, Plus } from '@element-plus/icons-vue'
const docs = ref()
const docModal = ref(false)
const newDoc = ref({})
const file = ref()
const visibility = ref()
const handleUrl = (res, f, files) => {
  newDoc.value.url = `https://avesh.netserve.in/${res}`
}

const openDocModal = (doc) => {
  newDoc.value = doc ?? {}
  visibility.value = (doc?.visibility) ? doc.visibility.split(',') : []
  docModal.value = true
}

const saveDoc = async () => {
  const currentDate = new Date()
  newDoc.value.uploaded_on = newDoc.value.uploaded_on ?? currentDate.toISOString().split('T')[0]
  // console.log(Object.keys(newDoc.value.visibility).join(','))
  newDoc.value.visibility = visibility.value.join(',')
  const res = (newDoc.value.id) ? await axios.put(`https://avesh.netserve.in/uploads/${newDoc.value.id}`, newDoc.value) : await axios.post('https://avesh.netserve.in/uploads', newDoc.value)
  if (res.status === 201)
    docs.value.push(res.data)
  else if (res.status === 200)
    alert('Edited successfully')
  else
    alert('Try Again later')
  docModal.value = false
}

const delDoc = async (id) => {
  if (confirm('Are you sure you want to delete?')) {
    const res = await axios.delete(`https://avesh.netserve.in/uploads/${id}`)
    if (res.status === 204) {
      docs.value = docs.value.filter(doc => doc.id !== id)
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
  docs.value = await axios.get('https://avesh.netserve.in/uploads').then(r => r.data)
})
</script>

<template>
  <h2 class="pt-10 font-bold text-blue-900 border-b-2 border-blue-400">
    Documents
  </h2>
  <el-button text :icon="DocumentAdd" @click="openDocModal({})">
    Add New Document
  </el-button>
  <el-table :data="docs" border style="width:100%">
    <el-table-column prop="uploaded_on" label="Date" />
    <el-table-column label="Description">
      <template #default="scope">
        <a :href="scope.row.url" target="_blank">{{ scope.row.description }}</a>
      </template>
    </el-table-column>
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
    :title="(newDoc.id) ? 'Edit' : 'New Document'"
    width="500"
  >
    <el-upload
      v-if="!newDoc.id"
      v-model:file-list="file"
      class="upload-demo"
      action="https://avesh.netserve.in/upload/up"
      :limit="1"
      :on-success="handleUrl"
    >
      <el-button type="primary">
        Click to select the Doc
      </el-button>
      <template #tip>
        <div class="el-upload__tip">
          pdf files with a size less than 500KB.
        </div>
      </template>
    </el-upload>
    <div v-else class="py-5 font-bold">
      <a :href="newDoc.url" target="_blank">{{ newDoc.url }}</a>
    </div>
    <el-form :model="newDoc" label-width="auto" style="max-width: 600px" label-position="top">
      <el-row :gutter="10">
        <el-col :span="8">
          <el-form-item label="Document Title">
            <el-input v-model="newDoc.type" />
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="Description">
            <el-input v-model="newDoc.description" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="Visibility">
        <el-checkbox-group v-model="visibility">
          <el-checkbox label="Distributor" value="1" true-value="1" />
          <el-checkbox label="Retailer" value="2" true-value="2" />
          <el-checkbox label="Electrician" value="3" true-value="3" />
        </el-checkbox-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button v-if="newDoc.id" :icon="Delete" type="danger" text @click="delDoc(newDoc.id)" />
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
