import { Vec2 } from './math2d'

var EInputEventType
(function (EInputEventType) {
  EInputEventType[EInputEventType['MOUSEEVENT'] = 0] = 'MOUSEEVENT'
  EInputEventType[EInputEventType['MOUSEDOWN'] = 1] = 'MOUSEDOWN'
  EInputEventType[EInputEventType['MOUSEUP'] = 2] = 'MOUSEUP'
  EInputEventType[EInputEventType['MOUSEMOVE'] = 3] = 'MOUSEMOVE'
  EInputEventType[EInputEventType['MOUSEDRAG'] = 4] = 'MOUSEDRAG'
  EInputEventType[EInputEventType['KEYBOARDEVENT'] = 5] = 'KEYBOARDEVENT'
  EInputEventType[EInputEventType['KEYUP'] = 6] = 'KEYUP'
  EInputEventType[EInputEventType['KEYDOWN'] = 7] = 'KEYDOWN'
  EInputEventType[EInputEventType['KEYPRESS'] = 8] = 'KEYPRESS'
})(EInputEventType = exports.EInputEventType || (exports.EInputEventType = {}))
console.log(EInputEventType)

export class Application {
  isSupportMouseMove
  _isMouseDown
  _start = false
  _requestId = -1
  _lastTime
  _startTime
  canvas
  timers = []
  _timerId = -1
  _fps = 0
  get fps () {
    return this._fps
  }
  constructor (canvas) {
    this.canvas = canvas
    // canvas能够监听鼠标事件
    this.canvas.addEventListener('mousedown', this, false)
    this.canvas.addEventListener('mouseup', this, false)
    this.canvas.addEventListener('mousemove', this, false)
    // 在window对象中监听键盘事件
    window.addEventListener('keydown', this, false)
    window.addEventListener('keyup', this, false)
    window.addEventListener('keypress', this, false)

    this._isMouseDown = false
    this.isSupportMouseMove = false
  }
  // 调用dispatchXXX虚方法进行事件分发
  handleEvent (evt) {
    switch (evt.type) {
      case 'mousedown':
        this._isMouseDown = true
        this.dispatchMouseDown(this._toCanvasMouseEvent(evt))
        break
      case 'mouseup':
        this._isMouseDown = false
        this.dispatchMouseUp(this._toCanvasMouseEvent(evt))
        break
      case 'mousemove':
        // 如果isSupportMouseMove为true，则每次鼠标移动都会触发mouseMove事件
        if (this.isSupportMouseMove) {
          this.dispatchMouseMove(this._toCanvasMouseEvent(evt))
        }
        // 同时，如果当前鼠标任意一个键处于按下状态并拖动时，触发drag事件
        if (this._isMouseDown) {
          this.dispatchMouseDrag(this._toCanvasMouseEvent(evt))
        }
        break
      case 'keypress':
        this.dispatchKeyPress(this._toCanvasKeyBoardEvent(evt))
        break
      case 'keydown':
        this.dispatchKeyDown(this._toCanvasKeyBoardEvent(evt))
        break
      case 'keyup':
        this.dispatchKeyUp(this._toCanvasKeyBoardEvent(evt))
        break
    }
  }
  dispatchMouseDown (evt) {}
  dispatchMouseUp (evt) {}
  dispatchMouseMove (evt) {}
  dispatchMouseDrag (evt) {}
  dispatchKeyPress (evt) {}
  dispatchKeyDown (evt) {}
  dispatchKeyUp (evt) {}
  start () {
    if (!this._start) {
      this._start = true
      this._requestId = -1
      // 在start和stop函数中，_lastTime和_startTime都设置为-1
      this._lastTime = -1
      this._startTime = -1
      // 启动更新渲染循环
      this._requestId = requestAnimationFrame((elapsedMsec) => {
        // 启动step方法
        this.step(elapsedMsec)
      })
    }
  }
  stop () {
    if (this._start) {
      // 取消一个先前通过requestAnimationFrame()方法添加到计划中的动画帧请求
      cancelAnimationFrame(this._requestId)
      this._requestId = -1
      this._lastTime = -1
      this._startTime = -1
      this._start = false
    }
  }
  // 用于查询当前是否处于动画循环状态
  isRunning () {
    return this._start
  }
  // 不停地周而复始的运动
  step (timeStamp) {
    // 第一次调用本函数时，设置start和lastTime为timeStamp
    if (this._startTime === -1) this._startTime = timeStamp
    if (this._lastTime === -1) this._lastTime = timeStamp
    // 计算当前时间点与第一次调用step时间点的差，以毫秒为单位
    let elapsedMsec = timeStamp - this._startTime
    // 计算当前时间点与上一次调用step时间点的差
    let intervalSec = timeStamp - this._lastTime
    // 第一帧的时候，intervalSec为0，防止0作为分母
    if (intervalSec !== 0) {
      // 计算fps
      this._fps = 1000.0 / intervalSec
    }
    // update使用的是以秒为单位，因此转换为秒表示
    intervalSec /= 1000.0
    // 记录上一次的时间戳
    this._lastTime = timeStamp
    this._handleTimers(intervalSec)
    // console.log("elapsedTime = " + elapsedMsec + " intervalSec = " + intervalSec);
    // 先更新
    this.update(elapsedMsec, intervalSec)
    // 后渲染
    this.render()
    // 递归调用，形成周而复始的循环操作
    requestAnimationFrame((elapsedMsec) => {
      this.step(elapsedMsec)
    })
  }
  update (elapsedMsec, intervalSec) {}
  render () {}
  _viewportToCanvasCoordinate (evt) {
    if (this.canvas) {
      let rect = this.canvas.getBoundingClientRect()
      if (evt.type === 'mousedown') {
        console.log('boundingClientRect: ' + JSON.stringify(rect))
        console.log('clientX: ' + evt.clientX + ' clientY: ' + evt.clientY)
      }

      // 获取触发鼠标事件的的target元素，这里总是HTMLCanvasElement
      if (evt.target) {
        let borderLeftWidth = 0
        let borderTopWidth = 0
        let paddingLeft = 0
        let paddingTop = 0
        let decl = getComputedStyle(evt.target)
        let strNumber = decl.borderLeftWidth
        if (strNumber !== null) {
          borderLeftWidth = parseInt(strNumber, 10)
        }
        strNumber = decl.borderTopWidth
        if (strNumber !== null) {
          borderTopWidth = parseInt(strNumber, 10)
        }
        strNumber = decl.paddingLeft
        if (strNumber !== null) {
          paddingLeft = parseInt(strNumber)
        }
        strNumber = decl.paddingTop
        if (strNumber !== null) {
          paddingTop = parseInt(strNumber)
        }
        // a = evt.clientX - rect.left，将鼠标点从viewport坐标系变换到border坐标系
        // b = a - borderLeftWidth，将border坐标系变换到padding坐标系
        // x = b - paddingLeft，将padding坐标系变换到context坐标系，也就是canvas元素坐标系
        let x = evt.clientX - rect.left - borderLeftWidth - paddingLeft
        let y = evt.clientY - rect.top - borderTopWidth - paddingTop
        let pos = Vec2.create(x, y)
        if (evt.type === 'mousedown') {
          console.log('borderLeftWidth: ' + borderLeftWidth + ' borderTopWidth: ' + borderTopWidth)
          console.log('paddingLeft: ' + paddingLeft + ' paddingTop: ' + paddingTop)
          console.log('变换后的canvasPosition: ' + pos.toString())
        }
        return pos
      }
      alert('canvas为null')
      throw new Error('canvas为null')
    }

    alert('evt.target为null')
    throw new Error('evt.target为null')
  }
  // 将DOM Event对象信息转换为自己定义的CanvasMouseEvent事件
  _toCanvasMouseEvent (evt) {
    // 向下转型，将Event转换为MouseEvent
    let event = evt
    // 将客户区的鼠标pos变换到Canvas坐标系中表示
    let mousePosition = this._viewportToCanvasCoordinate(event)
    // 将Event一些要用到的信息传递给CanvasMouseEvent并返回
    let canvasMouseEvent = new CanvasMouseEvent(mousePosition, event.button, event.altKey, event.ctrlKey, event.shiftKey)
    return canvasMouseEvent
  }
  _toCanvasKeyBoardEvent (evt) {
    let event = evt
    let canvasKeyboardEvent = new CanvasKeyBoardEvent(event.key, event.keyCode, event.repeat, event.altKey, event.ctrlKey, event.shiftKey)
    return canvasKeyboardEvent
  }
  // 根据id在timers列表中查找
  // 如果找到，则设置timer的enabled为false，并返回true
  // 如果没有找到，返回false
  removeTimer (id) {
    let found = false
    for (let i = 0; i < this.timers.length; i++) {
      if (this.timers[i].id === id) {
        let timer = this.timers[i]
        timer.enabled = false // 只是enabled设置为false，并没有从数组中删除掉
        found = true
        break
      }
    }
    return found
  }
  addTimer (callback, timeout = 1.0, onlyOnce = false, data = undefined) {
    let timer
    for (let i = 0; i < this.timers.length; i++) {
      let timer = this.timers[i]
      // 重用无效的Timer
      if (timer.enabled === false) {
        timer.callback = callback
        timer.callbackData = data
        timer.timeout = timeout
        timer.countdown = timeout
        timer.enabled = true
        timer.onlyOnce = onlyOnce
        return timer.id
      }
    }
    // 不存在，就new一个新的Timer，并设置所有相关属性
    timer = new Timer(callback)
    timer.callbackData = data
    timer.timeout = timeout
    timer.countdown = timeout
    timer.enabled = true
    timer.id = ++this._timeId
    // 设置是一次回调，还是重复回调
    timer.onlyOnce = onlyOnce
    // 添加到timers列表中
    this.timers.push(timer)
    // 返回新添加的timer的id号
    return timer.id
  }

