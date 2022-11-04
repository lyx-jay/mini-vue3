import { dump, parse, traverseNode } from './utils.mjs'

const ast = parse(`<div><p>vue</p><p>react</p></div>`)

// 节点转换函数
function transformElement(node) {
  if (node.type === 'Element' && node.tag === 'p') {
    node.tag = 'h1'
  }
}
// 内容转换函数
function transformText(node) {
  if (node.type === 'Text') {
    node.content = node.content.repeat(2)
  }
}

// AST 转换函数
export function transform(ast) {
  const context = {
    nodeTransforms: [
      transformElement,
      transformText
    ]
  }

  traverseNode(ast, context)
  dump(ast)
}

// dump(ast)

transform(ast)
