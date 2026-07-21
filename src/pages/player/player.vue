<template>
  <view class="container">
    <view class="search-bar">
      <input class="input" v-model="nickname" placeholder="输入玩家昵称 (如 Dark#598)" />
      <button class="btn" @tap="search">查询</button>
    </view>

    <view v-if="player" class="profile">
      <!-- 玩家头部 -->
      <view class="card header-card">
        <text class="nickname">{{ player.nickname }}</text>
        <view class="profile-row">
          <text class="level">Lv.{{ player.level }}</text>
          <text class="level-prog">{{ player.level_progress }}%</text>
        </view>
        <text v-if="player.title" class="title">{{ player.title }}</text>
        <text v-if="player.title_disc" class="title-disc">{{ player.title_disc }}</text>
        <view class="info-row">
          <text v-if="player.squadron" class="tag squadron-tag">{{ player.squadron }}</text>
          <text class="tag spaded-tag">满研 {{ player.spaded_total }}</text>
          <text class="tag" :class="player.ban_status === 'CLEAN' ? 'ok-tag' : 'ban-tag'">{{ player.ban_status }}</text>
        </view>
        <view class="info-row small">
          <text class="dim">注册 {{ formatDate(player.register_day) }}</text>
          <text class="dim">在线 {{ formatDate(player.last_online) }}</text>
          <text class="dim">浏览 {{ player.total_views }}</text>
        </view>
      </view>

      <!-- 评级卡片 -->
      <view v-if="hasRatings" class="card">
        <text class="section-title">评级</text>
        <scroll-view scroll-x class="ratings-scroll">
          <view class="ratings-row">
            <view v-for="(entry, cat) in player.ratings!.total" :key="cat" class="rating-pill" v-if="entry.rating > 0">
              <text class="rating-val">{{ entry.rating.toFixed(0) }}</text>
              <text class="rating-cat">{{ ratingName(cat as string) }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <view v-if="hasRatingsNeo" class="card">
        <text class="section-title">月度评分</text>
        <scroll-view scroll-x class="ratings-scroll">
          <view class="ratings-row">
            <view v-if="player.ratings_neo!.tank_realistic" class="rating-pill neo">
              <text class="rating-val">{{ player.ratings_neo!.tank_realistic.monthly.wt8.toFixed(0) }}</text>
              <text class="rating-cat">真战陆战</text>
              <text v-if="player.ratings_neo!.tank_realistic.monthly.is_suspicious" class="sus">!</text>
            </view>
            <view v-if="player.ratings_neo!.tank_arcade" class="rating-pill neo">
              <text class="rating-val">{{ player.ratings_neo!.tank_arcade.monthly.wt8.toFixed(0) }}</text>
              <text class="rating-cat">街机陆战</text>
            </view>
            <view v-if="player.ratings_neo!.air_realistic" class="rating-pill neo">
              <text class="rating-val">{{ player.ratings_neo!.air_realistic.monthly.wt8.toFixed(0) }}</text>
              <text class="rating-cat">真战空战</text>
            </view>
            <view v-if="player.ratings_neo!.air_arcade" class="rating-pill neo">
              <text class="rating-val">{{ player.ratings_neo!.air_arcade.monthly.wt8.toFixed(0) }}</text>
              <text class="rating-cat">街机空战</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 模式选择 -->
      <view class="mode-tabs">
        <text v-for="m in modes" :key="m.key" class="mode-tab" :class="{ active: activeMode === m.key }" @tap="activeMode = m.key">{{ m.label }}</text>
      </view>

      <!-- PvP 战绩 -->
      <view v-if="currentPvP" class="card">
        <text class="section-title">PvP 战绩</text>
        <view class="stats-grid">
          <view class="stat-box"><text class="sv">{{ currentPvP.games }}</text><text class="sl">场次</text></view>
          <view class="stat-box"><text class="sv">{{ currentPvP.win_rate.toFixed(1) }}%</text><text class="sl">胜率</text></view>
          <view class="stat-box"><text class="sv">{{ currentPvP.kd.toFixed(2) }}</text><text class="sl">K/D</text></view>
          <view class="stat-box"><text class="sv">{{ currentPvP.kills_per_battle.toFixed(2) }}</text><text class="sl">场均击杀</text></view>
          <view class="stat-box"><text class="sv">{{ currentPvP.kills }}</text><text class="sl">总击杀</text></view>
          <view class="stat-box"><text class="sv">{{ currentPvP.wins }}/{{ currentPvP.games - currentPvP.wins }}</text><text class="sl">胜/负</text></view>
          <view class="stat-box"><text class="sv">{{ currentPvP.respawns }}</text><text class="sl">出场</text></view>
          <view class="stat-box"><text class="sv">{{ formatTime(currentPvP.time_played) }}</text><text class="sl">时间</text></view>
        </view>

        <text class="sub">击杀明细</text>
        <view class="kill-grid">
          <view class="kg"><text class="kl">空战</text><text class="kv">{{ currentPvP.air_kills }}</text></view>
          <view class="kg"><text class="kl">地面</text><text class="kv">{{ currentPvP.ground_kills }}</text></view>
          <view class="kg"><text class="kl">海战</text><text class="kv">{{ currentPvP.naval_kills }}</text></view>
          <view class="kg"><text class="kl">AI/Bot</text><text class="kv">{{ currentPvP.ai_bot_kills }}</text></view>
        </view>

        <text class="sub">载具时间</text>
        <view class="vt-grid">
          <view v-for="vt in vehicleTimes" :key="vt.label" class="vt">
            <text class="vtl">{{ vt.label }}</text>
            <text class="vtv">{{ formatHours(vt.time) }}</text>
          </view>
        </view>
      </view>

      <!-- 载具统计 -->
      <view v-if="filteredVehicles.length > 0" class="card">
        <text class="section-title">载具统计 ({{ filteredVehicles.length }})</text>
        <view class="filter-row">
          <text v-for="f in vehicleFilters" :key="f.key" class="filter-tag" :class="{ active: vehFilter === f.key }" @tap="vehFilter = f.key">{{ f.label }}</text>
        </view>
        <view class="veh-list">
          <view v-for="v in filteredVehicles" :key="v.internal_name + v.mode" class="veh-row">
            <view class="veh-left">
              <text class="veh-name">{{ v.name }}</text>
              <text class="veh-meta">{{ countryShort(v.country) }} · {{ v.mode === 'arcade' ? '街机' : '真战' }}</text>
            </view>
            <view class="veh-right">
              <view class="veh-stat"><text class="vs-val">{{ v.battles }}</text><text class="vs-lbl">场</text></view>
              <view class="veh-stat"><text class="vs-val">{{ v.win_rate.toFixed(0) }}%</text><text class="vs-lbl">胜率</text></view>
              <view class="veh-stat"><text class="vs-val">{{ v.ground_kills + v.air_kills }}</text><text class="vs-lbl">击杀</text></view>
              <view class="veh-stat"><text class="vs-val">{{ v.deaths }}</text><text class="vs-lbl">死亡</text></view>
              <view class="veh-stat"><text class="vs-val">{{ formatTime(v.time_played) }}</text><text class="vs-lbl">时间</text></view>
            </view>
            <text v-if="v.spaded" class="spade-icon">✦</text>
          </view>
        </view>
      </view>

      <!-- 满研国家分布 -->
      <view v-if="player.spaded_total > 0" class="card">
        <text class="section-title">满研分布 ({{ player.spaded_total }})</text>
        <view class="spaded-grid">
          <view v-for="(count, country) in player.spaded_by_country" :key="country" class="spaded-item">
            <text class="spaded-name">{{ countryName(country) }}</text>
            <view class="spaded-bar-wrap">
              <view class="spaded-bar" :style="{ width: Math.min(count / maxSpaded * 100, 100) + '%' }"></view>
            </view>
            <text class="spaded-num">{{ count }}</text>
          </view>
        </view>
      </view>

      <!-- 天梯排名 -->
      <view v-if="hasLeaderboard && currentLb" class="card">
        <text class="section-title">天梯排名</text>
        <view class="lb-list">
          <view v-for="(entry, key) in currentLb" :key="key" class="lb-row" v-if="entry.rank > 0">
            <text class="lb-name">{{ lbKeyName(key as string) }}</text>
            <text class="lb-rank">#{{ entry.rank.toLocaleString() }}</text>
          </view>
        </view>
      </view>

      <!-- 称号 -->
      <view v-if="player.titles && player.titles.length > 0" class="card">
        <text class="section-title">称号 ({{ player.titles.length }})</text>
        <view class="tags-wrap">
          <text v-for="t in player.titles" :key="t.name" class="tag-item">{{ t.name }}</text>
        </view>
      </view>

      <!-- 改名/战队历史 -->
      <view v-if="player.name_history && player.name_history.length > 0" class="card">
        <text class="section-title">改名记录</text>
        <view v-for="h in player.name_history" :key="h.date" class="hist-row">
          <text class="hist-val">{{ h.ign }}</text>
          <text class="hist-date">{{ h.date }}</text>
        </view>
      </view>

      <view v-if="player.squadron_history && player.squadron_history.length > 0" class="card">
        <text class="section-title">战队历史</text>
        <view v-for="h in player.squadron_history" :key="h.date" class="hist-row">
          <text class="hist-val">{{ h.clan_tag }}</text>
          <text class="hist-date">{{ h.date }}</text>
        </view>
      </view>
    </view>

    <view v-if="error" class="error"><text>{{ error }}</text></view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getPlayerDetail, type PlayerDetail, type DetailPvP, type LeaderboardEntry, type VehicleEntry } from '@/api/player'

