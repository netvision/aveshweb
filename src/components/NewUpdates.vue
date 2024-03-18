<script setup>
import { Plus } from '@element-plus/icons-vue'
const docModal = ref(false)
</script>

<template>
  <h2>Updates</h2>
  <el-button text :icon="Plus" @click="docModal = true">
    New Update
  </el-button>
  <el-dialog
    v-model="docModal"
    title="Tips"
    width="500"
  >
    <span>New Document</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="docModal = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="docModal = false">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
