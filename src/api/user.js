import request from '@/utils/request'

export function login(loginForm) {
  // submit form data
  const data = new FormData()
  for (const key in loginForm) {
    data.append(key, loginForm[key])
  }
  return request({
    url: '/login',
    method: 'post',
    baseURL: '/api',
    data
  })
}

export function getInfo() {
  return request({
    url: '/user/detail',
    baseURL: '/api',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/logout',
    baseURL: '/api',
    method: 'post'
  })
}

export function listUser(query) {
  return request({
    url: '/user',
    baseURL: '/api',
    method: 'get',
    params: query
  })
}

export function createUser(data) {
  return request({
    url: '/user',
    baseURL: '/api',
    method: 'post',
    data
  })
}

export function updateUser(data) {
  return request({
    url: `/user/${data.id}`,
    baseURL: '/api',
    method: 'put',
    data
  })
}

export function updatePassword(data) {
  return request({
    url: `/user/${data.id}/password`,
    baseURL: '/api',
    method: 'put',
    data
  })
}

export function deleteUser(id) {
  return request({
    url: `/user/${id}`,
    baseURL: '/api',
    method: 'delete'
  })
}