  // 计时器依赖于requestAnimationFrame回调
  // 如果当前Application没有调用start的话则计时器不会生效
  _handleTimers (intervalSec) {
    for (let i = 0; i < this.timers.length; i++) {
      let timer = this.timers[i]
      // 如果当前timer enabled为false，那么继续循环
      // 这句也是重用Timer对象的一个关键实现
      if (timer.enabled === false) {
        continue
      }
      // countdown初始化时等于timeout
      // 每次调用本函数，会减少上下帧的时间间隔，也就是update第二个参数传来的值，从而形成倒计时的效果
      timer.countdown -= intervalSec
      // 如果countdown小于0.0，那么说明时间到了，要触发回调了
      if (timer.countdown < 0.0) {
        timer.callback(timer.id, timer.callbackData)
        if (timer.onlyOnce === false) {
          timer.countdown = timer.timeout
        } else {
          this.removeTimer(timer.id)
        }
      }
    }
  }
}

export class CanvasInputEvent {
  altkey
  ctrlkey
  shiftKey
  // type是一个枚举对象，用来显示当前的事件类型
  type
  constructor (altKey = false, ctrlKey = false, shiftKey = false, type = EInputEventType.MOUSEEVENT) {
    this.altkey = altKey
    this.ctrlkey = ctrlKey
    this.shiftKey = shiftKey
    this.type = type
  }
}