const nickname = ref('')
const player = ref<PlayerDetail | null>(null)
const activeMode = ref('realistic')
const vehFilter = ref('all')
const error = ref('')

const modes = [
  { key: 'arcade', label: '街机' },
  { key: 'realistic', label: '真战' },
  { key: 'simulator', label: '模拟' },
]

const vehicleFilters = [
  { key: 'all', label: '全部' },
  { key: 'tank', label: '坦克' },
  { key: 'heavy_tank', label: '重坦' },
  { key: 'tank_destroyer', label: '歼击车' },
  { key: 'SPAA', label: '防空' },
  { key: 'air', label: '飞机' },
  { key: 'ship', label: '舰船' },
]

const lbModeMap: Record<string, string> = { arcade: 'arcade', realistic: 'historical', simulator: 'simulation' }

const currentPvP = computed<DetailPvP | null>(() => {
  if (!player.value) return null
  const mode = player.value[activeMode.value as keyof PlayerDetail] as any
  return mode?.pvp ?? null
})

const currentLb = computed<Record<string, LeaderboardEntry> | null>(() => {
  if (!player.value?.leaderboard) return null
  return (player.value.leaderboard as any)[lbModeMap[activeMode.value] || 'historical'] ?? null
})

const hasRatings = computed(() => player.value?.ratings?.total && Object.values(player.value.ratings.total).some((e: any) => e.rating > 0))
const hasRatingsNeo = computed(() => {
  const rn = player.value?.ratings_neo
  return rn && (rn.tank_realistic || rn.tank_arcade || rn.air_realistic || rn.air_arcade)
})
const hasLeaderboard = computed(() => {
  const lb = currentLb.value
  return lb && Object.values(lb).some((e: any) => e.rank > 0)
})

