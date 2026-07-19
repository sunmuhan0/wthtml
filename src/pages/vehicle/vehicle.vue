<template>
  <view class="container">
    <view v-if="vehicle" class="detail">
      <view class="back-btn" @tap="vehicle = null">
        <text class="back-text">← 返回列表</text>
      </view>
      <text class="vname">{{ vehicle.name }}</text>
      <view class="info-grid">
        <view class="info-item">
          <text class="label">国家</text>
          <text class="value">{{ countryMap[vehicle.country] || vehicle.country }}</text>
        </view>
        <view class="info-item">
          <text class="label">类型</text>
          <text class="value">{{ typeMap[vehicle.type] || vehicle.type }}</text>
        </view>
        <view class="info-item">
          <text class="label">等级</text>
          <text class="value">R{{ vehicle.rank }}</text>
        </view>
        <view class="info-item">
          <text class="label">权重 (街机/历史/全真)</text>
          <text class="value">{{ vehicle.br }}</text>
        </view>
        <view class="info-item">
          <text class="label">乘员</text>
          <text class="value">{{ vehicle.crew || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="label">质量 (t)</text>
          <text class="value">{{ vehicle.mass || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="label">引擎功率 (hp)</text>
          <text class="value">{{ vehicle.engine_power || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="label">最高速度 (km/h)</text>
          <text class="value">{{ vehicle.max_speed || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="label">金币载具</text>
          <text class="value">{{ vehicle.is_premium ? '是' : '否' }}</text>
        </view>
        <view class="info-item">
          <text class="label">隐藏载具</text>
          <text class="value">{{ vehicle.is_hidden ? '是' : '否' }}</text>
        </view>
      </view>
    </view>

    <view v-else>
      <view class="search-bar">
        <input class="input" v-model="searchText" placeholder="输入载具名称" @input="onSearch" />
      </view>

      <view class="filters">
        <picker :range="countryLabels" @change="onCountryChange">
          <view class="picker">{{ selectedCountryLabel || '全部国家' }}</view>
        </picker>
        <picker :range="typeLabels" @change="onTypeChange">
          <view class="picker">{{ selectedTypeLabel || '全部类型' }}</view>
        </picker>
      </view>

      <view class="vehicle-list">
        <view v-if="vehicles.length === 0" class="empty">
          <text class="empty-text">{{ loading ? '加载中...' : '输入名称或选择筛选条件查询' }}</text>
        </view>
        <view v-for="(v, i) in vehicles" :key="i" class="vehicle-item" @tap="selectVehicle(v)">
          <text class="item-name">{{ v.name }}</text>
          <view class="item-meta">
            <text class="item-tag">{{ countryMap[v.country] || v.country }}</text>
            <text class="item-tag">{{ typeMap[v.type] || v.type }}</text>
            <text class="item-br">R{{ v.rank }} · BR {{ v.br }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getVehicle, listVehicles, getVehicleFilters, type Vehicle } from '@/api/vehicle'

const countryMap: Record<string, string> = {
  ussr: '苏联', germany: '德国', usa: '美国', japan: '日本',
  britain: '英国', china: '中国', sweden: '瑞典', france: '法国',
  italy: '意大利', israel: '以色列',
}

const typeMap: Record<string, string> = {
  exp_fighter: '战斗机', exp_bomber: '轰炸机', exp_assault: '攻击机',
  exp_tank: '轻型坦克', exp_heavy_tank: '重型坦克', exp_tank_destroyer: '坦克歼击车',
  exp_SPAA: '防空车', exp_helicopter: '直升机',
  exp_destroyer: '驱逐舰', exp_cruiser: '巡洋舰',
  exp_gun_boat: '炮艇', exp_torpedo_boat: '鱼雷艇',
  exp_torpedo_gun_boat: '鱼雷炮艇', exp_submarine_chaser: '猎潜艇',
  exp_naval_ferry_barge: '运输驳船',
}

const searchText = ref('')
const vehicle = ref<Vehicle | null>(null)
const vehicles = ref<Vehicle[]>([])
const loading = ref(false)

const countries = ref<string[]>([])
const types = ref<string[]>([])
const countryLabels = ref<string[]>([])
const typeLabels = ref<string[]>([])
const selectedCountry = ref('')
const selectedType = ref('')
const selectedCountryLabel = ref('')
const selectedTypeLabel = ref('')

let searchTimer: ReturnType<typeof setTimeout> | null = null

onMounted(async () => {
  try {
    const filters = await getVehicleFilters()
    countries.value = filters.countries || []
    types.value = filters.types || []
    countryLabels.value = ['全部国家', ...countries.value.map(c => countryMap[c] || c)]
    typeLabels.value = ['全部类型', ...types.value.map(t => typeMap[t] || t)]
  } catch {}
  doSearch()
})

function onSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => doSearch(), 300)
}

function onCountryChange(e: any) {
  const idx = e.detail.value
  selectedCountryLabel.value = idx > 0 ? countryLabels.value[idx] : ''
  selectedCountry.value = idx > 0 ? countries.value[idx - 1] : ''
  doSearch()
}

function onTypeChange(e: any) {
  const idx = e.detail.value
  selectedTypeLabel.value = idx > 0 ? typeLabels.value[idx] : ''
  selectedType.value = idx > 0 ? types.value[idx - 1] : ''
  doSearch()
}

async function doSearch() {
  loading.value = true
  try {
    vehicles.value = await listVehicles(selectedCountry.value, selectedType.value, searchText.value)
  } catch {
    vehicles.value = []
  } finally {
    loading.value = false
  }
}

async function selectVehicle(v: Vehicle) {
  try {
    vehicle.value = await getVehicle(v.name)
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
  margin-bottom: 20rpx;
}
.input {
  width: 100%;
  height: 80rpx;
  background: rgba(255,255,255,0.1);
  border-radius: 16rpx;
  padding: 0 30rpx;
  color: #fff;
}
.filters {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
}
.picker {
  flex: 1;
  height: 72rpx;
  line-height: 72rpx;
  background: rgba(255,255,255,0.1);
  border-radius: 12rpx;
  text-align: center;
  font-size: 26rpx;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.back-btn {
  margin-bottom: 20rpx;
}
.back-text {
  color: #e74c3c;
  font-size: 28rpx;
}
.vname {
  font-size: 36rpx;
  font-weight: bold;
  display: block;
  text-align: center;
  margin-bottom: 30rpx;
}
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}
.info-item {
  background: rgba(255,255,255,0.08);
  border-radius: 16rpx;
  padding: 24rpx;
  text-align: center;
}
.label {
  display: block;
  font-size: 22rpx;
  color: #999;
}
.value {
  display: block;
  font-size: 28rpx;
  margin-top: 8rpx;
  color: #f1c40f;
  word-break: break-all;
}
.vehicle-list {
  margin-top: 10rpx;
}
.empty {
  text-align: center;
  padding: 100rpx 0;
}
.empty-text {
  color: #666;
  font-size: 28rpx;
}
.vehicle-item {
  background: rgba(255,255,255,0.06);
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}
.item-name {
  font-size: 30rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 8rpx;
}
.item-meta {
  display: flex;
  gap: 12rpx;
  align-items: center;
}
.item-tag {
  font-size: 22rpx;
  color: #aaa;
  background: rgba(255,255,255,0.08);
  border-radius: 8rpx;
  padding: 4rpx 12rpx;
}
.item-br {
  font-size: 22rpx;
  color: #e74c3c;
}
</style>
