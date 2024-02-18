<!-- eslint-disable no-alert -->
<!-- eslint-disable eqeqeq -->
<!-- eslint-disable no-console -->
<script setup>
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth'
import axios from 'axios'
import { useAuthStore } from '~/stores/authStore'
const authStore = useAuthStore()
const auth = getAuth()
const electricians = ref([])
const retailers = ref([])
const distributors = ref([])
const distriOptions = ref([])
const newMemberModal = ref(false)
const disabled = ref(true)
const isDisabled = ref(false)
const formRef = ref()

const form = reactive({
  type: '',
  email: '',
  password: '',
  con_password: '',
  full_name: '',
  dob: '',
  aadhar: '',
  firm_title: '',
  contact_no: '',
  full_address: '',
  city: '',
})

const resetForm = () => {
  form.value = {
    type: '',
    email: '',
    password: '',
    con_password: '',
    full_name: '',
    dob: '',
    aadhar: '',
    firm_title: '',
    contact_no: '',
    full_address: '',
    city: '',
  }
  newMemberModal.value = false
}
const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('Please input the password'))
  }
  else {
    if (form.password !== '') {
      if (!formRef.value)
        return
      formRef.value.validateField('con_password', () => null)
    }
    callback()
  }
}
const validatePass2 = (rule, value, callback) => {
  if (value === '')
    callback(new Error('Please input the password again'))
  else if (value !== form.password)
    callback(new Error('Passwords don\'t match!'))
  else
    callback()
}

const checkEmail = (rule, value, callback) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (value === '')
    callback(new Error('Email is required...'))
  else if (!emailRegex.test(value))
    callback(new Error('please enter valid email'))
  else
    callback()
}

const rules = reactive({
  password: [{ validator: validatePass, trigger: 'blur' }],
  con_password: [{ validator: validatePass2, trigger: 'blur' }],
  email: [{ validator: checkEmail, trigger: 'blur' }],
})

const saveForm = async () => {
  isDisabled.value = true
  if (form.password === form.con_password) {
    const auth = getAuth()
    createUserWithEmailAndPassword(auth, form.email, form.password)
      .then((credentials) => {
        const user = credentials.user
        if (user) {
          axios.post('https://avesh.netserve.in/members',
            {
              type: form.type,
              distributor_id: form.distributor_id ?? 0,
              full_name: form.full_name,
              dob: form.dob,
              email: form.email,
              contact_no: form.contact_no,
              firm_title: form.firm_title,
              aadhar: form.aadhar,
              full_address: form.address,
              city: form.city,
            })
            .then((res) => {
              if (res.status === 201) {
                alert('user member created successfully! please login once again')
                authStore.signout()
              }
            })
            .catch((error) => {
              console.log(error.message)
            })
        }
      })
      .catch((error) => {
        console.log(error.message)
      })
  }
  else { console.log('please check password') }
  resetForm()
}

const userInfo = ref({})
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
const checkType = (type) => {
  console.log(type)
  if (type == 2) { disabled.value = false }
  else {
    disabled.value = true
    form.distributor_id = 0
    edit.value.distributor_id = 0
  }
}

const pointsLog = ref([])
const memberModal = ref(false)
const member = ref({})
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
const points = ref({})
const pointsFormRef = ref()
const openPointsModal = (row) => {
  userInfo.value = row
  pointsModal.value = true
}
const closePointsModal = () => {
  pointsModal.value = false
  points.value = {}
}
const savePoints = async () => {
  isDisabled.value = true
  if (userInfo.value.distributor_id !== 0) {
    if (points.value.type === 'c') {
      const dist = distributors.value.filter(d => d.id === userInfo.value.distributor_id)[0]
      const d_data = { points_available: dist.points_available - Number(points.value.point) }
      const r_data = { points_available: userInfo.value.points_available + Number(points.value.point) }
      await axios.patch(`https://avesh.netserve.in/members/${dist.id}`, d_data)
      await axios.patch(`https://avesh.netserve.in/members/${userInfo.value.id}`, r_data)
    }
    else if (points.value.type === 'd') {
      const r_data = { points_available: userInfo.value.points_available - Number(points.value.point) }
      await axios.patch(`https://avesh.netserve.in/members/${userInfo.value.id}`, r_data)
    }
  }
  else {
    const d_data = (points.value.type === 'c') ? { points_aggregate: userInfo.value.points_aggregate + Number(points.value.point), points_available: userInfo.value.points_available + Number(points.value.point) } : { points_aggregate: userInfo.value.points_aggregate - Number(points.value.point) }
    await axios.patch(`https://avesh.netserve.in/members/${userInfo.value.id}`, d_data)
  }

  points.value.member_id = userInfo.value.id
  await axios.post('https://avesh.netserve.in/points', points.value)
  pointsModal.value = false
  location.reload()
}

