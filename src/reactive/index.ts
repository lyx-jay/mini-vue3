import { reactive, effect } from '../utils/index'

const obj = reactive({
  foo: 1
})

effect(() => {
  console.log(obj.foo)
})

obj.foo++