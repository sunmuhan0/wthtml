<template>
  <view class="container">
    <view class="search-bar">
      <input class="input" v-model="name" placeholder="输入载具名称" />
      <button class="btn" @tap="search">查询</button>
    </view>

    <view v-if="vehicle" class="detail">
      <text class="vname">{{ vehicle.name }}</text>
      <view class="info-grid">
        <view class="info-item">
          <text class="label">国家</text>
          <text class="value">{{ vehicle.country }}</text>
        </view>
        <view class="info-item">
          <text class="label">类型</text>
          <text class="value">{{ vehicle.type }}</text>
        </view>
        <view class="info-item">
          <text class="label">等级</text>
          <text class="value">{{ vehicle.rank }}</text>
        </view>
        <view class="info-item">
          <text class="label">权重</text>
          <text class="value">{{ vehicle.br }}</text>
        </view>
        <view class="info-item">
          <text class="label">乘员</text>
          <text class="value">{{ vehicle.crew }}</text>
        </view>
        <view class="info-item">
          <text class="label">质量 (t)</text>
          <text class="value">{{ vehicle.mass }}</text>
        </view>
        <view class="info-item">
          <text class="label">引擎功率 (hp)</text>
          <text class="value">{{ vehicle.engine_power }}</text>
        </view>
        <view class="info-item">
          <text class="label">最高速度 (km/h)</text>
          <text class="value">{{ vehicle.max_speed }}</text>
        </view>
        <view class="info-item">
          <text class="label">金币载具</text>
          <text class="value">{{ vehicle.is_premium ? '是' : '否' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getVehicle, type Vehicle } from '@/api/vehicle'

const name = ref('')
const vehicle = ref<Vehicle | null>(null)

async function search() {
  if (!name.value) return
  try {
    vehicle.value = await getVehicle(name.value)
  } catch {
    uni.showToast({ title: '查询失败', icon: 'none' })
  }
}
</script>

<style lang="scss">
.container {
  padding: 30rpx;
  min-height: 100vh;
  background: #1a1a2e;
  color: #fff;
}
.search-bar {
  display: flex;
  gap: 20rpx;
  margin-bottom: 40rpx;
}
.input {
  flex: 1;
  height: 80rpx;
  background: rgba(255,255,255,0.1);
  border-radius: 16rpx;
  padding: 0 30rpx;
  color: #fff;
}
.btn {
  width: 140rpx;
  height: 80rpx;
  line-height: 80rpx;
  background: #e74c3c;
  color: #fff;
  border-radius: 16rpx;
  text-align: center;
}
.vname {
  font-size: 40rpx;
  font-weight: bold;
  display: block;
  text-align: center;
  margin-bottom: 40rpx;
}
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}
.info-item {
  background: rgba(255,255,255,0.08);
  border-radius: 16rpx;
  padding: 30rpx;
  text-align: center;
}
.label {
  display: block;
  font-size: 24rpx;
  color: #999;
}
.value {
  display: block;
  font-size: 32rpx;
  margin-top: 8rpx;
  color: #f1c40f;
}
</style>
