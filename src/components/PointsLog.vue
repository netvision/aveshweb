<!-- eslint-disable no-alert -->
<!-- eslint-disable no-console -->
<script setup>
import axios from 'axios'
const props = defineProps(['member', 'op'])
const points = ref()
const loading = ref(false)

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
      const promises = []
      transactions.forEach((trn) => {
        const tr = { ...trn }
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
      })
      Promise.allSettled(promises).then(res => console.log(res))
      setTimeout(() => {
        alert('Deleted!')
        location.reload()
      }, 3000)
    }
  }
}

watch(() => props.member, async (newValue, oldValue) => {
  points.value = []
  console.log(newValue)// Check if propValue has actually changed
  if (newValue !== oldValue) {
    loading.value = true
    // Fetch data based on new propValue
    try {
      points.value = await axios.get(`https://avesh.netserve.in/points?filter[member_id][eq]=${newValue.id}`).then(r => r.data)
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
    }
    catch (error) {
      console.error('Error fetching data:', error)
    }
    finally {
      loading.value = false // Set loading to false after data is fetched
    }
  }
})
onMounted(async () => {
  points.value = await axios.get(`https://avesh.netserve.in/points?filter[member_id][eq]=${props.member.id}`).then(r => r.data)
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
  <el-table v-loading="loading" :data="points" border style="width:100%">
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
      <el-table-column v-if="member.type === 1" prop="av" label="Available" />
    </el-table-column>
    <el-table-column v-if="op" fixed="right" label="Operations" width="50">
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
        <el-button type="primary" plain @click="editTr(transaction)">
          Edit
        </el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog
    v-model="delTrModal"
    :title="member.firm_title"
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
        <el-button type="primary" plain @click="delTr(transaction)">
          Confirm Delete
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
