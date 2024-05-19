<!-- eslint-disable no-alert -->
<!-- eslint-disable prefer-const -->
<!-- eslint-disable no-console -->
<script setup>
import axios from 'axios'
import { Delete, EditPen, Plus } from '@element-plus/icons-vue'

const activeCatId = ref(1)
const cats = ref([])
const activeCat = ref({})
const activeProduct = ref({})

const catModal = ref(false)
const productModal = ref(false)

const openCatModal = () => catModal.value = true
const catImgUpload = (res) => {
  activeCat.value.image_src = res
}

const saveCat = async () => {
  const res = (activeCat.value.id) ? await axios.put(`https://avesh.netserve.in/cats/${activeCat.value.id}`, activeCat.value) : await axios.post('https://avesh.netserve.in/cats', activeCat.value)
  catModal.value = false
}

const prodImgs = ref([])
const imgs = ref([])
const prodImgUpload = (res) => {
  prodImgs.value.push(res)
  console.log(prodImgs.value)
}
const handleRemove = (f, files) => {
  const index = prodImgs.value.findIndex(im => im.url === f.url)
  prodImgs.value.splice(index, 1)
  // console.log(newUpdate.value.images)
  console.log(index)
}

const saveProduct = async () => {
  activeProduct.value.img_urls = JSON.stringify(prodImgs.value)
  activeProduct.value.new_launch = (activeProduct.value.new_launch) ? 1 : 0
  const res = (activeProduct.value.id) ? await axios.put(`https://avesh.netserve.in/prods/${activeProduct.value.id}`, activeProduct.value) : await axios.post('https://avesh.netserve.in/prods', activeProduct.value)
  if (!activeProduct.value.id)
    activeCat.value.products.push(activeProduct.value)
  productModal.value = false
}

const delProd = async (prod) => {
  if (confirm('Are you sure you want to delete')) {
    const res = await axios.delete(`https://avesh.netserve.in/prods/${prod.id}`)
    if (res.status) {
      activeCat.value.products = activeCat.value.products.filter(p => p.id !== prod.id)
      alert('deleted successfully')
    }
  }
}

const openProductModal = (prod) => {
  if (prod.id) {
    activeProduct.value = prod
    if (prod.img_urls && JSON.parse(prod.img_urls).length > 0) {
      prodImgs.value = JSON.parse(prod.img_urls)
      imgs.value = JSON.parse(prod.img_urls)
    }
  }
  else {
    activeProduct.value = {}
    imgs.value = []
  }
  productModal.value = true
}

const getProducts = () => {
  activeCat.value = cats.value.find(c => c.id === activeCatId.value)
  activeProduct.value.cat_id = activeCatId.value
}

onMounted(async () => {
  cats.value = await axios.get('https://avesh.netserve.in/cats?expand=products').then(r => r.data)
  activeCat.value = cats.value[0]
  activeProduct.value.cat_id = cats.value[0].id
})
</script>

<template>
  <div>Products</div>
  <el-tabs v-model="activeCatId" type="border-card" tab-position="left" @tab-change="getProducts">
    <el-tab-pane v-for="cat in cats" :key="cat.id" :name="cat.id" :label="cat.name">
      <div class="flex gap-2 border-b-2">
        <h2>{{ activeCat.name }}</h2><el-button plain text :icon="EditPen" @click="openCatModal" />
      </div>
      <div class="p-4">
        <el-button plain :icon="Plus" @click="openProductModal">
          Add Product
        </el-button>
      </div>
      <el-row v-if="activeCat.products.length > 0" :gutter="10">
        <el-col v-for="prod in activeCat.products" :key="prod.id" :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
          <el-card>
            <span>{{ prod.name }}</span>
            <div v-if="prod.img_urls && JSON.parse(prod.img_urls).length > 0" class="h-64 md:h-48">
              <div v-if="JSON.parse(prod.img_urls).length > 1">
                <el-carousel height="150px">
                  <el-carousel-item v-for="img in JSON.parse(prod.img_urls)" :key="img.name">
                    <el-image :src="img.url" class="w-full" fit="cover" />
                  </el-carousel-item>
                </el-carousel>
              </div>
              <div v-else>
                <el-image :src="JSON.parse(prod.img_urls)[0].url" class="w-full h-64 md:h-48" fit="cover" />
              </div>
              <div>
                {{ prod.description }}
              </div>
            </div>
            <div v-else class="h-64 md:h-48">
              {{ prod.description }}
            </div>
            <template #footer>
              <div class="flex justify-between">
                <el-button text :icon="EditPen" @click="openProductModal(prod)" />
                <el-button text :icon="Delete" @click="delProd(prod)" />
              </div>
            </template>
          </el-card>
        </el-col>
      </el-row>
    </el-tab-pane>
  </el-tabs>
  <el-dialog
    v-model="catModal"
    title="Edit Category"
  >
    <el-form label-position="top" label-width="auto" :model="activeCat">
      <el-upload
        class="avatar-uploader"
        action="https://avesh.netserve.in/cat/upload"
        :show-file-list="false"
        :on-success="catImgUpload"
      >
        <img v-if="activeCat.image_src" :src="`https://avesh.netserve.in/${activeCat.image_src}`" class="avatar">
        <el-icon v-else class="avatar-uploader-icon">
          <Plus />
        </el-icon>
      </el-upload>

      <el-form-item label="Category Name">
        <el-input v-model="activeCat.name" />
      </el-form-item>
      <el-form-item label="Description">
        <el-input v-model="activeCat.description" type="textarea" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="catModal = false">
          Cancel
        </el-button>
        <el-button @click="saveCat">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog
    v-model="productModal"
    :title="(activeProduct.id) ? 'Edit Product' : 'Add Product'"
  >
    <el-form label-position="top" label-width="auto" :model="activeProduct">
      <el-form-item label="Category">
        <el-select
          v-model="activeProduct.cat_id"
          placeholder="Select"
          size="large"
        >
          <el-option
            v-for="cat in cats"
            :key="cat.id"
            :label="cat.name"
            :value="cat.id"
          />
        </el-select>
      </el-form-item>
      <el-row :gutter="10">
        <el-col :span="16">
          <el-form-item label="Product Name">
            <el-input v-model="activeProduct.name" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="&nbsp;">
            <el-checkbox v-model="activeProduct.new_launch" label="Is New Launch?" size="large" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="Description">
        <el-input v-model="activeProduct.description" type="textarea" />
      </el-form-item>
      <el-upload
        v-model:file-list="imgs"
        class="upload-demo"
        action="https://avesh.netserve.in/product/upload"
        :on-success="prodImgUpload"
        :on-remove="handleRemove"
        list-type="picture-card"
        :limit="4"
      >
        <el-button text type="success" :icon="Plus" />
      </el-upload>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="productModal = false">
          Cancel
        </el-button>
        <el-button @click="saveProduct">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>

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
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>
