import store from '@/store'

// function checkPermission(el, binding) {
//   const { value } = binding
//   const roles = store.getters && store.getters.roles

//   if (value && value instanceof Array) {
//     if (value.length > 0) {
//       const permissionRoles = value

//       const hasPermission = roles.some(role => {
//         return permissionRoles.includes(role)
//       })

//       if (!hasPermission) {
//         el.parentNode && el.parentNode.removeChild(el)
//       }
//     }
//   } else {
//     throw new Error(`need roles! Like v-permission="['admin','editor']"`)
//   }
// }

function checkPermission(el, binding) {
  const { value } = binding
  const authorities = store.getters && store.getters.authorities
  let hasPermission = null
  if (value && value.length > 0) {
    if (value instanceof Array) {
      const permissions = value
      hasPermission = permissions.some(permission => {
        return authorities.includes(permission)
      })
    } else if (typeof value === 'string') {
      hasPermission = authorities.includes(value)
    }
  }
  if (hasPermission === null) {
    throw new Error(`need authroties! Like v-permission="['admin','editor']" or v-permission="'admin'" `)
  } else if (!hasPermission) {
    el.parentNode && el.parentNode.removeChild(el)
  }
}

export default {
  inserted(el, binding) {
    checkPermission(el, binding)
  },
  update(el, binding) {
    checkPermission(el, binding)
  }
}
