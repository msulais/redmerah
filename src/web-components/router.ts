import { GlobalAttributes } from "./global-attributes"

const LISTENER = new Set<Function>()
const EVENT_TYPE_ROUTE_CHANGE = "biru-route-change"

/**
 * Update url without reloading page.
 *
 * @param {string} href Any valid href string
 * @param {Event} event Event to preventDefault() to avoid reload page
 */
export function updateLocalRoute(href: string, event?: Event): void {
	event?.preventDefault()
	window.history.pushState({}, "", href)
	window.dispatchEvent(new Event(EVENT_TYPE_ROUTE_CHANGE))
}

export function listenRouteChange(callback: (ev: Event) => unknown) {
	if (LISTENER.size === 0) {
		const fn = (ev: Event) => {
			for (const listener of LISTENER) {
				listener(ev)
			}
		}

		window.addEventListener('hashchange', fn)
		window.addEventListener('popstate', fn)
		window.addEventListener(EVENT_TYPE_ROUTE_CHANGE, fn)
		document.addEventListener("click", (e) => {
			const target = e.target as HTMLElement
			const anchor = target.closest("a")
			if (
				anchor
				&& !anchor.hasAttribute(GlobalAttributes.PreventDefault)
				&& anchor.origin === window.location.origin
				&& anchor.pathname === window.location.pathname
			) {
				if (anchor.hash === window.location.hash) {
					updateLocalRoute(anchor.href, e)
				}
				else {
					updateLocalRoute(anchor.href)
				}
			}
		})
	}

	LISTENER.add(callback)
	return () => LISTENER.delete(callback)
}