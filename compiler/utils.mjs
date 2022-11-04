// 有限状态自动机

const State = {
  initial: 1,   // 初始状态
  tagOpen: 2,   // 标签开始状态
  tagName: 3,   // 标签名称状态
  text: 4,      // 文本状态
  tagEnd: 5,    // 结束标签状态
  tagEndName: 6 // 结束标签名称状态
}
// 辅助函数，用来判断是否为字母
function isAlpha(char) {
  return char >= 'a' && char <= 'z' || char >= 'A' && char <= 'Z'
}

// 接收模板字符串作为参数，并将模版切割为 token 返回
export function tokeniz(str) {
  // 状态机的当前状态：初始状态
  let currentState = State.initial
  // 用于缓存字符, chars中只能存储字母，不能用来存储 < 或 >
  const chars = []
  // 生成的token会存储到tokens数组中，并作为函数的返回值返回
  const tokens = []
  while (str) {
    const char = str[0]
    switch (currentState) {
      case State.initial:
        if (char === '<') {
          currentState = State.tagOpen
          str = str.slice(1)
        } else if (isAlpha(char)) {
          // 1. 遇到字母，切换到文本状态
          currentState = State.text
          chars.push(char)
          str = str.slice(1)
        }
        break;
      case State.tagOpen:
        if (isAlpha(char)) {
          currentState = State.tagName
          chars.push(char)
          str = str.slice(1)
        } else if (char === '/') {
          currentState = State.tagEnd
          str = str.slice(1)
        }
        break
      case State.tagName:
        if (isAlpha(char)) {
          chars.push(char)
          str = str.slice(1)
        } else if (char === '>') {
          currentState = State.initial
          tokens.push({
            type: 'tag',
            name: chars.join('')
          })
          chars.length = 0
          str = str.slice(1)
        }
        break
      case State.text:
        if (isAlpha(char)) {
          chars.push(char)
          str = str.slice(1)
        } else if (char === '<') {
          currentState = State.tagOpen
          tokens.push({
            type: 'text',
            content: chars.join('')
          })
          chars.length = 0
          str = str.slice(1)
        }
        break
      case State.tagEnd:
        if (isAlpha(char)) {
          currentState = State.tagEndName
          chars.push(char)
          str = str.slice(1)
        }
        break
      case State.tagEndName:
        if (isAlpha(char)) {
          chars.push(char)
          str = str.slice(1)
        } else if (char === '>') {
          currentState = State.initial
          tokens.push({
            type: 'tagEnd',
            name: chars.join('')
          })
          chars.length = 0
          str = str.slice(1)
        }
        break
    }
  }
  return tokens
}


export function parse(str) {
  const tokens = tokeniz(str)
  // console.log(tokens)
  const root = {
    type: 'Root',
    children: []
  }
  const elementStack = [root]
  while (tokens.length) {
    const parent = elementStack[elementStack.length - 1]
    const t = tokens[0]
    switch (t.type) {
      case 'tag':
        const elementNode = {
          type: 'Element',
          tag: t.name,
          children: []
        }
        parent.children.push(elementNode)
        elementStack.push(elementNode)
        break
      case 'text':
        const textNode = {
          type: 'Text',
          content: t.content,
        }
        parent.children.push(textNode)
        break
      case 'tagEnd':
        elementStack.pop()
        break
    }
    tokens.shift()
  }
  return root
}

// 打印节点信息 
export function dump(node, indent = 0) {
  // console.log(node)
  const type = node.type
  const desc = node.type === 'Root'
    ? ''
    : node.type === 'Element'
      ? node.tag
      : node.content

  console.log(`${'-'.repeat(indent)}${type}:  ${desc}`)

  if (node.children) {
    node.children.forEach(n => dump(n, indent + 2))
  }
}

/**
 * AST 遍历函数
 * @param {*} ast 
 * @param {Object} context 上下文
 */
export function traverseNode(ast, context) {
  const currentAst = ast
  const transforms = context.nodeTransforms
  for (let i = 0; i < transforms.length; i++) {
    transforms[i](currentAst, context)
  }

  const children = currentAst.children
  if (children) {
    for (let i = 0; i < children.length; i++) {
      traverseNode(children[i], context)
    }
  }
}
