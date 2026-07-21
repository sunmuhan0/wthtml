const BASE_URL = 'https://wt.0x53.cn/api/v1'
const BASE_URL_V3 = 'https://wt.0x53.cn/api/v3'

export async function request<T>(path: string): Promise<T> {
  const res = await uni.request({
    url: `${BASE_URL}${path}`,
    method: 'GET',
  })
  return res.data as T
}

export async function requestV3<T>(path: string): Promise<T> {
  const res = await uni.request({
    url: `${BASE_URL_V3}${path}`,
    method: 'GET',
  })
  return res.data as T
}
