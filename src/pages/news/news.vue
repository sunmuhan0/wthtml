<template>
  <view class="detail-page">
    <view v-if="loading" class="loading">
      <text class="loading-text">加载中...</text>
    </view>
    <view v-else-if="detail" class="content">
      <text class="title">{{ detail.title }}</text>
      <view v-for="(block, i) in detail.content" :key="i">
        <text v-if="block.type === 'heading' && block.level === 2" class="h2">{{ block.text }}</text>
        <text v-else-if="block.type === 'heading' && block.level === 3" class="h3">{{ block.text }}</text>
        <text v-else-if="block.type === 'text'" class="text">{{ block.text }}</text>
        <image v-else-if="block.type === 'image'" class="image" :src="block.url" mode="widthFix" />
      </view>
    </view>
    <view v-else class="loading">
      <text class="loading-text">加载失败</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getNewsDetail, type NewsDetail } from '@/api/vehicle'

const loading = ref(true)
const detail = ref<NewsDetail | null>(null)

onLoad(async (options: any) => {
  if (!options?.url) {
    loading.value = false
    return
  }
  try {
    detail.value = await getNewsDetail(decodeURIComponent(options.url))
  } catch {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss">
.detail-page {
  min-height: 100vh;
  background: #1a1a2e;
  padding: 30rpx;
  color: #fff;
}
.loading {
  text-align: center;
  padding: 200rpx 0;
}
.loading-text {
  color: #999;
  font-size: 28rpx;
}
.title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
  line-height: 1.4;
}
.h2 {
  display: block;
  font-size: 30rpx;
  font-weight: bold;
  margin: 30rpx 0 16rpx;
  color: #e74c3c;
}
.h3 {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  margin: 24rpx 0 12rpx;
  color: #f1c40f;
}
.text {
  display: block;
  font-size: 26rpx;
  color: #ccc;
  line-height: 1.8;
  margin-bottom: 16rpx;
}
.image {
  width: 100%;
  border-radius: 12rpx;
  margin: 16rpx 0;
}
</style>
