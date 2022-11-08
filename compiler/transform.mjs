// 节点转换函数
export function transformElement(node) {
  if (node.type === 'Element' && node.tag === 'p') {
    node.tag = 'h1'
  }
  return () => {
    console.log('transformElement')
  }
}
// 内容转换函数
export function transformText(node, context) {
  if (node.type === 'Text') {
    context.removeNode()
  }

  return () => {
    console.log('transformText')
  }
}