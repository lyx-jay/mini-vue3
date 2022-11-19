export function reactive(data) {
  return new Proxy(data, {
    get(target, key) {

    },
    set() {

    }
  })
}