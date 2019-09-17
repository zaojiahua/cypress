export function commonValidation (fromnode, fromport, tonode, toport) {
  if (tonode.data.category === 'Start') return false
  if (fromnode.data.category === 'End') return false
  // 只有switchBlock可以多指向
  if (fromnode.data.category !== 'switchBlock' && fromnode.findNodesOutOf().count > 0) return false

  if (fromnode.data.category === 'Start' && tonode.data.category === 'End') return false

  // 保证所有节点不可以重复指向
  let flag = true
  fromnode.findNodesOutOf().each(function (node) {
    if (tonode.data.key === node.data.key) {
      flag = false
    }
  })
  return flag
}
