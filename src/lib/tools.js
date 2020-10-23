import CONST from 'constant/constant'
import { baseURL } from '../config'
import axios from '../api'
import { method } from 'lodash'
import { reject, resolve } from 'core-js/fn/promise'

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

function prefixRemove (prefix, child, data) {
  let len = prefix.length
  let flag = false
  if (Array.isArray(data)) {
    data.forEach((val, idx, arr) => {
      arr[idx] = val.trim().substring(len)
      if (!flag && val.includes(child)) flag = true
    })
  } else if (typeof data === 'string') {
    data = data.trim().substring(len)
    if (!flag && data.includes(child)) flag = true
  } else {
    throw new Error('第三个参数只接受数组或字符串')
  }
  return {
    hasChild: flag,
    data
  }
}

function suffixRemove (data) {
  let suffixIndex
  if (Array.isArray(data)) {
    data.forEach((val, idx, arr) => {
      suffixIndex = val.lastIndexOf('.')
      if (suffixIndex !== -1) {
        arr[idx] = val.substring(0, suffixIndex)
      }
    })
  } else if (typeof data === 'string') {
    let suffixIndex = data.lastIndexOf('.')
    if (suffixIndex !== -1) {
      data = data.substring(0, suffixIndex)
    }
  }
  return data
}

function addSuffix (data, suffix, extraSuffix = '') {
  let suffixIndex
  if (Array.isArray(data)) {
    data.forEach((val, idx, arr) => {
      suffixIndex = val.lastIndexOf('.')
      if (suffixIndex !== -1) {
        arr[idx] = val.substring(0, suffixIndex) + suffix + extraSuffix
      } else {
        arr[idx] = val + suffix + extraSuffix
      }
    })
  } else if (typeof data === 'string') {
    suffixIndex = data.lastIndexOf('.')
    if (suffixIndex !== -1) {
      data = data.substring(0, suffixIndex) + suffix + extraSuffix
    } else {
      data = data + suffix + extraSuffix
    }
  }
  return data
}

function createJobLabel (context) {
  let jobLabel = context.md5(context.outerDiagram.model.toJson() + Math.random().toString(36).substr(2))
  return 'job-' + jobLabel.substr(0, 8) + '-' + jobLabel.substr(8, 4) + '-' + jobLabel.substr(12, 4) + '-' + jobLabel.substr(16, 4) + '-' + jobLabel.substr(20)
}

function suffixComplete (data, type, extraSuffix = '') {
  let suffix
  let flag = true
  for (let key in CONST.FILL) {
    if (CONST.FILL[key].has(type)) {
      suffix = `.${key.toLowerCase()}`
      flag = false
      return addSuffix(data, suffix, extraSuffix)
    }
  }
  if (flag) return data
}
function shouldCreateNewTag (tagType, jobInfo) {
  let target = jobInfo[tagType]
  if (!target) return false
  for (let i = 0; i < target.length; i++) {
    if (typeof target[i] !== 'number') {
      return true
    }
  }
  return false
}
async function createNewTag (tagType, jobInfo) {
  let target = jobInfo[tagType]
  if (!target) return []
  let targetNameDic = {
    'test_area': 'job_test_area',
    'custom_tag': 'custom_tag'
  }
  for (let i = 0; i < target.length; i++) {
    if (typeof target[i] !== 'number') {
      let { data: { id } } = await axios.request({
        url: `${baseURL}/api/v1/cedar/${targetNameDic[tagType]}/`,
        method: 'post',
        data: tagType === 'test_area' ? { description: target[i] } : { custom_tag_name: target[i] }
      })
      target.splice(i, 1, id)
    }
  }
  return target
}

function cypressGet ({ url, responseType }) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    if (responseType) xhr.responseType = responseType
    xhr.send()
    xhr.onload = () => {
      resolve(xhr)
    }
    xhr.onerror = (err) => {
      reject(err)
    }
  })
}

function cypressTimeout (time = 20) {
  return new Promise((resolve, reject) => {
    setTimeout(reject, time * 1000, 'timeout')
  })
}

export {
  findBrothersComponents,
  findComponentsDownward,
  fileToDataURL,
  dataURLtoFile,
  blobToDataURL,
  suffixRemove,
  addSuffix,
  prefixRemove,
  createJobLabel,
  suffixComplete,
  shouldCreateNewTag,
  createNewTag,
  cypressGet,
  cypressTimeout
}
