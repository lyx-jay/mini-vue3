// 用来创建 StringLiteral 节点
export function createStringLiteral(value) {
  return {
    type: 'StringLiteral',
    value
  }
}
// 用来创建 Identifier 节点
export function createIdentifier(name) {
  return {
    type: 'Identifier',
    name
  }
}

// 用来创建 ArrayExpression 节点
export function createArrayExpression(elements) {
  return {
    type: 'ArrayExpression',
    elements
  }
}

// 用来创建 CallExpression 节点
export function createCallExpression(callee, args) {
  return {
    type: 'CallExpression',
    callee: createIdentifier(callee),
    arguments: args
  }
}

// 转换文本节点
export function transformText(node) {
  // 如果不是文本节点，则什么都不做
  if (node.type !== 'Text') return
  // 文本节点对应的 javascript ast 就是一个字符串字面量
  // 因此，只需要使用 node.content 创建一个 StringLiteral 类型的节点即可
  // 最后将文本节点对应的 JavaScript AST 节点 添加到 node.jsNode 属性下
  node.jsNode = createStringLiteral(node.content)
}
// 转换函数的目标就是完成jsnode属性的改写
// 转换标签节点
export function transformElement(node) {
  return () => {
    if (node.type !== 'Element') return
    // 创建 h 函数调用语句
    const callExp = createCallExpression('h', [
      createStringLiteral(node.tag)
    ])
    node.children.length === 1
      ? callExp.arguments.push(node.children[0].jsNode)
      : callExp.arguments.push(createArrayExpression(node.children.map(c => c.jsNode)))

    node.jsNode = callExp
  }
}

export function transformRoot(node) {
  return () => {
    if (node.type !== 'Root') return

    const vnodeJAST = node.children[0].jsNode
    node.jsNode = {
      type: 'FunctionDecl',
      id: { type: 'Identifier', name: 'render' },
      params: [],
      body: [
        {
          type: 'ReturnStatement',
          return: vnodeJAST
        }
      ]
    }
  }
}