const filteredVehicles = computed(() => {
  if (!player.value?.vehicles) return []
  let list = player.value.vehicles
  if (vehFilter.value !== 'all') {
    list = list.filter(v => v.category === vehFilter.value)
  }
  return list.sort((a, b) => b.battles - a.battles)
})

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
    { label: '防空', time: p.spaa_time },
    { label: '鱼雷艇', time: p.torpedo_boat_time },
    { label: '炮艇', time: p.gun_boat_time },
    { label: '驱逐舰', time: p.destroyer_time },
    { label: '巡洋舰', time: p.cruiser_time },
    { label: '舰船', time: p.ship_time },
    { label: '直升机', time: p.heli_time },
  ].filter(v => v.time > 0)
})

const maxSpaded = computed(() => {
  if (!player.value?.spaded_by_country) return 1
  return Math.max(...Object.values(player.value.spaded_by_country), 1)
})

const countryNames: Record<string, string> = {
  country_usa: '美国', country_germany: '德国', country_ussr: '苏联',
  country_britain: '英国', country_japan: '日本', country_china: '中国',
  country_italy: '意大利', country_france: '法国', country_sweden: '瑞典',
}
const countryShortMap: Record<string, string> = {
  country_usa: '美', country_germany: '德', country_ussr: '苏',
  country_britain: '英', country_japan: '日', country_china: '中',
  country_italy: '意', country_france: '法', country_sweden: '瑞',
}

