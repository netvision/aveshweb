<!-- eslint-disable no-console -->
<script setup>
import axios from 'axios'
const props = defineProps(['id'])
const docs = ref([])

const newDoc = ref({})
const isDragging = ref(false)
const doc_file = ref()

const onChange = (e) => {
  console.log(e.target.files[0])
  doc_file.value = e.target.files[0]
}

const dragover = (e) => {
  e.preventDefault()
  isDragging.value = true
}
const dragleave = () => isDragging.value = false

const drop = (e) => {
  e.preventDefault()
  console.log(e.dataTransfer.files[0])
  doc_file.value = e.dataTransfer.files[0]
  isDragging.value = false
}
const remove = () => {
  doc_file.value = null
  isDragging.value = false
}
const uploadPercentage = ref(0)

const addDoc = async () => {
  newDoc.value.student_id = props.id
  const newData = await axios.post('https://schoolsapi.netserve.in/student-documents', newDoc.value).then(r => r.data)
  docs.value.unshift(newData)
  newDoc.value = {}
  doc_file.value = null
  uploadPercentage.value = 0
  // eslint-disable-next-line no-alert
  alert('Uploaded successfully')
}

const submit = async () => {
  const formData = new FormData()
  formData.append('doc_file', doc_file.value)
  formData.append('id', props.id)
  formData.append('title', newDoc.value.title)

  try {
    newDoc.value.url = await axios.post('https://schoolsapi.netserve.in/student-document/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress(progressEvent) {
        uploadPercentage.value = parseInt(Math.round((progressEvent.loaded / progressEvent.total) * 100))
      },
    }).then (r => r.data)
  }
  catch (e) {
    console.log(e)
  }

  if (newDoc.value.url) {
    newDoc.value.student_id = +props.id
    await addDoc()
  }
}

const getFilename = (url) => {
  const name = url.split('/').pop()
  return {
    name,
    ext: name.split('.').pop(),
  }
}

onMounted(async () => {
  docs.value = await axios.get(`https://schoolsapi.netserve.in/student-document?filter[student_id][eq]=${props.id}`).then(r => r.data)
})
</script>

<template>
  <Header />
  <div class="container px-6 py-4 mx-auto">
    <div class="grid md:grid-cols-4 gap-3">
      <div class="px-3 py-4 overflow-y-auto rounded bg-gray-50 dark:bg-gray-800">
        <StudentLeftMenu id="3" />
      </div>
      <div class="bg-red-100 md:col-span-2">
        <div v-if="docs.length > 0" class="flex flex-wrap">
          <div v-for="doc in docs" :key="doc.id" class="w-44 m-4 p-2 block rounded-lg bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:bg-neutral-700">
            <a href="#!">
              <img
                v-if="getFilename(doc.url).ext === 'png' || getFilename(doc.url).ext === 'jpg'"
                class="w-36 h-36 rounded-t-lg"
                :src="doc.url"
                alt=""
              >
            </a>
            <div class="p-6">
              <h5
                class="mb-2 text-xl font-medium leading-tight text-neutral-800 dark:text-neutral-50"
              >
                {{ doc.title }}
              </h5>
              <p class="mb-4 text-base text-neutral-600 dark:text-neutral-200">
                {{ doc.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-blue-100">
        <div
          v-if="typeof doc_file === 'undefined' || doc_file === null"
          class="dropzone-container"
          :style="isDragging && 'border-color: green;'"
          draggable="true"
          @dragover="dragover"
          @dragleave="dragleave"
          @drop="drop"
        >
          <input
            id="fileInput"
            type="file"
            class="hidden-input"
            accept=".pdf, image/*"
            @change="onChange"
          >

          <label for="fileInput" class="file-label">
            <div v-if="isDragging">Release to drop files here.</div>
            <div v-else>Drop files here or <u>click here</u> to upload.</div>
          </label>
        </div>
        <div v-else class="preview-container mt-4">
          <div class="flex m-4 p-2">
            <div>
              <p>
                {{ doc_file.name }}
              </p>
            </div>
            <div>
              <button
                class="ml-2"
                type="button"
                title="Remove file"
                @click="remove"
              >
                <b>×</b>
              </button>
            </div>
          </div>
          <div class="relative z-0 m-6 group">
            <input id="title" v-model="newDoc.title" type="text" name="title" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required>
            <label for="title" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Title</label>
          </div>
          <div class="relative z-0 m-6 group">
            <input id="description" v-model="newDoc.description" type="text" name="description" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required>
            <label for="description" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Description</label>
          </div>
          <div class="relative z-0 m-6 group">
            <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" @click="submit">
              Submit
            </button>
          </div>
          <div class="relative z-0 m-6 group">
            <progress max="100" :value.prop="uploadPercentage" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.dropzone-container {
    padding: 4rem;
    background: #f7fafc;
    border: 1px solid #e2e8f0;
}

.hidden-input {
    opacity: 0;
    overflow: hidden;
    position: absolute;
    width: 1px;
    height: 1px;
}

.file-label {
    font-size: 20px;
    display: block;
    cursor: pointer;
}

.preview-container {

    margin-top: 2rem;
}

.preview-img {
    width: 50px;
    height: 50px;
    border-radius: 5px;
    border: 1px solid #a2a2a2;
    background-color: #a2a2a2;
}
</style>

<route lang="json">
  {
    "meta" : {
      "requireAuth" : true
    }
  }
</route>
