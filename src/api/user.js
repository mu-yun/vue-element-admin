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
