<script setup>
import axios from 'axios'
import { Edit } from '@element-plus/icons-vue'
const props = defineProps(['member'])
const member = ref(props.member)
const points = ref([])
const profilePic = ref()
const timestamp = new Date().getTime()
const uploading = ref(0)

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

onMounted(async () => {
  const profile = await axios.get(`https://avesh.netserve.in/profile-photos/member-${member.value.id}.jpg`)
  if (profile?.status === 200)
    profilePic.value = `https://avesh.netserve.in/profile-photos/member-${member.value.id}.jpg?${timestamp}`

  points.value = await axios.get(`https://avesh.netserve.in/points?filter[member_id][eq]=${member.value.id}`).then(r => r.data)
  let av = 0
  let ag = 0
  points.value.forEach((point) => {
    if (point.is_deleted === 0) {
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
    }
  })
})
</script>

<template>
  <div class="flex items-center justify-between">
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
      <h2 class="text-xl font-bold text-gray-800 transition-colors duration-300 transform dark:text-white lg:text-3xl hover:text-gray-700 dark:hover:text-gray-300">
        {{ member?.firm_title }} <span><el-button :icon="Edit" text /></span>
      </h2>
    </div>
    <div class="mr-10 my-3">
      <span class="text-blue-400 italic ml-10">Available Points: </span><span class="font-bold">{{ member.points_aggregate }}</span>
    </div>
  </div>
  <div class="m-10">
    <h2 class="font-bold text-lg border-b-2 border-blue-900">Profile</h2>
    <p>Contact Person: {{ member?.full_name }}</p>
    <p>Aadhar No: {{ member?.aadhar }}</p>
    <p>Date of Birth: {{ member?.dob }}</p>
    <p>Contact No.: {{ member?.contact_no }}</p>
    <p>Email Id: {{ member?.email }}</p>
    <p>Full Address: {{ member?.full_address }}</p>
    <p>City/Town: {{ member?.city }}</p>
  </div>
  <div class="px-10">
    <h2 class="font-bold py-4">
      Points History
    </h2>
    <el-table :data="points" border style="width:100%">
      <el-table-column prop="date" label="Date" />
      <el-table-column prop="point" label="Point">
        <template #default="scope">
          <div v-if="scope.row.is_deleted" class="line-through text-black">
            <span v-if="scope.row.type === 'c'" class="text-green-500 font-bold">{{ scope.row.point }}</span>
            <span v-else-if="scope.row.type === 'r'" class="text-blue-500 font-bold">{{ scope.row.point }}</span>
            <span v-else class="text-red-500 font-bold">{{ scope.row.point }}</span>
          </div>
          <div v-else>
            <span v-if="scope.row.type === 'c'" class="text-green-500 font-bold">{{ scope.row.point }}</span>
            <span v-else-if="scope.row.type === 'r'" class="text-blue-500 font-bold">{{ scope.row.point }}</span>
            <span v-else class="text-red-500 font-bold">{{ scope.row.point }}</span>
          </div>
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
