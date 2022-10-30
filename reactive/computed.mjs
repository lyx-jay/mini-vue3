import { effect, reactive, computed } from './utils.mjs'

const obj = reactive({ foo: 1, bar: 2 })

const sumRes = computed(() => {
  return obj.foo + obj.bar
})

// 计算属性的修改
// console.log(sumRes.value)
// console.log(sumRes.value)

// obj.bar = 5
// console.log(sumRes.value)

effect(() => {
  console.log('test')
  console.log(sumRes.value)
})

obj.foo++

// console.log(sumRes.value)
