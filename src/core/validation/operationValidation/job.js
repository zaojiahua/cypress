export function normalBlockValidation (fromnode, fromport, tonode, toport) {
  // normalBlock只有一条指向链接
  return fromnode.findNodesOutOf().count < 1
}

export function startValidation (fromnode, fromport, tonode, toport) {
  // Start只有一条指向链接
  if (fromnode.findNodesOutOf().count >= 1) return false
  // Start只能指向Normal block
  return tonode.data.category === 'normalBlock'
}
