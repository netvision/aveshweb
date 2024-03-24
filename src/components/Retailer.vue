<!-- eslint-disable no-console -->
<script setup>
import axios from 'axios'
import { DocumentCopy, Edit } from '@element-plus/icons-vue'
const props = defineProps(['member'])
const member = ref(props.member)
const profilePic = ref()
const timestamp = new Date().getTime()
const uploading = ref(0)
const docs = ref()
const updates = ref()

const handleAvatarSuccess = (response, uploadFile) => {
  profilePic.value = URL.createObjectURL(uploadFile.raw)
}

const beforeAvatarUpload = (rawFile) => {
  if (rawFile.type !== 'image/jpeg') {
    ElMessage.error('Profile picture must be JPG format!')
    return false
  }
  else if (rawFile.size / 1024 / 1024 > 1) {
    ElMessage.error('Profile picture size can not exceed 1MB!')
    return false
  }
  return true
}

const progress = (e, file, files) => {
  uploading.value = e.percent || 0
}

async function checkUrlExists(url) {
  try {
    const response = await axios.head(url)
    return response.status === 200 // Check if the status is 200 OK
  }
  catch (error) {
    console.error('Error checking URL:', error)
    return false // Assume URL doesn't exist in case of error
  }
}

onMounted(async () => {
  checkUrlExists(`https://avesh.netserve.in/profile-photos/member-${member.value.id}.jpg`)
    .then((exists) => {
      if (exists)
        profilePic.value = `https://avesh.netserve.in/profile-photos/member-${member.value.id}.jpg`

      else
        profilePic.value = ''
    })
  const ups = await axios.get('https://avesh.netserve.in/new-updates').then(r => r.data)
  if (ups.length > 0) {
    updates.value = ups.filter((up) => {
      const visibility = up.visibility.split(',')
      if (member.type === 2)
        return visibility.includes('2')
      else
        return visibility.includes('3')
    })
      .map((doc) => {
        return { ...doc, images: JSON.parse(doc.image_urls) }
      })
  }

  const uploads = await axios.get('https://avesh.netserve.in/uploads').then(r => r.data)
  if (uploads.length > 0) {
    docs.value = uploads.filter((up) => {
      const visibility = up.visibility.split(',')
      if (member.type === 2)
        return visibility.includes('2')
      else
        return visibility.includes('3')
    })
  }
})
</script>

<template>
  <div class="ml-10 my-3">
    <el-upload
      class="avatar-uploader"
      :data="{ member_id: member.id }"
      action="https://avesh.netserve.in/member/photo"
      :show-file-list="false"
      :on-success="handleAvatarSuccess"
      :before-upload="beforeAvatarUpload"
      :on-progress="progress"
    >
      <img v-if="profilePic" :src="profilePic" class="avatar">
      <el-icon v-else class="avatar-uploader-icon">
        <Plus />
      </el-icon>
    </el-upload>
    <el-progress v-if="uploading > 0" :percentage="uploading" status="success" />
    <h2 class="text-xl font-bold text-gray-800 transition-colors duration-300 transform lg:text-3xl hover:text-gray-700 dark:hover:text-gray-300">
      {{ member?.firm_title }} <span><el-button :icon="Edit" text /></span>
    </h2>
  </div>
  <div class="flex items-stretch gap-2">
    <div class="w-1/2 px-10">
      <h2 class="font-bold text-lg border-b-2 border-blue-900">
        Profile
      </h2>
      <p>Contact Person: {{ member?.full_name }}</p>
      <p>Aadhar No: {{ member?.aadhar }}</p>
      <p>Date of Birth: {{ member?.dob }}</p>
      <p>Contact No.: {{ member?.contact_no }}</p>
      <p>Email Id: {{ member?.email }}</p>
      <p>Full Address: {{ member?.full_address }}</p>
      <p>City/Town: {{ member?.city }}</p>
      <p><span class="text-blue-800 italic">Available Points: </span><span class="text-blue-800 font-bold">{{ member.points_aggregate }}</span></p>
    </div>
    <div class="text-left w-1/2 px-10">
      <h2 class="font-bold text-lg border-b-2 border-blue-900">
        Documents
      </h2>
      <div v-if="docs">
        <div v-for="doc in docs" :key="doc.id">
          <a :href="doc.url" target="_blank"><el-icon :size="20" color="blue"><DocumentCopy /></el-icon> {{ doc.type }} - {{ doc.description }}</a>
        </div>
      </div>
      <h2 class="font-bold text-lg border-b-2 border-blue-900 mt-5">
        New Updates
      </h2>
      <div v-for="up in updates" :key="up.id" class="m-1 py-3">
        <div class="flex gap-4">
          <div class="w-1/2 h-28">
            <Slider :images="up.images" />
          </div>
          <div class="w-1/2">
            <p>{{ up.title }}</p>
            <p>{{ up.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="px-10">
    <h2 class="font-bold py-4">
      Points History
    </h2>
    <PointsLog :member="member" />
  </div>
</template>
