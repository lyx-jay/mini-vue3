// 计算属性是scheduler的利用
// 计算属性的特性是在读取值时才会真正开始计算，也就是按需计算
import { effect, reactive } from '../utils/reactive-utils'

export function computed(fn: any) {
  let value: any
  const effectFn = effect(fn, {
    lazy: true
  })

  const obj = {
    get value() {
      value = effectFn && effectFn()
      return value
    }
  }
  return obj
}


const obj = reactive({
  foo: 1,
  bar: 2
})

const res = computed(() => {
  return obj.foo + obj.bar
})


console.log(res.value)