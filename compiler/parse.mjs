import { dump, traverseNode } from './utils.mjs'
import { transformElement, transformRoot, transformText } from './javaScriptAst.mjs'

// AST 转换函数
export function transform(ast) {
  const context = {
    // 用来存储当前正在转换的节点
    currentNode: null,
    // 用来存储当前节点在父节点的children中的位置索引
    childIndex: 0,
    // 用来存储当前转换节点的父节点
    parent: null,
    replaceNode(node) {
      context.parent.children[context.childIndex] = node
      context.currentNode = node
    },
    removeNode() {
      if (context.parent) {
        context.parent.children.splice(context.childIndex, 1)
        context.currentNode = null
      }
    },
    nodeTransforms: [
      transformText,
      transformElement,
      transformRoot
    ]
  }

  traverseNode(ast, context)
  dump(ast)
}


