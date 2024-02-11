<!-- eslint-disable no-alert -->
<!-- eslint-disable eqeqeq -->
<!-- eslint-disable no-console -->
<script setup>
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth'
import axios from 'axios'
import { useAuthStore } from '~/stores/authStore'
const authStore = useAuthStore()
const member = ref({})
const members = ref([])
const newMemberModal = ref(false)
const formRef = ref()
const auth = getAuth()
// console.log(auth.currentUser.email)
const distributors = ref([])
const disabled = ref(true)
const form = reactive({
  type: '',
  email: '',
  password: '',
  con_password: '',
  full_name: '',
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

const createUser = async (email, password) => {
  try {
    const auth = getAuth()
    await createUserWithEmailAndPassword(auth, email, password)
    // User created successfully
    // Do not automatically sign in the user here
  }
  catch (err) {
    alert(err.message)
  }
}

const saveForm = async () => {
  if (form.password === form.con_password) {
    await createUser(form.email, form.password)
    const res = await axios.post('https://avesh.netserve.in/members',
      {
        type: form.type,
        distributor_id: form.distributor_id ?? 0,
        full_name: form.full_name,
        email: form.email,
        contact_no: form.contact_no,
        firm_title: form.firm_title,
        aadhar: form.aadhar,
        full_address: form.address,
        city: form.city,
      })
    console.log(res.data)
    if (res.status == '201')
      members.value.push(res.data)

    else alert('Couldnt add member')
  }
  else { console.log('please check password') }
  resetForm()
}

const checkType = () => {
  console.log(form.type)
  if (form.type == 2) { disabled.value = false }
  else {
    disabled.value = true
    form.distributor_id = null
  }
}
onMounted(async () => {
  const dis = await axios.get('https://avesh.netserve.in/members').then(res => res.data)
  members.value = dis
  dis.forEach((e) => {
    if (e.type === 1) {
      distributors.value.push({
        value: e.id,
        label: e.firm_title,
      })
    }
  })
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
              <el-radio-group v-model="form.type" class="ml-4" @change="checkType">
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
                :options="distributors"
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
                <el-form-item label="Aadhar Number">
                  <el-input v-model="form.aadhar" type="number" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="15">
                <el-form-item label="Name of the Firm">
                  <el-input v-model="form.firm_title" type="text" />
                </el-form-item>
              </el-col>
              <el-col :span="9">
                <el-form-item label="Contact No">
                  <el-input v-model="form.contact_no" type="number" />
                </el-form-item>
              </el-col>
            </el-row>
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
              <el-button type="primary" plain @click="saveForm">
                Confirm
              </el-button>
            </div>
          </template>
        </el-dialog>
      </div>
    </div>
    <div class="w-full">
      <pre>{{ members }}</pre>
    </div>
  </main>
  <main v-else-if="member?.type === 1" class="w-full">
    <div class="flex items-center justify-between">
      <div class="ml-10 my-3">
        <h2 class="text-xl font-bold text-gray-800 transition-colors duration-300 transform dark:text-white lg:text-3xl hover:text-gray-700 dark:hover:text-gray-300">
          {{ member?.firm_title }}
        </h2>
      </div>
      <div class="mr-10 my-3">
        <span class="text-blue-400 italic">Accumulated Points: </span><span class="font-bold">0</span>
        <span class="text-blue-400 italic ml-10">Available for Retailers: </span><span class="font-bold">0</span>
      </div>
    </div>
  </main>
  <main v-else-if="member?.type === 2" class="w-full">
    <div class="flex items-center justify-between bg-slate-200">
      <div class="ml-10 my-3">
        <h2 class="text-xl font-bold text-gray-800 transition-colors duration-300 transform dark:text-white lg:text-3xl hover:text-gray-700 dark:hover:text-gray-300">
          {{ member?.firm_title }}
        </h2>
      </div>
      <div class="mr-10 my-3">
        <span class="text-blue-400 italic">Accumulated Points: </span><span class="font-bold">0</span>
      </div>
    </div>
  </main>
</template>

<route lang="json">
  {
    "meta" : {
      "requireAuth" : true
    }
  }
</route>
