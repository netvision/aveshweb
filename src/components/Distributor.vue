<!-- eslint-disable no-console -->
<script setup>
import axios from 'axios'
const props = defineProps(['member'])
const member = ref(props.member)
const activeTab = ref('points')

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
  pointsLog.value = await axios.get(`https://avesh.netserve.in/points?filter[member_id][eq]=${userInfo.value.id}`).then(r => r.data)
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
  pointsModal.value = true
}
const closePointsModal = () => {
  pointsModal.value = false
  newPoints.value = {}
}
const savePoints = async () => {
  isDisabled.value = true
  newPoints.value.member_id = userInfo.value.id
  if (newPoints.value.type === 'c') {
    const d_data = { points_available: member.value.points_available - Number(newPoints.value.point) }
    const r_data = { points_available: userInfo.value.points_available + Number(newPoints.value.point) }
    await axios.patch(`https://avesh.netserve.in/members/${member.value.id}`, d_data)
    await axios.patch(`https://avesh.netserve.in/members/${userInfo.value.id}`, r_data)
  }
  else {
    const r_data = { points_available: userInfo.value.points_available - Number(newPoints.value.point) }
    console.log(r_data)
    await axios.patch(`https://avesh.netserve.in/members/${userInfo.value.id}`, r_data)
  }
  await axios.post('https://avesh.netserve.in/points', newPoints.value)
  pointsModal.value = false
  location.reload()
}

onMounted(async () => {
  retailers.value = await axios.get(`https://avesh.netserve.in/members?filter[distributor_id][eq]=${member.value.id}`).then(r => r.data)
  points.value = await axios.get(`https://avesh.netserve.in/points?filter[member_id][eq]=${member.value.id}`).then(r => r.data)
})
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="ml-10 my-3">
      <h2 class="text-xl font-bold text-gray-800 transition-colors duration-300 transform dark:text-white lg:text-3xl hover:text-gray-700 dark:hover:text-gray-300">
        {{ member?.firm_title }} <span><el-button>edit</el-button></span>
      </h2>
    </div>
    <div class="mr-10 my-3">
      <span class="text-blue-400 italic">Accumulated Points: </span><span class="font-bold">{{ member.points_aggregate }}</span>
      <span class="text-blue-400 italic ml-10">Available for Retailers: </span><span class="font-bold">{{ member.points_available }}</span>
    </div>
  </div>
  <div class="px-10">
    <el-tabs v-model="activeTab" class="demo-tabs">
      <el-tab-pane label="Points Log" name="points">
        <el-table :data="points" border style="width:100%">
          <el-table-column prop="date" label="Date" />
          <el-table-column prop="point" label="Point">
            <template #default="scope">
              <span v-if="scope.row.type === 'c'" class="text-blue-500 font-bold">{{ scope.row.point }}</span>
              <span v-else class="text-red-500 font-bold">{{ scope.row.point }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="invoice_no" label="Invoice No" />
          <el-table-column prop="invoice_date" label="Invoice Date" />
          <el-table-column prop="invoice_amount" label="Amount" />
          <el-table-column prop="other_info" label="Info" />
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="Retailers" name="retailers">
        <el-table :data="retailers" style="width:100%" border>
          <el-table-column prop="firm_title" label="Name of Firm" />
          <el-table-column prop="full_name" label="contact Person" />
          <el-table-column prop="contact_no" label="Phone No." />
          <el-table-column prop="points_available" label="Points" />
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
              <el-button link type="primary" size="small" @click="openEditModal(scope.row)">
                <el-icon :size="15">
                  <Edit />
                </el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>

  <el-dialog
    v-model="editMemberModal"
    title="Edit Member"
    width="500"
    align-center
  >
    <el-form ref="editFormRef" :model="edit" label-width="120px" status-icon label-position="top">
      <el-divider content-position="left" class="mt-10">
        Personal Details
      </el-divider>
      <el-row :gutter="20">
        <el-col :span="15">
          <el-form-item label="Full Name">
            <el-input v-model="edit.full_name" type="text" />
          </el-form-item>
        </el-col>
        <el-col :span="9">
          <el-form-item label="Date of Birth">
            <el-date-picker
              v-model="edit.dob"
              type="date"
              placeholder="select date"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Aadhar Number">
            <el-input v-model="edit.aadhar" type="number" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Contact No">
            <el-input v-model="edit.contact_no" type="number" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="Name of the Firm">
        <el-input v-model="edit.firm_title" type="text" />
      </el-form-item>
      <el-form-item label="Full Address">
        <el-input v-model="edit.address" type="text" />
      </el-form-item>
      <el-form-item label="City/Town">
        <el-input v-model="edit.city" type="text" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeEditModal">
          Cancel
        </el-button>
        <el-button type="primary" :disabled="isDisabled" plain @click="editMember">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>

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
    <p>Points Available: {{ userInfo.points_available }}</p>
    <h2 class="font-bold py-5">
      Points History
    </h2>
    <el-table :data="pointsLog" border style="width:100%">
      <el-table-column prop="date" label="Date" />
      <el-table-column prop="point" label="Point">
        <template #default="scope">
          <span v-if="scope.row.type === 'c'" class="text-blue-500 font-bold">{{ scope.row.point }}</span>
          <span v-else class="text-red-500 font-bold">{{ scope.row.point }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="invoice_no" label="Invoice No" />
      <el-table-column prop="invoice_date" label="Invoice Date" />
      <el-table-column prop="invoice_amount" label="Amount" />
      <el-table-column prop="other_info" label="Info" />
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
      Points debit/Credit Form
    </h2>
    <el-divider />
    <el-form ref="pointsFormRef" :model="newPoints" label-width="120px" status-icon label-position="top">
      <el-form-item label="">
        <el-radio-group v-model="newPoints.type" class="ml-4">
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
