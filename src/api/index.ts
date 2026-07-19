const BASE_URL = 'https://wt.0x53.cn/api/v1'

export async function request<T>(path: string): Promise<T> {
  const res = await uni.request({
    url: `${BASE_URL}${path}`,
    method: 'GET',
  })
  return res.data as T
}
