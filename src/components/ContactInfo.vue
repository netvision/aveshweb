<!-- eslint-disable no-console -->
<script setup>
import axios from 'axios'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const basicInfo = ref({})
const media = ref({})

const onSave = async () => {
  basicInfo.value.social_media = JSON.stringify(media.value)
  const res = await axios.put('https://avesh.netserve.in/website-infos/1', basicInfo.value)
  if (res.status)
    console.log(res.status)
}

onMounted(async () => {
  basicInfo.value = await axios.get('https://avesh.netserve.in/website-infos/1').then(r => r.data)
  if (basicInfo.value.social_media)
    media.value = JSON.parse(basicInfo.value.social_media)
})
</script>

<template>
  <h2>Contact info and Social media Links</h2>
  <div class="p-8">
    <el-form label-position="top" label-width="auto" :model="basicInfo">
      <el-form-item label="Full Address">
        <el-input v-model="basicInfo.full_address" />
      </el-form-item>
      <el-form-item label="Email Id">
        <el-input v-model="basicInfo.email_id" />
      </el-form-item>
      <el-form-item label="Phone 1">
        <el-input v-model="basicInfo.phone1" />
      </el-form-item>
      <el-form-item label="Phone 2">
        <el-input v-model="basicInfo.phone2" />
      </el-form-item>
      <el-form-item label="WhatsApp No">
        <el-input v-model="basicInfo.whatsapp" />
      </el-form-item>
      <el-form-item label="Youtube">
        <el-input v-model="media.youtube" />
      </el-form-item>
      <el-form-item label="Instagram">
        <el-input v-model="media.instagram" />
      </el-form-item>
      <el-form-item label="Facebook Page">
        <el-input v-model="media.facebook" />
      </el-form-item>
      <el-form-item label="Twitter">
        <el-input v-model="media.twitter" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSave">
          Save
        </el-button>
        <el-button>Cancel</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
