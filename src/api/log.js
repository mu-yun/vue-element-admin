import request from '@/utils/request'

export function listLog(query) {
  return request({
    url: '/log',
    baseURL: '/api',
    method: 'get',
    params: query
  })
}
