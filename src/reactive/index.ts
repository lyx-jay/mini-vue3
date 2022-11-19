import { reactive, effect } from '../utils/index'
let content: string = ''
const obj = reactive({
  ok: true,
  text: 'hello'
})

effect(() => {
  content = obj.ok ? obj.text : 'world'
})


setTimeout(() => {
  obj.ok = false
}, 1000);

setTimeout(() => {
  obj.text = 'vue'
}, 2000)