export function isJsonString (str) {
  try {
    if (Object.prototype.toString.call(JSON.parse(str)) === '[object Object]') {
      return true
    }
  } catch (e) {
  }
  return false
}

export function toDecimal (x) {
  /*
  * 将浮点数四舍五入，取小数点后2位
  * */
  let f = parseFloat(x)
  if (isNaN(f)) {
    return
  }
  f = Math.round(x * 100) / 100
  return f
}
