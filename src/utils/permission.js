import store from '@/store'

/**
 * @param {Array} value
 * @returns {Boolean}
 * @example see @/views/permission/directive.vue
 */
// export default function checkPermission(value) {
//   if (value && value instanceof Array && value.length > 0) {
//     const roles = store.getters && store.getters.roles
//     const permissionRoles = value

//     const hasPermission = roles.some(role => {
//       return permissionRoles.includes(role)
//     })

//     if (!hasPermission) {
//       return false
//     }
//     return true
//   } else {
//     console.error(`need roles! Like v-permission="['admin','editor']"`)
//     return false
//   }
// }

export default function checkPermission(value) {
  const authorities = store.getters && store.getters.authorities

  if (value && value.length > 0) {
    if (value instanceof Array) {
      const permissions = value
      return permissions.some(permission => {
        return authorities.includes(permission)
      })
    } else if (typeof value === 'string') {
      return authorities.includes(value)
    }
  }
  throw new Error(`need authroties! Like checkPermission(['admin','editor']) or checkPermission('admin')`)
}
