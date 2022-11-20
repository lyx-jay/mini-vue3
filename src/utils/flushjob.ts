import { EffectFn } from './reactive-utils'

let isFlushing: boolean = false
const p = Promise.resolve()
export const jobQueue = new Set<EffectFn>()

export function flushjob() {
  // 如果队列正在刷新，则什么都不做
  if (isFlushing) return
  // 否则，将 isFlushing 置为 true，表示队列正在刷新
  isFlushing = true
  p.then(() => {
    // 在微任务中执行jobQueue中的函数
    jobQueue.forEach((fn: EffectFn) => fn())
  }).finally(() => {
    // 在finally 的回调函数中将 isFlushing 置为初始状态
    isFlushing = false
  })
}
