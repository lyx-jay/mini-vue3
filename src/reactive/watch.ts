// watch 的作用是监听响应式数据是否发生变化，如果变化，立刻调用回调函数
// watch 利用了 effect 和 scheduler 实现

import { effect, reactive } from "../utils/reactive-utils";

const obj = reactive({
  foo: 1
})

// 读取响应式数据时，会和副作用函数建立联系，但是当副作用函数的options中存在scheduler时，会执行scheduler函数
export function watch(source: any, cb: Function) {
  effect(
    () => source.foo,
    {
      scheduler() {
        cb()
      }
    }
  )
}

watch(obj, () => {
  console.log('watch实现原理')
})

obj.foo = 2