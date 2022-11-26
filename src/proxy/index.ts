import { effect, reactive } from '../utils/reactive-utils'

const obj = reactive({
  foo: 1,
  get bar() {
    console.log(this)
    return this.foo
  }
})

effect(() => {
  console.log(obj.bar)
})

obj.foo++