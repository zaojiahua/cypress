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

export function insertAfterCursor (textDom, value) {
  var selectRange
  if (document.selection) {
    // IE Support
    textDom.focus()
    selectRange = document.selection.createRange()
    selectRange.text = value
    textDom.focus()
  } else if (textDom.selectionStart || textDom.selectionStart == '0') {
    // Firefox support
    var startPos = textDom.selectionStart
    var endPos = textDom.selectionEnd
    var scrollTop = textDom.scrollTop
    textDom.value = textDom.value.substring(0, startPos) + value + textDom.value.substring(endPos, textDom.value.length)
    textDom.focus()
    textDom.selectionStart = startPos + value.length
    textDom.selectionEnd = startPos + value.length
    textDom.scrollTop = scrollTop
  } else {
    textDom.value += value
    textDom.focus()
  }
}
