<script setup>
const props = defineProps(['images'])

const slides = ref(props.images)

const slider = ref(null)
const slideWidth = ref(0)
const currentIndex = ref(0)
let autoSlideInterval

const goToSlide = (index) => {
  slider.value.style.transform = `translateX(-${index * slideWidth.value}px)`
}

const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % slides.value.length
  goToSlide(currentIndex.value)
}

const prevSlide = () => {
  currentIndex.value = (currentIndex.value - 1 + slides.value.length) % slides.value.length
  goToSlide(currentIndex.value)
}

onMounted(() => {
  slideWidth.value = slider.value.offsetWidth

  autoSlideInterval = setInterval(nextSlide, 3000)
})

// Clean up the interval when the component is unmounted
onUnmounted(() => {
  clearInterval(autoSlideInterval)
})
</script>

<template>
  <div class="carousel-container relative overflow-hidden w-full">
    <div ref="slider" class="carousel-slider flex">
      <div v-for="(slide, index) in slides" :key="index" class="carousel-item flex-none w-full">
        <img :src="slide.url" :alt="slide.name" class="w-full h-28">
      </div>
    </div>
    <button class="carousel-prev absolute bottom-0 left-0 ml-2 bg-gray-100 px-2 py-1" @click="prevSlide">
      &lt;
    </button>
    <button class="carousel-next absolute bottom-0 right-0 mr-2 bg-gray-100 px-2 py-1" @click="nextSlide">
      &gt;
    </button>
  </div>
</template>

<style scoped>
.carousel-container {
  position: relative;
}

.carousel-slider {
  transition: transform 0.3s ease;
}

.carousel-item {
  flex-shrink: 0;
}

.carousel-prev,
.carousel-next {
  z-index: 10;
  cursor: pointer;
}

.carousel-prev {
  left: 0;
}

.carousel-next {
  right: 0;
}
</style>
