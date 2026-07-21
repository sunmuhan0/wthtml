<template>
  <view class="container">
    <view class="search-bar">
      <input class="input" v-model="nickname" placeholder="输入玩家昵称 (如 Dark#598)" />
      <button class="btn" @tap="search">查询</button>
    </view>

    <view v-if="player" class="profile">
      <text class="nickname">{{ player.nickname }}</text>
      <view class="profile-row">
        <text class="level">Lv.{{ player.level }} ({{ player.level_progress }}%)</text>
        <text v-if="player.title" class="title">{{ player.title }}</text>
      </view>
      <view v-if="player.squadron" class="profile-row">
        <text class="squadron">战队: {{ player.squadron }}</text>
      </view>
      <view class="profile-row">
        <text class="spaded">满研: {{ player.spaded_total }}</text>
        <text v-if="player.register_day" class="reg">注册: {{ formatDate(player.register_day) }}</text>
      </view>

      <view class="mode-tabs">
        <text v-for="mode in modes" :key="mode.key" class="mode-tab" :class="{ active: activeMode === mode.key }" @tap="activeMode = mode.key">{{ mode.label }}</text>
      </view>

      <view v-if="currentPvP" class="stats-grid">
        <view class="stat-item">
          <text class="stat-value">{{ currentPvP.games }}</text>
          <text class="stat-label">场次</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ currentPvP.win_rate.toFixed(1) }}%</text>
          <text class="stat-label">胜率</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ currentPvP.kd.toFixed(1) }}</text>
          <text class="stat-label">K/D</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ currentPvP.kills }}</text>
          <text class="stat-label">玩家击杀</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ currentPvP.kills_per_battle.toFixed(1) }}</text>
          <text class="stat-label">场均击杀</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ formatTime(currentPvP.time_played) }}</text>
          <text class="stat-label">游玩时间</text>
        </view>
      </view>

      <view v-if="currentPvP" class="kill-detail">
        <text class="section-title">击杀明细</text>
        <view class="kill-row">
          <text class="kill-label">空战</text>
          <text class="kill-val">{{ currentPvP.air_kills }}</text>
          <text class="kill-label">地面</text>
          <text class="kill-val">{{ currentPvP.ground_kills }}</text>
          <text class="kill-label">海战</text>
          <text class="kill-val">{{ currentPvP.naval_kills }}</text>
        </view>
        <view class="kill-row">
          <text class="kill-label">AI/Bot</text>
          <text class="kill-val">{{ currentPvP.ai_bot_kills }}</text>
          <text class="kill-label">出场</text>
          <text class="kill-val">{{ currentPvP.respawns }}</text>
        </view>
      </view>

      <view v-if="currentPvP && hasVehicleTime" class="vehicle-time">
        <text class="section-title">载具时间</text>
        <view class="vt-grid">
          <view v-for="vt in vehicleTimes" :key="vt.label" class="vt-item">
            <text class="vt-label">{{ vt.label }}</text>
            <text class="vt-val">{{ formatHours(vt.time) }}</text>
          </view>
        </view>
      </view>
    </view>

    <view v-if="error" class="error">
      <text>{{ error }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getPlayerDetail, type PlayerDetail, type DetailPvP } from '@/api/player'

const nickname = ref('')
const player = ref<PlayerDetail | null>(null)
const activeMode = ref('realistic')
const error = ref('')

const modes = [
  { key: 'arcade', label: '街机' },
  { key: 'realistic', label: '真战' },
  { key: 'simulator', label: '模拟' },
]

const currentPvP = computed<DetailPvP | null>(() => {
  if (!player.value) return null
  const mode = player.value[activeMode.value as keyof PlayerDetail] as { pvp: DetailPvP | null } | null
  return mode?.pvp ?? null
})

const vehicleTimes = computed(() => {
  if (!currentPvP.value) return []
  const p = currentPvP.value
  return [
    { label: '战斗机', time: p.fighter_time },
    { label: '坦克', time: p.tank_time },
    { label: '重坦', time: p.heavy_tank_time },
    { label: '歼击车', time: p.td_time },
    { label: '防空车', time: p.spaa_time },
    { label: '舰船', time: p.ship_time },
    { label: '直升机', time: p.heli_time },
  ].filter(v => v.time > 0)
})

const hasVehicleTime = computed(() => vehicleTimes.value.length > 0)

function formatTime(sec: number): string {
  const h = Math.floor(sec / 3600)
  if (h >= 24) return Math.floor(h / 24) + '天' + (h % 24) + 'h'
  return h + 'h'
}

function formatHours(sec: number): string {
  return (sec / 3600).toFixed(0) + 'h'
}

function formatDate(ts: number): string {
  if (!ts) return ''
  const d = new Date(ts * 1000)
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

onLoad((options: any) => {
  if (options?.nickname) {
    nickname.value = decodeURIComponent(options.nickname)
    search()
  }
})

async function search() {
  if (!nickname.value) return
  error.value = ''
  player.value = null
  try {
    player.value = await getPlayerDetail(nickname.value)
    activeMode.value = player.value.realistic ? 'realistic' : 'arcade'
  } catch {
    error.value = '查询失败，请稍后重试'
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
.profile { text-align: center; }
.nickname {
  font-size: 40rpx;
  font-weight: bold;
  display: block;
}
.profile-row {
  margin: 10rpx 0;
  display: flex;
  justify-content: center;
  gap: 20rpx;
}
.level { color: #f1c40f; font-size: 28rpx; }
.title { color: #3498db; font-size: 28rpx; }
.squadron { color: #e67e22; font-size: 26rpx; }
.spaded { color: #2ecc71; font-size: 26rpx; }
.reg { color: #999; font-size: 24rpx; }
.mode-tabs {
  display: flex;
  gap: 10rpx;
  margin: 30rpx 0;
  justify-content: center;
}
.mode-tab {
  padding: 10rpx 30rpx;
  background: rgba(255,255,255,0.08);
  border-radius: 30rpx;
  font-size: 26rpx;
}
.mode-tab.active {
  background: #e74c3c;
  color: #fff;
}
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}
.stat-item {
  background: rgba(255,255,255,0.08);
  border-radius: 16rpx;
  padding: 30rpx;
}
.stat-value {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #e74c3c;
}
.stat-label {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}
.section-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  margin: 30rpx 0 16rpx;
  text-align: left;
}
.kill-detail {
  background: rgba(255,255,255,0.05);
  border-radius: 16rpx;
  padding: 24rpx;
  margin-top: 20rpx;
}
.kill-row {
  display: flex;
  gap: 20rpx;
  justify-content: center;
  margin: 10rpx 0;
}
.kill-label { color: #999; font-size: 24rpx; }
.kill-val { color: #fff; font-size: 24rpx; font-weight: bold; }
.vehicle-time {
  background: rgba(255,255,255,0.05);
  border-radius: 16rpx;
  padding: 24rpx;
  margin-top: 20rpx;
}
.vt-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16rpx;
}
.vt-item { text-align: center; }
.vt-label { display: block; font-size: 22rpx; color: #999; }
.vt-val { display: block; font-size: 28rpx; font-weight: bold; color: #e74c3c; }
.error {
  text-align: center;
  margin-top: 60rpx;
  color: #e74c3c;
  font-size: 28rpx;
}
</style>
