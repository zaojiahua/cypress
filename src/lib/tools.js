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
  } else if (textDom.selectionStart || textDom.selectionStart === '0') {
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

// 由一个组件，找到指定组件的兄弟组件
function findBrothersComponents (context, componentName, exceptMe = true) {
  let res = context.$parent.$children.filter(item => {
    return item.$options.name === componentName
  })
  let index = res.findIndex(item => item._uid === context._uid)
  if (exceptMe) res.splice(index, 1)
  return res
}

// 由一个组件，向下找到所有指定的组件
function findComponentsDownward (context, componentName) {
  return context.$children.reduce((components, child) => {
    if (child.$options.name === componentName) components.push(child)
    const foundChilds = findComponentsDownward(child, componentName)
    return components.concat(foundChilds)
  }, [])
}

// 将文件转换为 DataUrl
function fileToDataURL (file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      resolve(reader.result)
    }
  })
}

// DataUrl 转 File
function dataURLtoFile (dataurl, filename) {
  var arr = dataurl.split(',')
  var mime = arr[0].match(/:(.*?);/)[1]
  var dec = atob(arr[1]) // window atob() 方法用于解码使用 base-64 编码的字符串，base-64 编码使用的是 btoa，该方法使用 "A-Z", "a-z", "0-9", "+", "/" 和 "=" 字符来编码字符串。
  var n = dec.length
  var u8arr = new Uint8Array(n) // 8位无符号整数数组 0~255
  while (n--) {
    u8arr[n] = dec.charCodeAt(n) // charCodeAt() 方法可返回指定位置的字符的 Unicode 编码
  }
  return new File([u8arr], filename, { type: mime })
}

function blobToDataURL (blob) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader()
    reader.readAsDataURL(blob)
    reader.onload = (e) => {
      resolve(e.target.result)
    }
  })
}

function suffixAutoRemove (str) {
  let suffixIndex = str.lastIndexOf('.')
  if (suffixIndex !== -1) {
    return str.substring(0, suffixIndex)
  }
  return str
}

function suffixAutoComplete (str, suffix) {
  let suffixIndex = str.lastIndexOf('.')
  if (suffixIndex !== -1) {
    return str.substring(0, suffixIndex) + suffix
  }
  return str + suffix
}

export { findBrothersComponents, findComponentsDownward, fileToDataURL, dataURLtoFile, blobToDataURL, suffixAutoRemove, suffixAutoComplete }
