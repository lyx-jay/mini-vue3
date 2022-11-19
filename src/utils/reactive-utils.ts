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

/** 根本数据类型 */
type Bucket = WeakMap<OriginalData, DepsMap>


type EffectFn = {
  (): void
  deps: FnDeps[]
}

let activeEffectFn: EffectFn
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
  const effectFn: EffectFn = () => {
    cleanup(effectFn)
    activeEffectFn = effectFn
    fn()
  }

  effectFn.deps = []
  effectFn()
}

function cleanup(effectFn: EffectFn) {
  console.log('cleanup')
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
function track(target: OriginalData, key: string) {
  console.log('key', key)
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


function trigger(target: OriginalData, key: string) {
  let depsMap = bucket.get(target)
  if (!depsMap) return

  let deps = depsMap.get(key)
  if (!deps) return
  // 构造新的deps执行，就不会出现无限循环的问题啦
  let newdeps = new Set(deps)
  newdeps.forEach(fn => fn())
}









