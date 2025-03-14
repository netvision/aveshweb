<!-- eslint-disable no-alert -->
<!-- eslint-disable no-console -->
<script setup>
import axios from 'axios'
import { Edit } from '@element-plus/icons-vue'
const props = defineProps(['member'])
const member = ref(props.member)
const activeTab = ref('points')
const profilePic = ref(`https://avesh.netserve.in/profile-photos/member-${member.value.id}.jpg`)
const placeholder = ref('https://avesh.netserve.in/profile-photos/placeholder.jpg')
const timestamp = new Date().getTime()
const uploading = ref(0)
const docs = ref()
const updates = ref()

const retailers = ref([])
const points = ref([])

const isDisabled = ref(false)
const editMemberModal = ref(false)
const editFormRef = ref()
const edit = ref({})
const openEditModal = (member) => {
  edit.value = member
  editMemberModal.value = true
}
const closeEditModal = () => {
  edit.value = {}
  editMemberModal.value = false
}
const editMember = async () => {
  isDisabled.value = true
  if (edit.value.id) {
    const res = await axios.put(`https://avesh.netserve.in/members/${edit.value.id}`, edit.value)
    console.log(res.status)
    editMemberModal.value = false
    location.reload()
  }
}

const pointsLog = ref([])
const memberModal = ref(false)
const userInfo = ref({})
const openMemberModal = async (member) => {
  pointsLog.value = []
  memberModal.value = true
  userInfo.value = member
  const available = ref(0)
  const aggregate = ref(0)
  pointsLog.value = await axios.get(`https://avesh.netserve.in/points?filter[member_id][eq]=${userInfo.value.id}`).then(r => r.data)
  pointsLog.value.forEach((point) => {
    if (point.is_deleted === 0) {
      if (point.type === 'c') {
        available.value += point.point
        aggregate.value += point.point
      }
      else if (point.type === 'r') {
        available.value -= point.point
      }
      else {
        aggregate.value -= point.point
      }
      point.av = available.value
      point.ag = aggregate.value
    }
  }).sort((a, b) => new Date(b.date) - new Date(a.date))
}
const closeMemberModal = () => {
  userInfo.value = {}
  memberModal.value = false
}

const pointsModal = ref(false)
const newPoints = ref({})
const pointsFormRef = ref()
const openPointsModal = (row) => {
  userInfo.value = row
  newPoints.value.type = 'c'
  pointsModal.value = true
}
const closePointsModal = () => {
  pointsModal.value = false
  newPoints.value = {}
}
const savePoints = async () => {
  newPoints.value.ref_id = crypto.randomUUID()
  isDisabled.value = true
  const rPoint = { ...newPoints.value }
  const dPoint = { ...newPoints.value }
  const promises = []
  if (newPoints.value.type === 'c') {
    const dData = { points_available: member.value.points_available - Number(dPoint.point) }
    promises.push(axios.patch(`https://avesh.netserve.in/members/${member.value.id}`, dData))
    dPoint.type = 'r'
    dPoint.member_id = member.value.id
    promises.push(axios.post('https://avesh.netserve.in/points', dPoint))
    const userData = { points_aggregate: userInfo.value.points_aggregate + Number(rPoint.point), points_available: userInfo.value.points_available + Number(rPoint.point) }
    promises.push(axios.patch(`https://avesh.netserve.in/members/${userInfo.value.id}`, userData))
    rPoint.member_id = userInfo.value.id
    rPoint.type = 'c'
    promises.push(axios.post('https://avesh.netserve.in/points', rPoint))
  }
  else {
    const userData = { points_aggregate: userInfo.value.points_aggregate - Number(newPoints.value.point) }
    promises.push(axios.patch(`https://avesh.netserve.in/members/${userInfo.value.id}`, userData))
    const rPoint = { ...newPoints.value }
    rPoint.member_id = userInfo.value.id
    promises.push(axios.post('https://avesh.netserve.in/points', rPoint))
  }
  const res = await Promise.allSettled(promises)
  console.log(res)
  pointsModal.value = false
  setTimeout(() => {
    location.reload()
  }, 3000)
}

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

function onProfileError(e) {
  e.target.src = placeholder.value
}

onMounted(async () => {
  retailers.value = await axios.get(`https://avesh.netserve.in/members?filter[distributor_id][eq]=${member.value.id}`).then(r => r.data)
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

  const ups = await axios.get('https://avesh.netserve.in/new-updates').then(r => r.data)
  if (ups.length > 0) {
    updates.value = ups.filter((up) => {
      const visibility = up.visibility.split(',')
      return visibility.includes('1')
    })
      .map((doc) => {
        return { ...doc, images: JSON.parse(doc.image_urls) }
      })
  }

  const uploads = await axios.get('https://avesh.netserve.in/uploads').then(r => r.data)
  if (uploads.length > 0) {
    docs.value = uploads.filter((up) => {
      const visibility = up.visibility.split(',')
      return visibility.includes('1')
    })
  }
})
</script>

