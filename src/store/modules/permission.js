import { constantRoutes } from '@/router'
/* Layout */
import Layout from '@/layout'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const generateVueRoute = (route) => {
  const component = route.type === 0 ? Layout : (resolve) => require([`@/views/${route.componentPath}`], resolve)
  const vueRoute = {
    path: route.path,
    component: component,
    name: route.componentName,
    meta: {
      title: route.name,
      icon: route.icon,
      authority: route.authority
    }
  }
  if (route.children) {
    vueRoute.children = route.children.map(r => generateVueRoute(r))
    vueRoute.redirect = route.path + '/' + route.children[0].path
    vueRoute.alwaysShow = true
  }
  return vueRoute
}

const actions = {
  generateRoutes({ commit }, routes) {
    return new Promise(resolve => {
      const accessedRoutes = routes.map(route => generateVueRoute(route))
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
