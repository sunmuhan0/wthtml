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
  title_disc: string
  squadron: string
  squadron_id: number
  avatar: string
  ban_status: string
  total_views: number
  recent_views: number
  last_update: string
  register_day: number
  last_online: number
  spaded_total: number
  spaded_by_country: Record<string, number>
  vehicles: VehicleEntry[]
  arcade: DetailMode | null
  realistic: DetailMode | null
  simulator: DetailMode | null
  leaderboard: LeaderboardData | null
  ratings: Ratings | null
  ratings_neo: RatingsNeo | null
  name_history: NameHistoryEntry[]
  squadron_history: SquadronHistoryEntry[]
  titles: TitleEntry[]
  user_info: UserInfo | null
}

export interface DetailMode {
  pvp: DetailPvP | null
  skirmish: DetailSkirmish | null
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
  assault_time: number
  tank_time: number
  heavy_tank_time: number
  td_time: number
  spaa_time: number
  ship_time: number
  torpedo_boat_time: number
  gun_boat_time: number
  destroyer_time: number
  cruiser_time: number
  heli_time: number
  human_time: number
}

export interface DetailSkirmish {
  games: number
  wins: number
  air_kills: number
  ground_kills: number
  naval_kills: number
  respawns: number
  time_played: number
}

export interface LeaderboardEntry {
  value: number
  rank: number
}

export type LeaderboardCategory = Record<string, LeaderboardEntry>

export interface LeaderboardData {
  air_arcade: LeaderboardCategory
  air_realistic: LeaderboardCategory
  air_simulation: LeaderboardCategory
  arcade: LeaderboardCategory
  helicopter_arcade: LeaderboardCategory
  historical: LeaderboardCategory
  simulation: LeaderboardCategory
  tank_arcade: LeaderboardCategory
  tank_realistic: LeaderboardCategory
  tank_simulation: LeaderboardCategory
}

export interface RatingsEntry {
  rating: number
}

export interface Ratings {
  total: Record<string, RatingsEntry>
}

export interface RatingsNeoEntry {
  monthly: {
    wt8: number
    original_wt8: number
    is_suspicious: boolean
    contributions: {
      kills: number
      position: number
      win: number
      score: number
    }
  }
}

export interface RatingsNeo {
  tank_realistic: RatingsNeoEntry | null
  tank_arcade: RatingsNeoEntry | null
  air_realistic: RatingsNeoEntry | null
  air_arcade: RatingsNeoEntry | null
}

export interface NameHistoryEntry {
  ign: string
  date: string
}

export interface SquadronHistoryEntry {
  clan_id: number
  clan_tag: string
  date: string
}

export interface TitleEntry {
  name: string
  lang: string
  disc: string
}

export interface VehicleEntry {
  mode: string
  country: string
  name: string
  battles: number
  win_rate: number
  ground_kills: number
  air_kills: number
  deaths: number
  time_played: number
  rp: number
  spaded: boolean
  category: string
  internal_name: string
}

export interface UserInfo {
  likes: number
  dislikes: number
  comment_count: number
}

export function getPlayerDetail(nickname: string) {
  return requestV3<PlayerDetail>(`/player-detail/${encodeURIComponent(nickname)}`)
}
