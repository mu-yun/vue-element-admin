export function copy(target, source) {
  for (const key in target) {
    if (key in source) {
      target[key] = source[key]
    }
  }
  return target
}

