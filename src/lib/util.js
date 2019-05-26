export default {
  validate (serializer, data) {
    // 广度优先遍历
    if (Object.prototype.toString.call(serializer) === '[object Object]') {
      return this._process_obj(serializer, data)
    } else if (Object.prototype.toString.call(serializer) === '[object Array]') {
      return this._check_array(serializer[0], data)
    } else {
      throw TypeError('serializer must be object or array!')
    }
  },
  _process_obj (schema, obj) {
    if (obj === undefined || obj === null || Object.prototype.toString.call(obj) !== '[object Object]') { obj = {} }

    let keys = Object.keys(schema)
    keys.forEach(key => {
      if (schema[key] instanceof Array) {
        obj[key] = this._check_array(schema[key][0], obj[key])
      } else if (schema[key] instanceof Object) {
        obj[key] = this._process_obj(schema[key], obj[key])
      } else {
        obj[key] = obj[key] === undefined ? null : obj[key]
      }
    })
    return obj
  },
  _check_array (obj_schema, arr) {
    if (arr === undefined || arr === null || Object.prototype.toString.call(arr) !== '[object Array]') { arr = [] }

    for (let i = 0; i < arr.length; ++i) {
      arr[i] = this._process_obj(obj_schema, arr[i])
    }

    return arr
  },
  _initDate () {
    Date.prototype.format = function (format) {
      var args = {
        'M+': this.getMonth() + 1,
        'd+': this.getDate(),
        'h+': this.getHours(),
        'm+': this.getMinutes(),
        's+': this.getSeconds(),
        'q+': Math.floor((this.getMonth() + 3) / 3), // quarter
        'S': this.getMilliseconds()
      }
      if (/(y+)/.test(format)) { format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length)) }
      for (let i in args) {
        let n = args[i]
        if (new RegExp('(' + i + ')').test(format)) { format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? n : ('00' + n).substr(('' + n).length)) }
      }
      return format
    }
  }
}
