import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'

const state = {
  token: getToken(),
  username: '',
  name: '',
  phoneNumber: '',
  avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
  introduction: '',
  roles: [],
  authorities: []
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_PHONE_NUMBER: (state, phoneNumber) => {
    state.phoneNumber = phoneNumber
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_USER_INFO: (state, userInfo) => {
    const { username, name, phoneNumber, authorities, roles } = userInfo
    state.username = username
    state.name = name
    state.phoneNumber = phoneNumber
    state.authorities = authorities
    state.roles = roles
    // state.avatar = avatar
    // state.introduction = introduction
  },
  CLEAR_USER_INFO: (state) => {
    state.username = ''
    state.name = ''
    state.phoneNumber = ''
    state.authorities = []
    state.roles = []
  }

}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response

        commit('SET_TOKEN', data)
        setToken(data)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit }) {
    return new Promise((resolve, reject) => {
      getInfo().then(response => {
        const { data } = response

        if (!data) {
          reject('Verification failed, please Login again.')
        }

        commit('SET_USER_INFO', data)

        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ state, commit, dispatch }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken()
        resetRouter()

        commit('CLEAR_USER_INFO')

        // reset visited views and cached views
        // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
        dispatch('tagsView/delAllViews', null, { root: true })

        dispatch('permission/deleteRoutes', null, { root: true })

        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit, dispatch }) {
    return new Promise(resolve => {
      removeToken()

      commit('CLEAR_USER_INFO')

      // reset visited views and cached views
      // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
      dispatch('tagsView/delAllViews', null, { root: true })

      dispatch('permission/deleteRoutes', null, { root: true })

      resolve()
    })
  },

  // dynamically modify permissions
  changeRoles({ commit, dispatch }, role) {
    return new Promise(async resolve => {
      const token = role + '-token'

      commit('SET_TOKEN', token)
      setToken(token)

      const { roles } = await dispatch('getInfo')

      resetRouter()

      // generate accessible routes map based on roles
      const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })

      // dynamically add accessible routes
      router.addRoutes(accessRoutes)

      // reset visited views and cached views
      dispatch('tagsView/delAllViews', null, { root: true })

      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
