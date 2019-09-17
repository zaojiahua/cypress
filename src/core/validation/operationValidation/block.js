export function unitListValidation (fromnode, fromport, tonode, toport) {
  // 不仅仅是unitList  所有节点都只能被指向一次
  return tonode.findLinksInto().count < 1
}
