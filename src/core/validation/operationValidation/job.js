export function startValidation (fromnode, fromport, tonode, toport) {
  //  start可能会出现在 fromnode 或则 tonode  所以需要做判断

  // Start只有一条指向链接
  if (fromnode.findNodesOutOf().count >= 1) return false
  // Start只能指向Normal block
  return tonode.data.category === 'normalBlock'
}
