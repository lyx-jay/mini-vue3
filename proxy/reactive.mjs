import { effect, reactive } from '../reactive/utils.mjs'

const obj = {
  foo: 1,
  get bar() {
    return this.foo
  }
}

const p = reactive(obj)

effect(() => {
  console.log(p.bar)
})

p.foo++