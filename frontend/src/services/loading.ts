const _bus = new EventTarget()

export function setLoading(value: boolean) {
  _bus.dispatchEvent(new CustomEvent('loading', { detail: value }))
}

export function onLoading(cb: (value: boolean) => void) {
  const handler = (e: Event) => cb((e as CustomEvent).detail)
  _bus.addEventListener('loading', handler)
  return () => _bus.removeEventListener('loading', handler)
}
