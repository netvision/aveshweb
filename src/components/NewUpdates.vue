<!-- eslint-disable no-console -->
<script setup>
import { Plus } from '@element-plus/icons-vue'
const docModal = ref(false)
const newUpdate = ref({})
const visibility = ref()
const images = ref([
  { name: 'test.jpg', url: 'http://test.com/test.jpg' },
  { name: 'test1.jpg', url: 'http://test.com/test1.jpg' },
])

const handleUploads = (res, f, files) => {
  console.log(res)
  console.log(images.value)
}
const handleRemove = (f, files) => {
  console.log(f)
}

const saveDoc = () => {
  if (newUpdate.value.images) {
    const paths = []
    newUpdate.value.images.forEach((el) => {
      paths.push(el.response)
    })
    console.log(JSON.stringify(paths))
  }
}
</script>

<template>
  <h2 class="font-bold text-blue-900 border-b-2 border-blue-400">
    Updates
  </h2>
  <el-button text :icon="Plus" @click="docModal = true">
    New Update
  </el-button>
  <el-dialog
    v-model="docModal"
    :title="(newUpdate.id) ? 'Edit' : 'New Update'"
    width="800"
  >
    <el-upload
      v-if="!newUpdate.id"
      v-model:file-list="newUpdate.images"
      class="upload-demo"
      action="https://avesh.netserve.in/new-update/up"
      :on-success="handleUploads"
      :on-remove="handleRemove"
      list-type="picture-card"
      :limit="4"
    >
      <el-button type="primary">
        Click to select the image
      </el-button>
      <template #tip>
        <div class="el-upload__tip">
          jpg files with a size less than 500KB.
        </div>
      </template>
    </el-upload>
    <div v-else class="py-5 font-bold">
      <a :href="newUpdate.url" target="_blank">{{ newUpdate.url }}</a>
    </div>
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
          <el-checkbox label="Distributor" value="1" true-value="1" />
          <el-checkbox label="Retailer" value="2" true-value="2" />
          <el-checkbox label="Electrician" value="3" true-value="3" />
        </el-checkbox-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button v-if="newUpdate.id" :icon="Delete" type="danger" @click="delDoc(newUpdate.id)">
          Delete
        </el-button>
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
