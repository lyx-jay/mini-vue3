import {jobQueue, flushJob, effect, reactive} from './utils.mjs'

const obj = reactive({
  foo: 1
})

effect(function () {
  console.log(obj.foo)
}, {
  // scheduler 是一个函数，它接受副作用函数作为参数
  scheduler(fn) {
    jobQueue.add(fn)
    flushJob()
  }
})

obj.foo++
obj.foo++

// console.log('结束了')


