/**
 * 响应式工具函数
 */
interface OriginalData {
  [key: string]: any
}

/** 数据对象的依赖集合 */
type DepsMap = Map<string, FnDeps>

/** 副作用函数依赖集合 */
type FnDeps = Set<EffectFn>

/** 根本数据类型 */
type Bucket = WeakMap<OriginalData, DepsMap>


export type EffectFn = {
  (): void
  deps: FnDeps[]
  options: {
    [key: string]: any
  }
}

type Options = {
  [key: string]: any
}

let activeEffectFn: EffectFn
let bucket: Bucket = new WeakMap()
const activeEffectStack: EffectFn[] = []

/**
 * 构造响应式数据
 * @param data 原始数据
 * @returns 响应式数据
 */
export function reactive(data: OriginalData) {
  return new Proxy(data, {
    get(target, key: string, receiver) {
      track(target, key)
      // receiver 指向属性的调用者
      return Reflect.get(target, key, receiver)
      // return target[key]
    },
    set(target, key: string, newValue: any) {
      target[key] = newValue
      trigger(target, key)
      return true
    }
  })
}

/**
 * 注册副作用函数
 */
export function effect(fn: Function, options: Options = {}) {
  const effectFn: EffectFn = () => {
    cleanup(effectFn)
    activeEffectFn = effectFn
    activeEffectStack.push(effectFn)
    // res 用来存储fn函数计算的值
    const res = fn()
    activeEffectStack.pop()
    activeEffectFn = activeEffectStack[activeEffectStack.length - 1]
    return res
  }

  effectFn.deps = []
  effectFn.options = options
  if (!options.lazy) {
    effectFn()
  }
  return effectFn
}

// 清除依赖集合中的副作用函数
function cleanup(effectFn: EffectFn) {
  // console.log('cleanup')
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i]
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0
}

/**
 * 依赖收集
 * @param target 原始数据对象
 * @param key 键值
 */
export function track(target: OriginalData, key: string) {
  // console.log('key', key)
  if (!activeEffectFn) return
  let depsMap = bucket.get(target)
  if (!depsMap) {
    bucket.set(target, depsMap = new Map())
  }
  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, deps = new Set())
  }
  deps.add(activeEffectFn)
  activeEffectFn.deps.push(deps)
}

// 触发副作用函数执行
export function trigger(target: OriginalData, key: string) {
  let depsMap = bucket.get(target)
  if (!depsMap) return

  let effects = depsMap.get(key)
  if (!effects) return
  // 构造新的deps执行，就不会出现无限循环的问题啦
  let effectsToRun = new Set(effects)
  effectsToRun.forEach(fn => {
    // 当fn不等于自身时才调用函数，避免调用自身引起的无限调用问题
    if (fn !== activeEffectFn) {
      if (fn.options.scheduler) {
        fn.options.scheduler(fn)
      } else {
        fn()
      }
    }
  })
}

/**
 * 读取对象上的任意属性
 * @param value 
 * @param seen 
 * @returns 
 */
export function traverse(value: any, seen = new Set()) {
  // 如果读取到的是原始值，或者已经被读取过了，那什么都不做
  if (typeof value !== 'object' || value == null || seen.has(value)) return
  // 将数据添加到 seen 中，代表已经读取过了
  seen.add(value)
  // 暂时不考虑数组等其他结构
  for (const k in value) {
    traverse(value[k], seen)
  }

  return value
}






