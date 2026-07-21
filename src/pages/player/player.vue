<template>
  <view class="container">
    <view class="search-bar">
      <input class="input" v-model="nickname" placeholder="输入玩家昵称 (如 Dark#598)" />
      <button class="btn" @tap="search">查询</button>
    </view>

    <view v-if="player" class="profile">
      <!-- 基本信息 -->
      <view class="card">
        <text class="nickname">{{ player.nickname }}</text>
        <view class="profile-row">
          <text class="level">Lv.{{ player.level }} ({{ player.level_progress }}%)</text>
        </view>
        <view v-if="player.title" class="profile-row">
          <text class="title">{{ player.title }}</text>
        </view>
        <view v-if="player.title_disc" class="profile-row">
          <text class="title-disc">{{ player.title_disc }}</text>
        </view>
        <view class="info-grid">
          <view class="info-item" v-if="player.squadron">
            <text class="info-label">战队</text>
            <text class="info-value accent">{{ player.squadron }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">满研</text>
            <text class="info-value green">{{ player.spaded_total }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">注册时间</text>
            <text class="info-value">{{ formatDate(player.register_day) }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">最近在线</text>
            <text class="info-value">{{ formatDate(player.last_online) }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">访问量</text>
            <text class="info-value">{{ player.total_views }} (近期{{ player.recent_views }})</text>
          </view>
          <view class="info-item">
            <text class="info-label">封禁状态</text>
            <text class="info-value" :class="player.ban_status === 'CLEAN' ? 'green' : 'red'">{{ player.ban_status }}</text>
          </view>
        </view>
      </view>

      <!-- 模式选择 -->
      <view class="mode-tabs">
        <text v-for="mode in modes" :key="mode.key" class="mode-tab" :class="{ active: activeMode === mode.key }" @tap="activeMode = mode.key">{{ mode.label }}</text>
      </view>

      <!-- PvP 战绩 -->
      <view v-if="currentPvP" class="card">
        <text class="section-title">PvP 战绩</text>
        <view class="stats-grid">
          <view class="stat-item">
            <text class="stat-value">{{ currentPvP.games }}</text>
            <text class="stat-label">场次</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ currentPvP.win_rate.toFixed(1) }}%</text>
            <text class="stat-label">胜率</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ currentPvP.kd.toFixed(2) }}</text>
            <text class="stat-label">K/D</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ currentPvP.kills_per_battle.toFixed(2) }}</text>
            <text class="stat-label">场均击杀</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ currentPvP.kills }}</text>
            <text class="stat-label">总击杀</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ currentPvP.wins }}</text>
            <text class="stat-label">胜场</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ currentPvP.respawns }}</text>
            <text class="stat-label">出场</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ formatTime(currentPvP.time_played) }}</text>
            <text class="stat-label">游玩时间</text>
          </view>
        </view>

        <!-- 击杀明细 -->
        <text class="section-subtitle">击杀明细</text>
        <view class="kill-grid">
          <view class="kill-item">
            <text class="kill-label">空战玩家</text>
            <text class="kill-val">{{ currentPvP.air_kills }}</text>
          </view>
          <view class="kill-item">
            <text class="kill-label">地面玩家</text>
            <text class="kill-val">{{ currentPvP.ground_kills }}</text>
          </view>
          <view class="kill-item">
            <text class="kill-label">海战玩家</text>
            <text class="kill-val">{{ currentPvP.naval_kills }}</text>
          </view>
          <view class="kill-item">
            <text class="kill-label">AI/Bot</text>
            <text class="kill-val">{{ currentPvP.ai_bot_kills }}</text>
          </view>
        </view>

        <!-- 载具时间 -->
        <text class="section-subtitle">载具时间</text>
        <view class="vt-grid">
          <view v-for="vt in vehicleTimes" :key="vt.label" class="vt-item">
            <text class="vt-label">{{ vt.label }}</text>
            <text class="vt-val">{{ formatHours(vt.time) }}</text>
          </view>
        </view>
      </view>

      <!-- 遭遇战 -->
      <view v-if="currentSkirmish" class="card">
        <text class="section-title">遭遇战</text>
        <view class="stats-grid">
          <view class="stat-item">
            <text class="stat-value">{{ currentSkirmish.games }}</text>
            <text class="stat-label">场次</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ currentSkirmish.wins }}</text>
            <text class="stat-label">胜场</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ currentSkirmish.air_kills + currentSkirmish.ground_kills + currentSkirmish.naval_kills }}</text>
            <text class="stat-label">击杀</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ formatTime(currentSkirmish.time_played) }}</text>
            <text class="stat-label">时间</text>
          </view>
        </view>
      </view>

      <!-- 满研车辆 -->
      <view v-if="player.spaded_total > 0" class="card">
        <text class="section-title">满研车辆 ({{ player.spaded_total }})</text>
        <view class="spaded-grid">
          <view v-for="(count, country) in player.spaded_by_country" :key="country" class="spaded-item">
            <text class="spaded-country">{{ countryName(country) }}</text>
            <text class="spaded-count">{{ count }}</text>
          </view>
        </view>
      </view>

      <!-- 评级 -->
      <view v-if="hasRatings" class="card">
        <text class="section-title">评级</text>
        <view class="ratings-grid">
          <view v-for="(entry, cat) in player.ratings!.total" :key="cat" class="rating-item">
            <text class="rating-cat">{{ ratingName(cat as string) }}</text>
            <text class="rating-val">{{ entry.rating.toFixed(1) }}</text>
          </view>
        </view>
      </view>

      <!-- 月度评级 Neo -->
      <view v-if="hasRatingsNeo" class="card">
        <text class="section-title">月度评级</text>
        <view class="ratings-grid">
          <view v-if="player.ratings_neo!.tank_realistic" class="rating-item">
            <text class="rating-cat">真战陆战</text>
            <text class="rating-val">{{ player.ratings_neo!.tank_realistic.monthly.wt8.toFixed(0) }}</text>
            <text v-if="player.ratings_neo!.tank_realistic.monthly.is_suspicious" class="warning">可疑</text>
          </view>
          <view v-if="player.ratings_neo!.tank_arcade" class="rating-item">
            <text class="rating-cat">街机陆战</text>
            <text class="rating-val">{{ player.ratings_neo!.tank_arcade.monthly.wt8.toFixed(0) }}</text>
          </view>
          <view v-if="player.ratings_neo!.air_realistic" class="rating-item">
            <text class="rating-cat">真战空战</text>
            <text class="rating-val">{{ player.ratings_neo!.air_realistic.monthly.wt8.toFixed(0) }}</text>
          </view>
          <view v-if="player.ratings_neo!.air_arcade" class="rating-item">
            <text class="rating-cat">街机空战</text>
            <text class="rating-val">{{ player.ratings_neo!.air_arcade.monthly.wt8.toFixed(0) }}</text>
          </view>
        </view>
      </view>

      <!-- 天梯排名 -->
      <view v-if="hasLeaderboard && currentLb" class="card">
        <text class="section-title">天梯排名</text>
        <view class="lb-grid">
          <view v-for="(entry, key) in currentLb" :key="key" class="lb-item" v-if="entry.rank > 0">
            <text class="lb-key">{{ lbKeyName(key as string) }}</text>
            <text class="lb-val">{{ formatNumber(entry.value) }}</text>
            <text class="lb-rank">#{{ formatNumber(entry.rank) }}</text>
          </view>
        </view>
      </view>

      <!-- 称号 -->
      <view v-if="player.titles && player.titles.length > 0" class="card">
        <text class="section-title">称号 ({{ player.titles.length }})</text>
        <view class="titles-wrap">
          <text v-for="t in player.titles" :key="t.name" class="title-tag">{{ t.name }}</text>
        </view>
      </view>

      <!-- 改名记录 -->
      <view v-if="player.name_history && player.name_history.length > 0" class="card">
        <text class="section-title">改名记录</text>
        <view v-for="h in player.name_history" :key="h.date" class="history-row">
          <text class="history-val">{{ h.ign }}</text>
          <text class="history-date">{{ h.date }}</text>
        </view>
      </view>

      <!-- 战队历史 -->
      <view v-if="player.squadron_history && player.squadron_history.length > 0" class="card">
        <text class="section-title">战队历史</text>
        <view v-for="h in player.squadron_history" :key="h.date" class="history-row">
          <text class="history-val">{{ h.clan_tag }}</text>
          <text class="history-date">{{ h.date }}</text>
        </view>
      </view>

      <!-- 互动 -->
      <view v-if="player.user_info" class="card">
        <text class="section-title">互动</text>
        <view class="info-grid">
          <view class="info-item">
            <text class="info-label">赞</text>
            <text class="info-value green">{{ player.user_info.likes }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">踩</text>
            <text class="info-value red">{{ player.user_info.dislikes }}</text>
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
import { getPlayerDetail, type PlayerDetail, type DetailPvP, type DetailSkirmish, type LeaderboardEntry } from '@/api/player'

const nickname = ref('')
const player = ref<PlayerDetail | null>(null)
const activeMode = ref('realistic')
const error = ref('')
const lbModeKey = ref('historical')

const modes = [
  { key: 'arcade', label: '街机' },
  { key: 'realistic', label: '真战' },
  { key: 'simulator', label: '模拟' },
]

const lbModeMap: Record<string, string> = {
  arcade: 'arcade',
  realistic: 'historical',
  simulator: 'simulation',
}

const currentPvP = computed<DetailPvP | null>(() => {
  if (!player.value) return null
  const mode = player.value[activeMode.value as keyof PlayerDetail] as { pvp: DetailPvP | null } | null
  return mode?.pvp ?? null
})

const currentSkirmish = computed<DetailSkirmish | null>(() => {
  if (!player.value) return null
  const mode = player.value[activeMode.value as keyof PlayerDetail] as { skirmish: DetailSkirmish | null } | null
  return mode?.skirmish ?? null
})

const currentLb = computed<Record<string, LeaderboardEntry> | null>(() => {
  if (!player.value?.leaderboard) return null
  const key = lbModeMap[activeMode.value] || 'historical'
  return (player.value.leaderboard as any)[key] ?? null
})

const hasRatings = computed(() => player.value?.ratings?.total && Object.keys(player.value.ratings.total).length > 0)
const hasRatingsNeo = computed(() => {
  const rn = player.value?.ratings_neo
  return rn && (rn.tank_realistic || rn.tank_arcade || rn.air_realistic || rn.air_arcade)
})
const hasLeaderboard = computed(() => player.value?.leaderboard != null)

const vehicleTimes = computed(() => {
  if (!currentPvP.value) return []
  const p = currentPvP.value
  return [
    { label: '战斗机', time: p.fighter_time },
    { label: '轰炸机', time: p.bomber_time },
    { label: '突击', time: p.assault_time },
    { label: '坦克', time: p.tank_time },
    { label: '重坦', time: p.heavy_tank_time },
    { label: '歼击车', time: p.td_time },
    { label: '防空车', time: p.spaa_time },
    { label: '鱼雷艇', time: p.torpedo_boat_time },
    { label: '炮艇', time: p.gun_boat_time },
    { label: '驱逐舰', time: p.destroyer_time },
    { label: '巡洋舰', time: p.cruiser_time },
    { label: '舰船', time: p.ship_time },
    { label: '直升机', time: p.heli_time },
  ].filter(v => v.time > 0)
})

const countryNames: Record<string, string> = {
  country_usa: '美国', country_germany: '德国', country_ussr: '苏联',
  country_britain: '英国', country_japan: '日本', country_china: '中国',
  country_italy: '意大利', country_france: '法国', country_sweden: '瑞典',
}

function countryName(c: string) { return countryNames[c] || c }
function ratingName(c: string) {
  const m: Record<string, string> = { tank_realistic: '真战陆战', tank_arcade: '街机陆战', air_realistic: '真战空战', air_arcade: '街机空战', tank_simulation: '模拟陆战', air_simulation: '模拟空战' }
  return m[c] || c
}
function lbKeyName(k: string) {
  const m: Record<string, string> = {
    each_player_victories: '玩家击杀', each_player_session: '场次',
    victories_battles: '胜率', flyouts: '出击', score: '分数',
    deaths: '死亡', air_kills: '空战击杀', ground_kills: '地面击杀',
    naval_kills: '海战击杀', pvp_ratio: 'PvP比率',
    relativePosition: '相对位置', averageRelativePosition: '平均位置',
    averageScore: '平均分数', finalSessionCounter: '最终场次',
    air_death: '空战死亡', air_kills_ai: '空战AI击杀', air_kills_player: '空战玩家击杀',
  }
  const isRecent = k.startsWith('recent_')
  const base = isRecent ? k.slice(7) : k
  const name = m[base] || base
  return isRecent ? name + '(近期)' : name
}

function formatTime(sec: number): string {
  const h = Math.floor(sec / 3600)
  if (h >= 24) return Math.floor(h / 24) + '天' + (h % 24) + 'h'
  return h + 'h'
}
function formatHours(sec: number) { return (sec / 3600).toFixed(0) + 'h' }
function formatDate(ts: number): string {
  if (!ts) return ''
  const d = new Date(ts * 1000)
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}
function formatNumber(n: number) {
  if (n >= 10000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
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
.container { padding: 30rpx; min-height: 100vh; background: #1a1a2e; color: #fff; }
.search-bar { display: flex; gap: 20rpx; margin-bottom: 40rpx; }
.input { flex: 1; height: 80rpx; background: rgba(255,255,255,0.1); border-radius: 16rpx; padding: 0 30rpx; color: #fff; }
.btn { width: 140rpx; height: 80rpx; line-height: 80rpx; background: #e74c3c; color: #fff; border-radius: 16rpx; text-align: center; }
.card { background: rgba(255,255,255,0.06); border-radius: 16rpx; padding: 28rpx; margin-bottom: 24rpx; }
.nickname { font-size: 40rpx; font-weight: bold; display: block; text-align: center; margin-bottom: 10rpx; }
.profile-row { margin: 6rpx 0; display: flex; justify-content: center; gap: 20rpx; }
.level { color: #f1c40f; font-size: 28rpx; }
.title { color: #3498db; font-size: 28rpx; }
.title-disc { color: #888; font-size: 22rpx; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16rpx; margin-top: 20rpx; }
.info-item { display: flex; flex-direction: column; gap: 4rpx; }
.info-label { font-size: 22rpx; color: #888; }
.info-value { font-size: 26rpx; color: #ddd; }
.accent { color: #e67e22; }
.green { color: #2ecc71; }
.red { color: #e74c3c; }
.warning { color: #e74c3c; font-size: 22rpx; }
.section-title { display: block; font-size: 30rpx; font-weight: bold; margin-bottom: 16rpx; }
.section-subtitle { display: block; font-size: 26rpx; font-weight: bold; margin: 24rpx 0 12rpx; color: #ccc; }
.mode-tabs { display: flex; gap: 10rpx; margin: 20rpx 0; justify-content: center; }
.mode-tab { padding: 10rpx 30rpx; background: rgba(255,255,255,0.08); border-radius: 30rpx; font-size: 26rpx; }
.mode-tab.active { background: #e74c3c; color: #fff; }
.stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16rpx; }
.stat-item { text-align: center; }
.stat-value { display: block; font-size: 34rpx; font-weight: bold; color: #e74c3c; }
.stat-label { display: block; font-size: 22rpx; color: #999; margin-top: 4rpx; }
.kill-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12rpx; }
.kill-item { text-align: center; }
.kill-label { display: block; font-size: 22rpx; color: #888; }
.kill-val { display: block; font-size: 28rpx; font-weight: bold; color: #fff; }
.vt-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12rpx; }
.vt-item { text-align: center; }
.vt-label { display: block; font-size: 20rpx; color: #888; }
.vt-val { display: block; font-size: 26rpx; font-weight: bold; color: #e74c3c; }
.spaded-grid { display: flex; flex-wrap: wrap; gap: 16rpx; }
.spaded-item { background: rgba(255,255,255,0.06); border-radius: 12rpx; padding: 12rpx 20rpx; display: flex; gap: 10rpx; align-items: center; }
.spaded-country { font-size: 24rpx; color: #ccc; }
.spaded-count { font-size: 28rpx; font-weight: bold; color: #2ecc71; }
.ratings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16rpx; }
.rating-item { display: flex; flex-direction: column; gap: 4rpx; }
.rating-cat { font-size: 22rpx; color: #888; }
.rating-val { font-size: 32rpx; font-weight: bold; color: #f1c40f; }
.lb-grid { display: flex; flex-direction: column; gap: 12rpx; }
.lb-item { display: flex; align-items: center; gap: 16rpx; }
.lb-key { font-size: 24rpx; color: #999; flex: 1; }
.lb-val { font-size: 26rpx; font-weight: bold; color: #fff; }
.lb-rank { font-size: 24rpx; color: #3498db; min-width: 120rpx; text-align: right; }
.titles-wrap { display: flex; flex-wrap: wrap; gap: 12rpx; }
.title-tag { background: rgba(255,255,255,0.08); border-radius: 20rpx; padding: 8rpx 20rpx; font-size: 24rpx; color: #ccc; }
.history-row { display: flex; justify-content: space-between; padding: 8rpx 0; border-bottom: 1rpx solid rgba(255,255,255,0.05); }
.history-val { font-size: 26rpx; color: #fff; }
.history-date { font-size: 22rpx; color: #888; }
.error { text-align: center; margin-top: 60rpx; color: #e74c3c; font-size: 28rpx; }
</style>
