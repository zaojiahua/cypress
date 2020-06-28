export function commonValidation (fromnode, fromport, tonode, toport) {
  let { category: fromCategory } = fromnode.data
  let { category: toCategory } = tonode.data
  if (toCategory === 'Start') return false
  if (fromCategory === 'End') return false
  // 只有switchBlock可以多指向
  if (fromCategory !== 'switchBlock' && fromnode.findNodesOutOf().count > 0) return false

  if (fromCategory === 'Start' && toCategory === 'End') return false

  // 保证所有节点不可以重复指向
  let flag = true
  fromnode.findNodesOutOf().each(node => {
    if (tonode.data.key === node.data.key) {
      flag = false
    }
  })
  return flag
}