<template>
  <div class="md:flex items-center justify-between border-b-2 mb-4">
    <div class="ml-10 my-3">
      <h2 class="text-xl font-bold text-gray-800 transition-colors duration-300 transform lg:text-3xl hover:text-gray-700 dark:hover:text-gray-300">
        {{ member?.firm_title }} <span><el-button :icon="Edit" text /></span>
      </h2>
    </div>
    <div class="mr-10 my-3">
      <span class="text-blue-400 italic">Accumulated Points: </span><span class="font-bold">{{ member.points_aggregate }}</span>
      <span class="text-blue-400 italic ml-10">Available for Retailers: </span><span class="font-bold">{{ member.points_available }}</span>
    </div>
  </div>
  <div class="md:flex items-stretch gap-2">
    <div class="md:w-1/5 px-10">
      <el-upload
        class="avatar-uploader"
        :data="{ member_id: member.id }"
        action="https://avesh.netserve.in/member/photo"
        :show-file-list="false"
        :on-success="handleAvatarSuccess"
        :before-upload="beforeAvatarUpload"
        :on-progress="progress"
      >
        <img :src="profilePic" class="max-w-64" @error="onProfileError">
      </el-upload>
      <el-progress v-if="uploading > 0" :percentage="uploading" status="success" />
    </div>
    <div class="md:w-2/5 px-10">
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
    </div>
    <div class="text-left md:w-2/5 px-10">
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
          <div class="w-28 h-28">
            <Slider :images="up.images" />
          </div>
          <div>
            <p>{{ up.title }}</p>
            <p>{{ up.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="px-10">
    <el-tabs v-model="activeTab" class="demo-tabs">
      <el-tab-pane label="Points Log" name="points">
        <PointsLog :member="member" />
      </el-tab-pane>
      <el-tab-pane label="Retailers" name="retailers">
        <el-table :data="retailers" style="width:100%" border>
          <el-table-column prop="firm_title" label="Name of Firm" />
          <el-table-column prop="full_name" label="contact Person" />
          <el-table-column prop="contact_no" label="Phone No." />
          <el-table-column prop="points_aggregate" label="Points" />
          <el-table-column fixed="right" label="Operations" width="120">
            <template #default="scope">
              <el-button link type="primary" size="small" @click="openPointsModal(scope.row)">
                <el-icon :size="15">
                  <CirclePlus />
                </el-icon>
              </el-button>
              <el-button link type="primary" size="small" @click="openMemberModal(scope.row)">
                <el-icon :size="15">
                  <Memo />
                </el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>

  <el-dialog
    v-model="memberModal"
    :title="userInfo.firm_title"
    width="800"
    align-center
  >
    <p>Contact Person: {{ userInfo.full_name }}</p>
    <p>Aadhar No: {{ userInfo.aadhar }}</p>
    <p>Date of Birth: {{ userInfo.dob }}</p>
    <p>Contact No.: {{ userInfo.contact_no }}</p>
    <p>Email Id: {{ userInfo.email }}</p>
    <p>Full Address: {{ userInfo.full_address }}</p>
    <p>City/Town: {{ userInfo.city }}</p>
    <p>Points Available: {{ userInfo.points_aggregate }}</p>
    <h2 class="font-bold py-5">
      Points History
    </h2>
    <PointsLog :member="userInfo" :op="true" />
  </el-dialog>

  <el-dialog
    v-model="pointsModal"
    :title="userInfo.firm_title"
    width="500"
    align-center
  >
    <el-divider />
    <h2 class="font-bold">
      Points Credit Form
    </h2>
    <el-divider />
    <el-form ref="pointsFormRef" :model="newPoints" label-width="120px" status-icon label-position="top">
      <el-form-item label="">
        <el-radio-group v-model="newPoints.type" class="ml-4" disabled>
          <el-radio label="c">
            Credit
          </el-radio>
          <el-radio label="d">
            Debit
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Date">
            <el-date-picker
              v-model="newPoints.date"
              type="date"
              placeholder="select date"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Points">
            <el-input v-model="newPoints.point" type="number" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="newPoints.type === 'c'" :gutter="20">
        <el-col :span="8">
          <el-form-item label="Invoice Date">
            <el-date-picker
              v-model="newPoints.invoice_date"
              type="date"
              placeholder="select date"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Invoice No">
            <el-input v-model="newPoints.invoice_no" type="number" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Invoice Amount">
            <el-input v-model="newPoints.invoice_amount" type="number" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="Description">
        <el-input v-model="newPoints.other_info" type="text" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closePointsModal">
          Cancel
        </el-button>
        <el-button type="primary" :disabled="isDisabled" plain @click="savePoints">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 80px;
  height: 80px;
  text-align: center;
}

.avatar-uploader .avatar {
  width: 80px;
  height: 80px;
  display: block;
}
.el-carousel__item h3 {
  color: #475669;
  opacity: 0.75;
  line-height: 150px;
  margin: 0;
  text-align: center;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}
</style>