export class CanvasKeyBoardEvent extends CanvasInputEvent {
  // 当前按下的键的ASCII字符
  key
  // 当前按下的键的ASCII码
  keyCode
  // 当前按下的键是否不停的触发事件
  repeat
  constructor (key, keyCode, repeat, altkey = false, ctrlKey = false, shiftKey = false) {
    super(altkey, ctrlKey, shiftKey, EInputEventType.KEYBOARDEVENT)
    this.key = key
    this.keyCode = keyCode
    this.repeat = repeat
  }
}

export class CanvasMouseEvent extends CanvasInputEvent {
  // button表示当前按下鼠标那个键
  // 0: 鼠标左键，1: 鼠标中键，2: 鼠标右键
  button;
  // 基于canvas坐标系的表示
  canvasPosition;
  localPosition;
  constructor (canvasPos, button, altkey = false, ctrlKey = false, shiftKey = false) {
    super(altkey, ctrlKey, shiftKey)
    this.canvasPosition = canvasPos
    this.button = button

    // 暂时创建一个vec2对象
    this.localPosition = Vec2.create(0, 0)
  }
}

class Timer {
  id = -1
  // 标记当前计时器是否有效
  enabled = false
  // 回调函数，到时间会自动调用
  callback
  // 用作回调函数的参数
  callbackData = undefined
  // 倒计时器，每次update时会倒计时
  countdown = 0
  timeout = 0
  onlyOnce = false
  constructor (callback) {
    this.callback = callback
  }
}

export class Canvas2DApplication extends Application {
  context2D;
  constructor (canvas) {
    super(canvas)
    this.context2D = this.canvas.getContext('2d')
  }
}