const getData = async (row, treeNode, resolve) => {
  resolve (await axios.get(`https://avesh.netserve.in/members?filter[distributor_id][eq]=${row.id}`).then(r => r.data))
}

onMounted(async () => {
  const dist = await axios.get('https://avesh.netserve.in/members?filter[type][eq]=1').then(res => res.data)
  distributors.value = dist.map(d => ({
    ...d,
    children: [],
    hasChildren: true,
  }))
  // console.log(distributors.value)
  distributors.value.forEach((e) => {
    distriOptions.value.push({
      value: e.id,
      label: e.firm_title,
    })
  })
  electricians.value = await axios.get('https://avesh.netserve.in/members?filter[type][eq]=3').then(res => res.data)
  member.value = await authStore.member
})
</script>

<template class="min-h-screen">
  <Header />
  <main v-if="member?.type === 0" class="w-full">
    <div class="flex items-center justify-between">
      <div class="ml-10 my-3">
        <h2 class="text-xl font-bold text-gray-800 transition-colors duration-300 transform dark:text-white lg:text-3xl hover:text-gray-700 dark:hover:text-gray-300">
          Admin Panel
        </h2>
      </div>
      <div class="mr-10 my-3">
        <div class="text-right p-5">
          <el-button type="primary" plain @click="newMemberModal = true">
            New Member
          </el-button>
        </div>
        <el-dialog
          v-model="newMemberModal"
          title="Add New Member"
          width="500"
          align-center
        >
          <el-form ref="formRef" :model="form" label-width="120px" :rules="rules" status-icon label-position="top">
            <el-divider content-position="left" class="mt-10">
              Member Type
            </el-divider>
            <el-form-item label="Category">
              <el-radio-group v-model="form.type" class="ml-4" @change="checkType(form.type)">
                <el-radio label="1">
                  Distributor
                </el-radio>
                <el-radio label="2">
                  Retailer
                </el-radio>
                <el-radio label="3">
                  Electrician
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="Distributor" :disabled="disabled">
              <el-select-v2
                v-model="form.distributor_id"
                class="m-2"
                :options="distriOptions"
                placeholder="Please select"
                style="width: 240px"
                :disabled="disabled"
              />
            </el-form-item>
            <el-divider content-position="left" class="mt-10">
              Login Details
            </el-divider>
            <el-form-item label="Email Id" prop="email">
              <el-input v-model="form.email" />
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Password" prop="password">
                  <el-input v-model="form.password" type="password" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Confirm Password" prop="con_password">
                  <el-input v-model="form.con_password" type="password" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-divider content-position="left" class="mt-10">
              Personal Details
            </el-divider>
            <el-row :gutter="20">
              <el-col :span="15">
                <el-form-item label="Full Name">
                  <el-input v-model="form.full_name" type="text" />
                </el-form-item>
              </el-col>
              <el-col :span="9">
                <el-form-item label="Date of Birth">
                  <el-date-picker
                    v-model="form.dob"
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
                  <el-input v-model="form.aadhar" type="number" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Contact No">
                  <el-input v-model="form.contact_no" type="number" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="Name of the Firm">
              <el-input v-model="form.firm_title" type="text" />
            </el-form-item>
            <el-form-item label="Full Address">
              <el-input v-model="form.address" type="text" />
            </el-form-item>
            <el-form-item label="City/Town">
              <el-input v-model="form.city" type="text" />
            </el-form-item>
          </el-form>
          <template #footer>
            <div class="dialog-footer">
              <el-button @click="resetForm">
                Cancel
              </el-button>
              <el-button type="primary" :disabled="isDisabled" plain @click="saveForm">
                Confirm
              </el-button>
            </div>
          </template>
        </el-dialog>
      </div>
    </div>
    <div class="w-full p-10 mb-10">
      <h2 class="font-bold">
        Distributors and Retailers
      </h2>
      <el-table
        border
        :data="distributors"
        style="width:100%"
        row-key="id"
        :load="getData"
        lazy
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column prop="firm_title" label="Name of Firm" />
        <el-table-column prop="full_name" label="contact Person" />
        <el-table-column prop="contact_no" label="Phone No." />
        <el-table-column label="Points">
          <template #default="scope">
            <span v-if="scope.row.type === 1">{{ scope.row.points_aggregate }} ({{ scope.row.points_available }})</span>
            <span v-else>{{ scope.row.points_available }}</span>
          </template>
        </el-table-column>
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
    </div>
    <div class="w-full p-10">
      <h2 class="font-bold">
        Electricians
      </h2>
      <el-table :data="electricians" style="width:100%" border>
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
            <el-button link type="primary" size="small" @click="openEditModal(scope.row)">
              <el-icon :size="15">
                <Edit />
              </el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      v-model="editMemberModal"
      title="Edit Member"
      width="500"
      align-center
    >
      <el-form ref="editFormRef" :model="edit" label-width="120px" status-icon label-position="top">
        <el-divider content-position="left" class="mt-10">
          Member Type
        </el-divider>
        <el-form-item label="Category">
          <el-radio-group v-model="edit.type" class="ml-4" @change="checkType(edit.type)">
            <el-radio label="1">
              Distributor
            </el-radio>
            <el-radio label="2">
              Retailer
            </el-radio>
            <el-radio label="3">
              Electrician
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Distributor" :disabled="disabled">
          <el-select-v2
            v-model="edit.distributor_id"
            class="m-2"
            :options="distriOptions"
            placeholder="Please select"
            style="width: 240px"
            :disabled="disabled"
          />
        </el-form-item>
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
      <p v-if="userInfo.type === 1">
        Points: <span>Aggregate {{ userInfo.points_aggregate }}</span>, Available <span>{{ userInfo.points_available }}</span>
      </p>
      <p v-else-if="userInfo.type === 3">
        Points Available: {{ userInfo.points_aggregate }}
      </p>
      <p v-else>
        Points Available: {{ userInfo.points_available }}
      </p>
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
      <el-form ref="pointsFormRef" :model="points" label-width="120px" status-icon label-position="top">
        <el-form-item label="">
          <el-radio-group v-model="points.type" class="ml-4">
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
                v-model="points.date"
                type="date"
                placeholder="select date"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Points">
              <el-input v-model="points.point" type="number" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="points.type === 'c'" :gutter="20">
          <el-col :span="8">
            <el-form-item label="Invoice Date">
              <el-date-picker
                v-model="points.invoice_date"
                type="date"
                placeholder="select date"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Invoice No">
              <el-input v-model="points.invoice_no" type="number" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Invoice Amount">
              <el-input v-model="points.invoice_amount" type="number" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Description">
          <el-input v-model="points.other_info" type="text" />
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
  </main>
  <main v-else-if="member?.type === 1" class="w-full">
    <Distributor :member="member" />
  </main>
  <main v-else-if="member?.type === 2" class="w-full">
    <Retailer :member="member" />
  </main>
  <main v-else-if="member?.type === 3" class="w-full">
    <Electrician :member="member" />
  </main>
</template>

<style>
.el-table__row--level-1{
  font-style: italic;
  color: blue;
}
.el-table__row--level-0{
  font-weight: bold;
  color: #000;
}
</style>

<route lang="json">
  {
    "meta" : {
      "requireAuth" : true
    }
  }
</route>