function countryName(c: string) { return countryNames[c] || c }
function countryShort(c: string) { return countryShortMap[c] || c }

function ratingName(c: string) {
  const m: Record<string, string> = { tank_realistic: '真战陆', tank_arcade: '街机陆', air_realistic: '真战空', air_arcade: '街机空', tank_simulation: '模拟陆', air_simulation: '模拟空', helicopter_arcade: '直升机' }
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
    air_death: '空战死亡', air_kills_ai: '空战AI', air_kills_player: '空战玩家',
    ground_kills_ai: '地面AI', ground_kills_player: '地面玩家',
    each_player_victories: '玩家击杀', each_player_session: '场次',
    victories_battles: '胜率', flyouts: '出击', score: '分数',
    deaths: '死亡', air_kills: '空战击杀', ground_kills: '地面击杀',
  }
  const isRecent = k.startsWith('recent_')
  const base = isRecent ? k.slice(7) : k
  const name = m[base] || base
  return isRecent ? name + '(近)' : name
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
.container { padding: 24rpx; min-height: 100vh; background: #0f1923; color: #e0e0e0; }
.search-bar { display: flex; gap: 16rpx; margin-bottom: 30rpx; }
.input { flex: 1; height: 76rpx; background: rgba(255,255,255,0.08); border-radius: 12rpx; padding: 0 24rpx; color: #fff; font-size: 28rpx; }
.btn { width: 130rpx; height: 76rpx; line-height: 76rpx; background: #c0392b; color: #fff; border-radius: 12rpx; text-align: center; font-size: 28rpx; font-weight: bold; }
.card { background: rgba(255,255,255,0.05); border-radius: 16rpx; padding: 24rpx; margin-bottom: 20rpx; }
.header-card { text-align: center; }
.nickname { font-size: 42rpx; font-weight: bold; color: #fff; display: block; margin-bottom: 8rpx; }
.profile-row { display: flex; justify-content: center; gap: 12rpx; margin: 6rpx 0; }
.level { color: #f1c40f; font-size: 28rpx; font-weight: bold; }
.level-prog { color: #f39c12; font-size: 24rpx; }
.title { color: #3498db; font-size: 26rpx; display: block; margin: 4rpx 0; }
.title-disc { color: #666; font-size: 22rpx; display: block; }
.info-row { display: flex; justify-content: center; gap: 12rpx; margin-top: 12rpx; flex-wrap: wrap; }
.tag { padding: 4rpx 16rpx; border-radius: 20rpx; font-size: 22rpx; }
.squadron-tag { background: rgba(231,76,60,0.2); color: #e74c3c; }
.spaded-tag { background: rgba(46,204,113,0.2); color: #2ecc71; }
.ok-tag { background: rgba(46,204,113,0.15); color: #2ecc71; }
.ban-tag { background: rgba(231,76,60,0.3); color: #e74c3c; }
.info-row.small { margin-top: 8rpx; }
.dim { color: #666; font-size: 20rpx; margin: 0 8rpx; }
.section-title { display: block; font-size: 28rpx; font-weight: bold; color: #fff; margin-bottom: 16rpx; }
.sub { display: block; font-size: 24rpx; font-weight: bold; color: #aaa; margin: 20rpx 0 10rpx; }
.ratings-scroll { white-space: nowrap; }
.ratings-row { display: flex; gap: 12rpx; }
.rating-pill { background: rgba(241,196,15,0.12); border-radius: 12rpx; padding: 10rpx 20rpx; text-align: center; min-width: 100rpx; flex-shrink: 0; }
.rating-pill.neo { background: rgba(52,152,219,0.12); }
.rating-val { display: block; font-size: 32rpx; font-weight: bold; color: #f1c40f; }
.rating-pill.neo .rating-val { color: #3498db; }
.rating-cat { display: block; font-size: 18rpx; color: #888; margin-top: 2rpx; }
.sus { color: #e74c3c; font-size: 20rpx; font-weight: bold; }
.mode-tabs { display: flex; gap: 8rpx; margin: 16rpx 0; justify-content: center; }
.mode-tab { padding: 8rpx 28rpx; background: rgba(255,255,255,0.06); border-radius: 24rpx; font-size: 24rpx; color: #aaa; }
.mode-tab.active { background: #c0392b; color: #fff; }
.stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12rpx; }
.stat-box { text-align: center; }
.sv { display: block; font-size: 32rpx; font-weight: bold; color: #e74c3c; }
.sl { display: block; font-size: 20rpx; color: #888; margin-top: 2rpx; }
.kill-grid { display: flex; gap: 16rpx; justify-content: space-around; }
.kg { text-align: center; }
.kl { display: block; font-size: 20rpx; color: #888; }
.kv { display: block; font-size: 28rpx; font-weight: bold; color: #e0e0e0; }
.vt-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8rpx; }
.vt { text-align: center; }
.vtl { display: block; font-size: 18rpx; color: #777; }
.vtv { display: block; font-size: 24rpx; font-weight: bold; color: #e74c3c; }
.filter-row { display: flex; gap: 8rpx; margin-bottom: 16rpx; flex-wrap: wrap; }
.filter-tag { padding: 6rpx 16rpx; background: rgba(255,255,255,0.06); border-radius: 20rpx; font-size: 22rpx; color: #aaa; }
.filter-tag.active { background: #c0392b; color: #fff; }
.veh-list { display: flex; flex-direction: column; gap: 8rpx; }
.veh-row { display: flex; align-items: center; padding: 12rpx 16rpx; background: rgba(255,255,255,0.03); border-radius: 10rpx; position: relative; }
.veh-left { flex: 1; min-width: 0; }
.veh-name { display: block; font-size: 24rpx; color: #e0e0e0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.veh-meta { display: block; font-size: 18rpx; color: #666; }
.veh-right { display: flex; gap: 12rpx; flex-shrink: 0; }
.veh-stat { text-align: center; min-width: 60rpx; }
.vs-val { display: block; font-size: 22rpx; font-weight: bold; color: #ccc; }
.vs-lbl { display: block; font-size: 16rpx; color: #666; }
.spade-icon { position: absolute; right: 8rpx; top: 8rpx; color: #2ecc71; font-size: 20rpx; }
.spaded-grid { display: flex; flex-direction: column; gap: 10rpx; }
.spaded-item { display: flex; align-items: center; gap: 12rpx; }
.spaded-name { font-size: 22rpx; color: #aaa; width: 80rpx; }
.spaded-bar-wrap { flex: 1; height: 16rpx; background: rgba(255,255,255,0.05); border-radius: 8rpx; overflow: hidden; }
.spaded-bar { height: 100%; background: #2ecc71; border-radius: 8rpx; }
.spaded-num { font-size: 24rpx; font-weight: bold; color: #2ecc71; width: 60rpx; text-align: right; }
.lb-list { display: flex; flex-direction: column; gap: 8rpx; }
.lb-row { display: flex; justify-content: space-between; padding: 8rpx 0; border-bottom: 1rpx solid rgba(255,255,255,0.04); }
.lb-name { font-size: 24rpx; color: #aaa; }
.lb-rank { font-size: 24rpx; font-weight: bold; color: #3498db; }
.tags-wrap { display: flex; flex-wrap: wrap; gap: 8rpx; }
.tag-item { background: rgba(255,255,255,0.06); border-radius: 16rpx; padding: 6rpx 16rpx; font-size: 22rpx; color: #bbb; }
.hist-row { display: flex; justify-content: space-between; padding: 8rpx 0; border-bottom: 1rpx solid rgba(255,255,255,0.04); }
.hist-val { font-size: 24rpx; color: #e0e0e0; }
.hist-date { font-size: 20rpx; color: #666; }
.error { text-align: center; margin-top: 60rpx; color: #e74c3c; font-size: 28rpx; }
</style>
