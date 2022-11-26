// watch 的作用是监听响应式数据是否发生变化，如果变化，立刻调用回调函数
// watch 利用了 effect 和 scheduler 实现

import { effect, reactive, traverse } from "../utils/reactive-utils";

const obj = reactive({
  foo: 1
})

type Options = {
  immediate?: boolean
  /**
   * post: 表示等待dom 更新结束后在执行
   */
  flush?: 'post' | 'pre'
}

/**
 * newValue: 新值
 * oldValue: 旧值
 * onInvaliadate: 过期回调函数
 */
type Callback = (newValue?: any, oldValue?: any, onInvalidate?: Function) => void

// 读取响应式数据时，会和副作用函数建立联系，但是当副作用函数的options中存在scheduler时，会执行scheduler函数
export function watch(source: any, cb: Callback, options: Options = {}) {

  let getter: Function
  // 新值
  let newValue: any
  // 旧值
  let oldValue: any
  // 用来存储用户注册的过期回调
  let cleanup: Function
  // 判断source是不是函数，如果是函数，直接给getter
  // 如果不是，调用 traverser 函数，读取对象的每一个属性
  if (typeof source === 'function') {
    getter = source
  } else {
    getter = () => traverse(source)
  }


  function onInvalidate(fn: Function) {
    cleanup = fn
  }

  const job = () => {
    // 执行 effectFn 获得最新的值
    newValue = effectFn()
    // 在调用回调函数之前，调用过期函数
    if (cleanup) {
      cleanup()
    }
    // 执行回调函数
    cb(newValue, oldValue, onInvalidate)
    // 将新值更新为旧值
    oldValue = newValue
  }

  const effectFn = effect(
    () => getter(),
    {
      // lazy: true,
      scheduler() {
        if (options.flush === 'post') {
          const p = Promise.resolve()
          p.then(job)
        } else {
          job()
        }
      }
    }
  )

  if (options.immediate) {
    job()
  } else {
    oldValue = effectFn()
  }

}

watch(() => obj.foo,
  (newValue: any, oldValue: any) => {
    console.log(`数据发生变化， newValue:${newValue}, oldValue:${oldValue}`)
  }, {
  immediate: true,
  flush: 'post'
})

setTimeout(() => {
  obj.foo = 3
}, 2000);