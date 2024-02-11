<script setup>
const router = useRouter()
onMounted(async () => {
  router.push('/class/1')
})
</script>

<route lang="json">
  {
    "meta" : {
      "requireAuth" : true
    }
  }
</route>
