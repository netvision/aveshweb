<!-- eslint-disable no-alert -->
<!-- eslint-disable no-console -->
<script setup>
import axios from 'axios'
import { Edit } from '@element-plus/icons-vue'
const props = defineProps(['member'])
const member = ref(props.member)
const activeTab = ref('points')
const profilePic = ref()
const timestamp = new Date().getTime()
const uploading = ref(0)

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
  })
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
  location.reload()
}

const editTrModal = ref(false)
const transaction = ref({})
const openEditTrModal = (row) => {
  editTrModal.value = true
  transaction.value = row
}

const editTr = async (trn) => {
  const transactions = await axios.get(`https://avesh.netserve.in/points?filter[ref_id][eq]=${trn.ref_id}`).then(r => r.data)
  if (transactions.length > 0) {
    const promises = []
    transactions.forEach((tr) => {
      const data = {
        date: trn.date,
        invoice_no: trn.invoice_no,
        invoice_amount: trn.invoice_amount,
        invoice_date: trn.invoice_date,
        other_info: trn.other_info,
      }
      promises.push(axios.patch(`https://avesh.netserve.in/points/${tr.id}`, data))
    })
    Promise.allSettled(promises).then(res => console.log(res))
    alert('Updated!!')
    location.reload()
  }
}

const delTrModal = ref(false)
const openDelTrModal = (row) => {
  delTrModal.value = true
  transaction.value = row
}

const delTr = async (trs) => {
  const transactions = await axios.get(`https://avesh.netserve.in/points?expand=member&filter[ref_id][eq]=${trs.ref_id}`).then(r => r.data)
  if (confirm('Are you sure?')) {
    if (transactions.length > 0) {
      transactions.forEach((tr) => {
        const promises = []
        let data = {}
        if (tr.type === 'c') {
          if (tr.member.type === 1)
            data = { points_aggregate: tr.member.points_aggregate - tr.point, points_available: tr.member.points_available - tr.point }
          else
            data = { points_aggregate: tr.member.points_aggregate - tr.point }
        }
        else if (tr.type === 'r') { data = { points_available: tr.member.points_available + tr.point } }
        else { data = { points_aggregate: tr.member.points_aggregate + tr.point } }

        promises.push(axios.patch(`https://avesh.netserve.in/members/${tr.member.id}`, data))
        promises.push(axios.patch(`https://avesh.netserve.in/points/${tr.id}`, { is_deleted: 1, del_reason: trs.del_reason }))
        Promise.allSettled(promises).then(res => console.log(res))
      })
    }
    alert('Deleted!')
    location.reload()
  }
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
      <span class="text-blue-400 italic">Accumulated Points: </span><span class="font-bold">{{ member.points_aggregate }}</span>
      <span class="text-blue-400 italic ml-10">Available for Retailers: </span><span class="font-bold">{{ member.points_available }}</span>
    </div>
  </div>
  <div class="m-10">
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
  <div class="px-10">
    <el-tabs v-model="activeTab" class="demo-tabs">
      <el-tab-pane label="Points Log" name="points">
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
          <el-table-column label="Running Balance">
            <el-table-column prop="ag" label="Aggregate" />
            <el-table-column prop="av" label="Available" />
          </el-table-column>
        </el-table>
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
    <el-table :data="pointsLog" border style="width:100%">
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
      <el-table-column label="Running Balance">
        <el-table-column prop="ag" label="Aggregate" />
        <el-table-column v-if="userInfo.type === 1" prop="av" label="Available" />
      </el-table-column>
      <el-table-column fixed="right" label="Operations" width="50">
        <template #default="scope">
          <div v-if="!scope.row.is_deleted">
            <el-button link type="primary" size="small" @click="openEditTrModal(scope.row)">
              <el-icon :size="15">
                <Edit />
              </el-icon>
            </el-button>
            <el-button link type="primary" size="small" @click="openDelTrModal(scope.row)">
              <el-icon :size="15">
                <Delete />
              </el-icon>
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
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

  <el-dialog
    v-model="editTrModal"
    title="Edit Transaction"
    width="500"
    align-center
  >
    <el-form ref="trFormRef" :model="transaction" label-width="120px" status-icon label-position="top">
      <el-form-item label="">
        <el-radio-group v-model="transaction.type" class="ml-4" disabled>
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
              v-model="transaction.date"
              type="date"
              placeholder="select date"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Points">
            <el-input v-model="transaction.point" type="number" disabled />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="transaction.type !== 'd'" :gutter="20">
        <el-col :span="8">
          <el-form-item label="Invoice Date">
            <el-date-picker
              v-model="transaction.invoice_date"
              type="date"
              placeholder="select date"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Invoice No">
            <el-input v-model="transaction.invoice_no" type="number" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Invoice Amount">
            <el-input v-model="transaction.invoice_amount" type="number" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="Description">
        <el-input v-model="transaction.other_info" type="text" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="editTrModal = false">
          Cancel
        </el-button>
        <el-button type="primary" :disabled="isDisabled" plain @click="editTr(transaction)">
          Edit
        </el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog
    v-model="delTrModal"
    :title="userInfo.firm_title"
    width="500"
    align-center
  >
    <el-divider />
    <h2 class="font-bold">
      {{ transaction }}
    </h2>
    <el-divider />
    <el-form ref="delTrFormRef" :model="transaction" label-width="120px" status-icon label-position="top">
      <el-form-item label="Reason of Deletion">
        <el-input v-model="transaction.del_reason" type="text" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="delTrModal = false">
          Cancel
        </el-button>
        <el-button type="primary" :disabled="isDisabled" plain @click="delTr(transaction)">
          Confirm Delete
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
</style>
