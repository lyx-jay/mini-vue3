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
function tokeniz(str) {
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

