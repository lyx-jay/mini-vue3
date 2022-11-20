import { reactive, effect, jobQueue, flushjob } from '../utils/index'
import { EffectFn } from '../utils/index'
const obj = reactive({
  foo: 1,
})
effect(function () {
  console.log(obj.foo)
}, {
  // scheduler 只有在trigger时才会触发
  scheduler(fn?: EffectFn) {
    fn && jobQueue.add(fn)
    flushjob()
    // setTimeout(() => {
      // fn && fn()
    // })
  }
})

obj.foo++
// console.log('结束了')
obj.foo++