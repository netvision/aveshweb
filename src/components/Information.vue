<!-- eslint-disable no-console -->
<script setup>
import axios from 'axios'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const basicInfo = ref({})

const onSave = async () => {
  const res = await axios.put('https://avesh.netserve.in/website-infos/1', basicInfo.value)
  if (res.status)
    console.log(res.status)
}

onMounted(async () => {
  basicInfo.value = await axios.get('https://avesh.netserve.in/website-infos/1').then(r => r.data)
})
</script>

<template>
  <h2>Basic Information</h2>
  <div class="p-8">
    <el-form label-position="top" label-width="auto" :model="basicInfo">
      <el-form-item label="Website Title">
        <el-input v-model="basicInfo.title" />
      </el-form-item>
      <el-form-item label="Website Slogan">
        <el-input v-model="basicInfo.slogan" />
      </el-form-item>
      <el-form-item label="Homepage Intro">
        <QuillEditor v-model:content="basicInfo.homepage_intro" toolbar="minimal" content-type="html" theme="snow" class="w-full border-2" />
      </el-form-item>
      <el-form-item label="About Us">
        <QuillEditor v-model:content="basicInfo.about_us" toolbar="minimal" content-type="html" theme="snow" class="w-full border-2" />
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
