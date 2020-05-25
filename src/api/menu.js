import request from '@/utils/request'

export function listMenu(id) {
  return request({
    url: id ? `/menu/${id}/menu` : '/menu',
    baseURL: '/api',
    method: 'get'
  })
}

export function createMenu(data) {
  return request({
    url: '/menu',
    baseURL: '/api',
    method: 'post',
    data
  })
}

export function updateMenu(id, data) {
  return request({
    url: `/menu/${id}`,
    baseURL: '/api',
    method: 'put',
    data
  })
}

export function deleteMenu(id) {
  return request({
    url: `/menu/${id}`,
    baseURL: '/api',
    method: 'delete'
  })
}
