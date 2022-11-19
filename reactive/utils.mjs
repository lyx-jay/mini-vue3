const bucket = new WeakMap()
// 任务队列
export const jobQueue = new Set()
const p = Promise.resolve()
// 副作用函数栈
const effectStack = []
// 表示队列是否在正在刷新
let isFlushing = false
// 通过一个全局变量来存储副作用函数
let activeEffect

/**
 * 定义响应式数据类型
 * @param {Object} data 原始数据类型
 * @returns 响应式数据类型
 */
export function reactive(data) {
  return new Proxy(data, {
    get(target, key) {
      track(target, key)
      return target[key]
    },
    set(target, key, newValue) {
      target[key] = newValue
      trigger(target, key)
      return true
    }
  })
}


// 清除依赖集合中的副作用函数
export function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i]
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0
}


// 依赖收集
export function track(target, key) {
  if (!activeEffect) return target[key]
  // 从bucket中取出该对象对应的字段函数依赖
  let depsMap = bucket.get(target)
  if (!depsMap) {
    bucket.set(target, depsMap = new Map())
  }
  // 根据对应的字段，取出对应的副作用函数集合
  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, deps = new Set())
  }
  // 当读取obj的属性时，会先将副作用函数添加到bucket中
  if (key === 'value') {
    console.log('value', activeEffect)
  }
  deps.add(activeEffect)
  // activeEffect.deps 是当前副作用函数的依赖集合数组
  // 数组中的每一项是一个集合，该集合当中就是与key相关的副作用函数
  activeEffect.deps.push(deps)
}

// 数据更新函数
export function trigger(target, key) {

  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)

  const effectsToRun = new Set()
  effects && effects.forEach(effectFn => {
    if (effectFn !== activeEffect) {
      effectsToRun.add(effectFn)
    }
  })
  effectsToRun.forEach(effectFn => {
    // 如果一个副作用函数存在调度器，就调用该调度器
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      // 否则，就直接执行副作用函数
      effectFn()
    }
  })
}


/**
 * 注册副作用函数
 * @param {Function} fn 副作用函数
 * @param {Object} options options 对象
 * @returns 
 */
export const effect = (fn, options = {}) => {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    // 将当前副作用函数推入到栈中
    effectStack.push(effectFn)
    // 将副作用函数的结果保存下来
    const res = fn()
    // 执行完毕之后，从栈中将其弹出
    effectStack.pop()
    // 将activeEffect恢复到之前的状态
    activeEffect = effectStack[effectStack.length - 1]
    return res
  }
  effectFn.options = options
  effectFn.deps = []
  // 如果 lazy 属性为 false，表示要立即执行
  if (!options.lazy) {
    effectFn()
  }
  return effectFn // 返回包装后的副作用函数
}


/**
 * 刷新任务队列
 * @returns 
 */
export function flushJob() {
  if (isFlushing) return
  isFlushing = true
  p.then(() => {
    jobQueue.forEach(job => {
      job()
    })
  })
    .finally(() => {
      isFlushing = false
    })
}


/**
 * 计算属性
 * @param {Function} getter 副作用函数
 * @returns 
 */
export function computed(getter) {
  // 用来记录上一次计算的值
  let value
  // 表示是否需要重新计算，true 表示需要重新计算
  let dirty = true
  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      if (!dirty) {
        dirty = true
        trigger(obj, 'value')
      }
    }
  })

  const obj = {
    // 读取 value 时才执行 effectFn 函数
    get value() {
      if (dirty) {
        value = effectFn()
        dirty = false
      }
      track(obj, 'value')
      return value
    }
  }
  return obj
}


/**
 * 读取对象上的任意属性
 * @param {Object} value 
 * @param {*} seen 
 * @returns 
 */
export function traverse(value, seen = new Set()) {
  // 如果读取的数据是原始值，或者已经被读取过了，那就什么都不做
  if (typeof value !== 'object' || value === null || seen.has(value)) return
  // 将数据添加到seen中，代表已经读取过了
  seen.add(value)
  // 暂时不考虑数组等其他结构
  for (const k in value) {
    traverse(value[k], seen)
  }
  return value
}