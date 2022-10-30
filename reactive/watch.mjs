import { effect, reactive, traverse } from "./utils.mjs";

function watch(source, cb) {
  // watch 可以接受一个 getter 函数，用户可以指定 watch 依赖哪些响应式数据
  // 只有当这些数据变化时，才会触发回调函数执行
  let getter
  let newValue
  let oldValue
  if (typeof source === 'function') {
    getter = source
  } else {
    getter = () => traverse(source)
  }
  const effectFn = effect(
    () => getter(),
    { 
      lazy: true,
      scheduler() {
        newValue = effectFn()
        cb(newValue, oldValue)
        oldValue = newValue
      }
    }
  )
  oldValue = effectFn()
}

const obj = reactive({ foo: 1, bar: 2 })
watch(obj, (newValue, oldValue) => {
  console.log(`数据发生变化了, new: ${JSON.stringify(newValue)}, old: ${JSON.stringify(oldValue)}`)
  // 如果是对象，那么新值和旧值应该是一样的，因为指向了同一个内存地址
  // console.log(`数据发生变化了, new: ${newValue.foo}, old: ${oldValue.foo}`)
  // console.log(`数据发生变化了, new: ${newValue.bar}, old: ${oldValue.bar}`)
})

obj.foo = obj.foo + 3
obj.bar++