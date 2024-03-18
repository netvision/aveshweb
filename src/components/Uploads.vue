<!-- eslint-disable no-console -->
<script setup>
import axios from 'axios'
import { Plus } from '@element-plus/icons-vue'
const docs = ref()
const docModal = ref(false)
const newDoc = ref({})
const file = ref()
const visibility = ref()
const handleUrl = (res, f, files) => {
  newDoc.value.url = `https://avesh.netserve.in/${res}`
}

const openDocModal = (doc) => {
  newDoc.value.description = doc.description
  // visibility.value = doc.visibility.split(',')
  docModal.value = true
}

const saveDoc = async () => {
  const currentDate = new Date()
  newDoc.value.uploaded_on = currentDate.toISOString().split('T')[0]
  // console.log(Object.keys(newDoc.value.visibility).join(','))
  newDoc.value.visibility = visibility.value.join(',')
  const res = await axios.post('https://avesh.netserve.in/uploads', newDoc.value)
  console.log(res.status)
  docModal.value = false
}

onMounted(async () => {
  docs.value = await axios.get('https://avesh.netserve.in/uploads').then(r => r.data)
})
</script>

<template>
  <h2>Documents</h2>
  <el-table :data="docs" border style="width:100%">
    <el-table-column prop="uploaded_on" label="Date" />
    <el-table-column prop="description" label="Description" />
    <el-table-column fixed="right" label="Operations">
      <template #default="scope">
        <el-button link type="primary" size="small" @click="viewDoc(scope.row)">
          <el-icon :size="15">
            <Document />
          </el-icon>
        </el-button>
        <el-button link type="primary" size="small" @click="openDocModal(scope.row)">
          <el-icon :size="15">
            <Edit />
          </el-icon>
        </el-button>
        <el-button link type="primary" size="small" @click="delDoc(scope.row)">
          <el-icon :size="15">
            <Delete />
          </el-icon>
        </el-button>
      </template>
    </el-table-column>
  </el-table>
  <el-button text :icon="DocumentAdd" @click="docModal = true">
    Add New Document
  </el-button>
  <el-dialog
    v-model="docModal"
    title="New Document"
    width="500"
  >
    <el-upload
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
    <el-form :model="newDoc" label-width="auto" style="max-width: 600px" label-position="top">
      <el-row :gutter="10">
        <el-col :span="8">
          <el-form-item label="Document Type">
            <el-input v-model="newDoc.type" />
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="Description">
            <el -input v-model="newDoc.description" />
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
        <el-button @click="docModal = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="saveDoc">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
