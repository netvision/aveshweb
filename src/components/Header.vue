<!-- eslint-disable no-console -->
<script setup>
import axios from 'axios'
import { useAuthStore } from '~/stores/authStore'
const authStore = useAuthStore()
const member = ref({})
const passwordModal = ref(false)
const formRef = ref()
const pd = ref({})
const openPasswordModal = () => {
  passwordModal.value = true
}

const isDisabled = ref(false)
const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('Please input the password'))
  }
  else {
    if (pd.password !== '') {
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
  else if (value !== pd.value.password)
    callback(new Error('Passwords don\'t match!'))
  else
    callback()
}

const rules = reactive({
  password: [{ validator: validatePass, trigger: 'blur' }],
  con_password: [{ validator: validatePass2, trigger: 'blur' }],
})

const update = () => {
  if (pd.value.password === pd.value.con_password)
    authStore.changePassword(pd.value.password)
}

const logout = () => {
  authStore.signout()
}
const isOpen = ref(false)
onMounted(async () => {
  member.value = await authStore.member
})
</script>

<template>
  <Suspense>
    <template #default>
      <nav class="bg-orange-200 dark:bg-gray-800">
        <div class="container px-6 py-4 mx-auto">
          <div class="flex items-center justify-between">
            <div>
              <a class="text-2xl font-bold text-gray-800 transition-colors duration-300 transform dark:text-white lg:text-3xl hover:text-gray-700 dark:hover:text-gray-300" href="/">Avesh - Dashboard</a>
            </div>
            <div class="flex justify-center mt-6 lg:flex lg:mt-0 lg:-mx-2">
              <el-dropdown>
                <span class="el-dropdown-link text-lg">
                  {{ member.full_name }}
                  <el-icon class="el-icon--right">
                    <arrow-down />
                  </el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="openPasswordModal">
                      Change Password
                    </el-dropdown-item>
                    <el-dropdown-item @click="logout">
                      Logout
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <el-dialog
              v-model="passwordModal"
              title="Change Password"
              width="500"
              align-center
            >
              <el-form ref="formRef" :model="pd" label-width="120px" :rules="rules" status-icon label-position="top">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="Password" prop="password">
                      <el-input v-model="pd.password" type="password" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="Confirm Password" prop="con_password">
                      <el-input v-model="pd.con_password" type="password" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
              <template #footer>
                <div class="dialog-footer">
                  <el-button @click="() => passwordModal = false">
                    Cancel
                  </el-button>
                  <el-button type="primary" :disabled="isDisabled" plain @click="update">
                    Confirm
                  </el-button>
                </div>
              </template>
            </el-dialog>
          </div>
        </div>
      </nav>
    </template>
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>

<style scoped>
.example-showcase .el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}
</style>
