import { GlobalAttributes } from "./global-attributes"

const LISTENER = new Set<Function>()
const EVENT_TYPE_ROUTE_CHANGED = "br:route-changed"

export function listenRouteChange(callback: (ev: Event) => unknown) {
	if (LISTENER.size === 0) {
		window.addEventListener('hashchange', callback)
		window.addEventListener('popstate', callback)
		window.addEventListener(EVENT_TYPE_ROUTE_CHANGED, callback)
		document.addEventListener("click", (e) => {
			const target = e.target as HTMLElement
			const anchor = target.closest("a")

			if (anchor && !anchor.hasAttribute(GlobalAttributes.PreventDefault) && anchor.origin === window.location.origin) {
				e.preventDefault()
				window.history.pushState({}, "", anchor.href)
				window.dispatchEvent(new Event(EVENT_TYPE_ROUTE_CHANGED))
			}
		})
	}

	LISTENER.add(callback)
	return () => LISTENER.delete(callback)
}