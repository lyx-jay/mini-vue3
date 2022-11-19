/**
 * 响应式工具函数
 */
interface OriginalData {
  [key: string]: any
}

/** 数据对象的依赖集合 */
type DepsMap = Map<string, FnDeps>

/** 副作用函数依赖集合 */
type FnDeps = Set<Function>

type Bucket = WeakMap<OriginalData, DepsMap>

let activeEffectFn: Function
let bucket: Bucket = new WeakMap()

/**
 * 构造响应式数据
 * @param data 原始数据
 * @returns 响应式数据
 */
export function reactive(data: OriginalData) {
  return new Proxy(data, {
    get(target, key: string) {
      track(target, key)
      return target[key]
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
export function effect(fn: Function) {
  const effectFn = () => {
    activeEffectFn = fn
    fn()
  }
  effectFn()
}

/**
 * 依赖收集
 * @param target 原始数据对象
 * @param key 键值
 */
function track(target: OriginalData, key: string) {
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
}


function trigger(target: OriginalData, key: string) {
  let depsMap = bucket.get(target)
  if (!depsMap) return
  let deps = depsMap.get(key)
  if (!deps) return
  deps.forEach(fn => fn())
}









