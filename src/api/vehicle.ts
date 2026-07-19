import { request } from './index'

export interface Vehicle {
  name: string
  country: string
  type: string
  rank: number
  br: string
  is_premium: boolean
}

export interface Squadron {
  name: string
  tag: string
  members: number
  leader: string
}

export function getVehicle(name: string) {
  return request<Vehicle>(`/vehicle/${encodeURIComponent(name)}`)
}

export function getSquadron(name: string) {
  return request<Squadron>(`/squadron/${name}`)
}

export interface NewsItem {
  url: string
  title: string
  image: string
}

export function getNews(lang: string = 'zh') {
  return request<NewsItem[]>(`/news?lang=${lang}`)
}

export interface ContentBlock {
  type: string
  level?: number
  text?: string
  url?: string
}

export interface NewsDetail {
  title: string
  content: ContentBlock[]
}

export function getNewsDetail(url: string) {
  return request<NewsDetail>(`/news/detail?url=${encodeURIComponent(url)}`)
}
