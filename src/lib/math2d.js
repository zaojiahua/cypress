const PiBy180 = 0.017453292519943295
export class Vec2 {
  values
  constructor (x = 0, y = 0) {
    this.values = new Float32Array([x, y])
  }
  // 特殊的单位向量
  static xAxis = new Vec2(1, 0)
  static yAxis = new Vec2(0, 1);
  static nXAxis = new Vec2(-1, 0);
  static nYAxis = new Vec2(0, -1);
  static create (x = 0, y = 0) {
    return new Vec2(x, y)
  }
  // 复制当前向量到目标向量
  static copy (src, result = null) {
    if (result === null) result = new Vec2()
    result.values[0] = src.values[0]
    result.values[1] = src.values[1]
    return result
  }
  // 向量加法
  static sum (left, right, result = null) {
    if (result === null) result = new Vec2()
    result.values[0] = left.values[0] + right.values[0]
    result.values[1] = left.values[1] + right.values[1]
    return result
  }
  // 向量减法
  static difference (end, start, result = null) {
    if (result === null) result = new Vec2()
    result.values[0] = end.values[0] - start.values[0]
    result.values[1] = end.values[1] - start.values[0]
    return result
  }
  // 向量与标量的乘法
  static scale (direction, scalar, result = null) {
    if (result === null) result = new Vec2()
    result.values[0] = direction.values[0] * scalar
    result.values[1] = direction.values[1] * scalar
    return result
  }
  // result = start + direction * scalar
  // 将一个点（start）沿着direction给定的方向移动scalar个单位
  static scaleAdd (start, direction, scalar, result = null) {
    if (result === null) result = new Vec2()
    Vec2.scale(direction, scalar, result)
    return Vec2.sum(start, result, result)
  }
  // 点乘
  static dotProduct (left, right) {
    return left.values[0] * right.values[0] + left.values[1] * right.values[1]
  }
  // 获取两个向量之间的夹角
  static getAngle (a, b, isRadian = false) {
    let dot = Vec2.dotProduct(a, b)
    let radian = Math.acos(dot / (a.length * b.length))
    if (isRadian === false) {
      radian = Math2D.toDegree(radian)
    }
    return radian
  }
  // 获取物体的方向
  static getOrientation (from, to, isRadian = false) {
    let diff = Vec2.difference(to, from)
    let radian = Math.atan2(diff.y, diff.x)
    if (isRadian === false) radian = Math2D.toDegree(radian)
    return radian
  }
  // 叉乘，返回标量
  static crossProduct (left, right) {
    return left.x * right.y - left.y * right.x
  }
  static sinAngle (a, b, norm = false) {
    if (norm === true) {
      a.normalize()
      b.normalize()
    }
    return (a.x * b.y - b.x * a.y)
  }
  static cosAngle (a, b, norm = false) {
    if (norm === true) {
      a.normalize()
      b.normalize()
    }
    return Vec2.dotProduct(a, b)
  }
  get x () {
    return this.values[0]
  }
  set x (x) {
    this.values[0] = x
  }
  get y () {
    return this.values[1]
  }
  set y (y) {
    this.values[1] = this.y
  }
  // 返回没有开根号的向量大小
  get squaredLength () {
    let x = this.values[0]
    let y = this.values[1]
    return (x * x + y * y)
  }
  // 返回真正的向量大小
  get length () {
    return Math.sqrt(this.squaredLength)
  }
  // 重置向量的x、y值
  reset (x = 0, y = 0) {
    this.values[0] = x
    this.values[1] = y
    return this
  }
  // 容差处理
  equals (vector) {
    if (Math.abs(this.values[0] - vector.values[0]) > Number.EPSILON) return false
    if (Math.abs(this.values[1] - vector.values[1]) > Number.EPSILON) return false
    return true
  }
  // 化为单位向量，该向量表示方向
  normalize () {
    let len = this.length
    // 对0向量的判断与处理
    if (Math2D.isEquals(len, 0)) {
      this.values[0] = 0
      this.values[1] = 0
      return 0
    }
    // 如果已经是单位向量，直接返回1.0
    if (Math2D.isEquals(len, 1)) {
      return 1.0
    }
    // 否则计算出单位向量（即方向）
    this.values[0] /= len
    this.values[1] /= len
    // 返回向量的大小
    return len
  }
  // 当前向量取反
  negative () {
    this.values[0] = -this.values[0]
    this.values[1] = -this.values[1]
    return this
  }
  // 将当前向量与另一个向量相加，结果保存为当前向量
  add (right) {
    Vec2.sum(this, right, this)
    return this
  }
  // 将当前向量减去另一个向量，结果保存为当前向量
  substract (another) {
    Vec2.difference(this, another, this)
    return this
  }
  innerProduct (right) {
    return Vec2.dotProduct(this, right)
  }
}

export class Math2D {
  // 角度转弧度
  static toRadian (degree) {
    return degree * PiBy180
  }
  // 弧度转角度
  static toDegree (radian) {
    return radian / PiBy180
  }
  // 是否相等-容差处理
  static isEquals (left, right, epsilon = Number.EPSILON) {
    if (Math.abs(left - right) >= epsilon) return false
    return true
  }
  // 确定一个点是否在一条线段的表示区间，并返回该点的投影点
  static projectPointOnLineSegment (pt, start, end, closePoint) {
    let v0 = Vec2.create()
    let v1 = Vec2.create()
    let d = 0
    // 向量减法，形成方向向量
    Vec2.difference(pt, start, v0)
    Vec2.difference(end, start, v1)
    d = v1.normalize()
    // 将v0投影在v1上，获取投影长度t
    let t = Vec2.dotProduct(v0, v1)
    // 如果投影长度t < 0，说明鼠标位置点在线段的起点范围之外
    if (t < 0) {
      closePoint.x = start.x
      closePoint.y = start.y
      return false
    } else if (t > d) {
      // 如果投影长度 > 线段的长度，说明鼠标位置点超过线段终点的范围
      closePoint.x = end.x
      closePoint.y = end.y
      return false
    } else {
      Vec2.scaleAdd(start, v1, t, closePoint)
      return true
    }
  }
}

export class Size {
  values
  constructor (w = 1, h = 1) {
    this.values = new Float32Array([w, h])
  }
  get width () {
    return this.values[0]
  }
  set width (w) {
    this.values[0] = w
  }
  get height () {
    return this.values[1]
  }
  set height (h) {
    this.values[1] = h
  }
  static create (w = 1, h = 1) {
    return new Size(w, h)
  }
}
