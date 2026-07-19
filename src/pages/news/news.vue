<template>
  <view class="container">
    <web-view :src="url" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const url = ref('')

onLoad((options: any) => {
  if (options?.url) {
    url.value = decodeURIComponent(options.url)
  }
})
</script>

<style>
.container {
  width: 100%;
  height: 100vh;
}
</style>
