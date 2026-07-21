import { request, requestV3 } from './index'

export interface Player {
  nick: string
  rank: string
  arcade: ModeStats
  realistic: ModeStats
  simulator: ModeStats
}

export interface ModeStats {
  battles: number
  wins: number
  win_rate: number
  kills: number
  deaths: number
  kd: number
  kills_per_battle: number
}

export function getPlayer(nickname: string) {
  return request<Player>(`/player-ts/${encodeURIComponent(nickname)}`)
}

export interface PlayerDetail {
  nickname: string
  uid: number
  level: number
  level_progress: number
  title: string
  squadron: string
  avatar: string
  ban_status: string
  last_update: string
  register_day: number
  last_online: number
  spaded_total: number
  arcade: DetailMode | null
  realistic: DetailMode | null
  simulator: DetailMode | null
}

export interface DetailMode {
  pvp: DetailPvP | null
}

export interface DetailPvP {
  games: number
  wins: number
  win_rate: number
  air_kills: number
  ground_kills: number
  naval_kills: number
  kills: number
  ai_bot_kills: number
  respawns: number
  kills_per_battle: number
  kd: number
  time_played: number
  fighter_time: number
  bomber_time: number
  tank_time: number
  heavy_tank_time: number
  td_time: number
  spaa_time: number
  ship_time: number
  heli_time: number
}

export function getPlayerDetail(nickname: string) {
  return requestV3<PlayerDetail>(`/player-detail/${encodeURIComponent(nickname)}`)
}
