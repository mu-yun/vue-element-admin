import request from '@/utils/request'

export function listRole(query) {
  return request({
    url: '/role',
    baseURL: '/api',
    method: 'get',
    params: query
  })
}

export function getRoleMenus(id) {
  return request({
    url: `/role/${id}/menus`,
    baseURL: '/api',
    method: 'get'
  })
}

export function getAllRoles() {
  return request({
    url: '/role/all',
    baseURL: 'api',
    method: 'get'
  })
}

export function createRole(data) {
  return request({
    url: '/role',
    baseURL: '/api',
    method: 'post',
    data
  })
}

export function updateRole(data) {
  return request({
    url: `/role/${data.id}`,
    baseURL: '/api',
    method: 'put',
    data
  })
}

export function deleteRole(id) {
  return request({
    url: `/role/${id}`,
    baseURL: '/api',
    method: 'delete'
  })
}
