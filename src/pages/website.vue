<script setup>
const activeTab = ref('first')
</script>

<template class="min-h-screen">
  <Header />
  <div class="p-5">
    <h2 class="text-xl font-bold text-gray-800 transition-colors duration-300 transform lg:text-3xl hover:text-gray-700 dark:hover:text-gray-300">
      Manage Website
    </h2>
    <el-tabs v-model="activeTab" class="demo-tabs">
      <el-tab-pane label="HomePage Slides" name="first">
        Home Page Slides
      </el-tab-pane>
      <el-tab-pane label="Products" name="second">
        <Categories />
      </el-tab-pane>
      <el-tab-pane label="Information" name="fourth">
        <Information />
      </el-tab-pane>
      <el-tab-pane label="Contact &amp; Social Media" name="fifth">
        <ContactInfo />
      </el-tab-pane>
      <el-tab-pane label="Feedbacks" name="sixth">
        <Feedback />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style>

</style>

<route lang="json">
  {
    "meta" : {
      "requireAuth" : true
    }
  }
</route>
