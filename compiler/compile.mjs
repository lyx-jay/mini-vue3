import { parse } from './utils.mjs'
import { transform } from './parse.mjs'
import { generate } from './generate.mjs'

// 编译函数
export function compile(template) {
  // 1. 解析模板
  const ast = parse(template)
  // 2. 将模板转换为 javascript ast
  transform(ast)
  // 3. 代码生成
  const code = generate(ast.jsNode)
  return code
}

const template = `<div><p>Vue</p><p>Template</p></div>`

const res = compile(template)

console.log(res)