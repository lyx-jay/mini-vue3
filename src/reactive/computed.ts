// 计算属性是利用scheduler实现的
// 1. 在读取值时才会真正开始计算，也就是按需计算
// 2. 如果值不发生变化，不会重新计算, computed 默认只会计算一次，如果需要重新计算，是需要给定参数
import { effect, reactive, trigger, track } from '../utils/reactive-utils'

export function computed(fn: any) {
  // value 用来缓存上一次计算的值
  let value: any
  // dirty 表示是否需要重新计算，为 true 意味着 “脏”，表示需要计算
  let dirty: boolean = true
  const effectFn = effect(fn, {
    lazy: true,
    scheduler() {
      if (!dirty) {
        dirty = true
        trigger(obj, 'value')
      }
    }
  })

  const obj = {
    get value() {
      if (dirty) {
        value = effectFn && effectFn()
        dirty = false
      }
      track(obj, 'value')
      return value
    }
  }
  return obj
}


const data = reactive({
  foo: 1,
  bar: 2
})

const res = computed(() => {
  return data.foo + data.bar
})


effect(() => {
  console.log(res.value)
})

// console.log(res.value)

data.foo = 4