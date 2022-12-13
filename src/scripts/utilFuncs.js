export function minMaxExecute(array, handler) {
  const min = Math.min(...array)
  const max = Math.max(...array)
  return handler(min, max)
}
