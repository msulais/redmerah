import { listenRouteChange } from "../router"
import { QueryValidation } from "../utils"

export const Attributes = {

	/** Multiple path separated by space. Example: `"/ /a/b /a/b/e"` */
	Path : 'br:path' ,

	/** Multiple hash target separated by space. Example: `"#id1 #id2 #id3"` */
	Hash : 'br:hash' ,

	/**
	 * Complex url query. Example: `"(page=home | none) & id=2 & !date=now"`.
	 *
	 * Operator:
	 *
	 * * `&` = AND
	 * * `|` = OR
	 * * `!` = NOT
	 * * `none` = true
	*/
	Query: 'br:query',

	/**
	 * Complex media query. Equal to how implement media query in CSS.
	 *
	 * Example: `"(not (width > 1000px)) and (color), print and (color)"`
	 * */
	Media: 'br:media',

	AnimationFor               : 'br:animation-for',

	/** `Keyframe[] | PropertyIndexedKeyframes` */
	AnimationStartKeyframes    : 'br:animation-start-keyframes',
	AnimationStartEasing       : 'br:animation-start-easing',
	AnimationStartDuration     : 'br:animation-start-duration',
	AnimationStartDelayDuration: 'br:animation-start-delay-duration',

	/** `Keyframe[] | PropertyIndexedKeyframes` */
	AnimationEndKeyframes      : 'br:animation-end-keyframes',
	AnimationEndEasing         : 'br:animation-end-easing',
	AnimationEndDuration       : 'br:animation-end-duration',
	AnimationEndDelayDuration  : 'br:animation-end-delay-duration',
} as const
export type Attributes = typeof Attributes[keyof typeof Attributes]

export const EventTypes = {
	Toggle: 'br:toggle'
} as const
export type EventTypes = typeof EventTypes[keyof typeof EventTypes]

export const TAGNAME = 'br-if'
const ELEMENTS = new Set<BiruIfElement>()
const STYLES = new CSSStyleSheet()

export class BiruIfElement extends HTMLElement {
	private _shadowRoot: ShadowRoot
	private _container: HTMLDivElement
	private _media: MediaQueryList | undefined
	private _animations = new Set<Animation>()

	static observedAttributes = [
		Attributes.Path,
		Attributes.Query,
		Attributes.Hash,
		Attributes.Media
	]

	constructor() {
		super()
		this._shadowRoot = this.attachShadow({mode: 'open'})
		this._shadowRoot.adoptedStyleSheets = [STYLES]
		this._container = document.createElement('div')
		this._container.append(document.createElement('slot'))
		this._shadowRoot.append(this._container)
	}

	connectedCallback(): void {
		this._media?.addEventListener('change', this)
		ELEMENTS.add(this)
		_checkElementsState(this)
	}

	disconnectedCallback(): void {
		ELEMENTS.delete(this)
		this._media?.removeEventListener('change', this)
	}

	attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null): void {
		switch (name as Attributes) {
		case Attributes.Path:
		case Attributes.Query:
		case Attributes.Hash:
			_checkElementsState(this)
			break
		case Attributes.Media:
			this._media?.removeEventListener('change', this)
			this._media = undefined
			if (newValue) {
				this._media = window.matchMedia(newValue)
				this._media?.addEventListener('change', this)
			}
		}
	}

	handleEvent(ev: Event) {
		switch (ev.type) {
		case 'change':
			_checkElementsState(this)
		}
	}

	get biru() {
		const self = this

		return {
			get animationFor() {
				const ids = (self.getAttribute(Attributes.AnimationFor) || '').split(/ +/g)
				const elements: Element[] = []
				for (const id of ids) {
					const element = document.getElementById(id.trim())
					if (element) {
						elements.push(element)
					}
				}

				return elements
			},
			set animationFor(elements: Element[]) {
				const ids = new Set<string>()
				for (const element of elements) {
					let id = element.id
					if (id.trim().length === 0) {
						id = crypto.randomUUID()
						element.id = id
					}

					ids.add(id)
				}

				self.setAttribute(Attributes.AnimationFor, ids.values().toArray().join(' '))
			},
			get animationStartKeyframes(): Keyframe[] | PropertyIndexedKeyframes | null {
				return self.hasAttribute(Attributes.AnimationStartKeyframes)
					? JSON.parse(self.getAttribute(Attributes.AnimationStartKeyframes)!)
					: null
			},
			set animationStartKeyframes(value: Keyframe[] | PropertyIndexedKeyframes | null) {
				if (value === null) {
					self.removeAttribute(Attributes.AnimationStartKeyframes)
					return
				}

				self.setAttribute(Attributes.AnimationStartKeyframes, JSON.stringify(value))
			},
			get animationEndKeyframes(): Keyframe[] | PropertyIndexedKeyframes | null {
				return self.hasAttribute(Attributes.AnimationEndKeyframes)
					? JSON.parse(self.getAttribute(Attributes.AnimationEndKeyframes)!)
					: null
			},
			set animationEndKeyframes(value: Keyframe[] | PropertyIndexedKeyframes | null) {
				if (value === null) {
					self.removeAttribute(Attributes.AnimationEndKeyframes)
					return
				}
				self.setAttribute(Attributes.AnimationEndKeyframes, JSON.stringify(value))
			},
			get animationStartDuration(): number {
				const d = self.getAttribute(Attributes.AnimationStartDuration)
				if (!d) {
					return 0
				}

				const parsed = Number.parseFloat(d)
				return Number.isNaN(parsed) || !Number.isFinite(parsed)? 0 : parsed
			},
			set animationStartDuration(value: number) {
				self.setAttribute(Attributes.AnimationStartDuration, value + '')
			},
			get animationEndDuration(): number {
				const d = self.getAttribute(Attributes.AnimationEndDuration)
				if (!d) {
					return 0
				}

				const parsed = Number.parseFloat(d)
				return Number.isNaN(parsed) || !Number.isFinite(parsed)? 0 : parsed
			},
			set animationEndDuration(value: number) {
				self.setAttribute(Attributes.AnimationEndDuration, value + '')
			},
			get animationStartDelayDuration(): number {
				const d = self.getAttribute(Attributes.AnimationStartDelayDuration)
				if (!d) {
					return 0
				}

				const parsed = Number.parseFloat(d)
				return Number.isNaN(parsed) || !Number.isFinite(parsed)? 0 : parsed
			},
			set animationStartDelayDuration(value: number) {
				self.setAttribute(Attributes.AnimationStartDelayDuration, value + '')
			},
			get animationEndDelayDuration(): number {
				const d = self.getAttribute(Attributes.AnimationEndDelayDuration)
				if (!d) {
					return 0
				}

				const parsed = Number.parseFloat(d)
				return Number.isNaN(parsed) || !Number.isFinite(parsed)? 0 : parsed
			},
			set animationEndDelayDuration(value: number) {
				self.setAttribute(Attributes.AnimationEndDelayDuration, value + '')
			},
			get animationStartEasing(): string | undefined {
				return self.getAttribute(Attributes.AnimationStartEasing) || "cubic-bezier(.25,0,0,1)"
			},
			set animationStartEasing(value: string | undefined) {
				if (value === undefined) {
					self.removeAttribute(Attributes.AnimationStartEasing)
					return
				}

				self.setAttribute(Attributes.AnimationStartEasing, value)
			},
			get animationEndEasing(): string {
				return self.getAttribute(Attributes.AnimationEndEasing) || "cubic-bezier(.25,0,0,1)"
			},
			set animationEndEasing(value: string | undefined) {
				if (value === undefined) {
					self.removeAttribute(Attributes.AnimationEndEasing)
					return
				}

				self.setAttribute(Attributes.AnimationEndEasing, value)
			},
			get path() {
				return self.getAttribute(Attributes.Path)?.split(/ +/) ?? []
			},
			set path(values: string[]) {
				if (values.length === 0) {
					self.removeAttribute(Attributes.Path)
					return
				}

				self.setAttribute(Attributes.Path, values.join(' '))
			},
			get query(): string {
				return (self.getAttribute(Attributes.Query) ?? '').replaceAll(' ', '')
			},
			set query(value: string | null) {
				if (value === null) {
					self.removeAttribute(Attributes.Query)
					return
				}

				self.setAttribute(Attributes.Query, value)
			},
			get hash() {
				return (
					self.getAttribute(Attributes.Hash)
					?.split(/ +/)
					.map(v => v.startsWith('#')? v : `#${v}`)
					?? []
				)
			},
			set hash(values: string[]) {
				if (values.length === 0) {
					self.removeAttribute(Attributes.Hash)
					return
				}

				self.setAttribute(Attributes.Hash, values.join(' '))
			},
			get media(): MediaQueryList | undefined {
				return self._media
			},
			set media(value: string | null) {
				if (value === null) {
					self.removeAttribute(Attributes.Media)
					return
				}

				self.setAttribute(Attributes.Media, value)
			},
			show() {
				self._container.style.setProperty('display', 'contents')
				const elements = this.animationFor
				const keyframes = this.animationStartKeyframes
				const duration = this.animationStartDuration
				const easing = this.animationStartEasing
				const delay = this.animationStartDelayDuration
				for (const element of elements) {
					const animations = element.getAnimations()
					for (const animation of animations) {
						if (self._animations.has(animation)) {
							animation.cancel()
						}
					}

					if (!keyframes || elements.length === 0) {
						continue
					}

					// in case invalid keyframes
					try {
						const animation = element.animate(keyframes, {duration, easing, delay})
						self._animations.add(animation)
						animation.finished.catch(() => {}).finally(() => self._animations.delete(animation))
					}
					catch  {}
				}
			},
			hide() {
				const elements = this.animationFor
				const keyframes = this.animationEndKeyframes
				const duration = this.animationEndDuration
				const easing = this.animationEndEasing
				const delay = this.animationEndDelayDuration
				const animations: Animation[] = []
				for (const element of elements) {
					const animations = element.getAnimations()
					for (const animation of animations) {
						if (self._animations.has(animation)) {
							animation.cancel()
						}
					}

					if (!keyframes || elements.length === 0) {
						continue
					}

					// in case invalid keyframes
					try {
						const animation = element.animate(keyframes, {duration, easing, delay})
						self._animations.add(animation)
						animation.finished.catch(() => {}).finally(() => self._animations.delete(animation))
						animations.push(animation)
					}
					catch  {}
				}

				Promise.all(animations.map(v => v.finished)).catch(() => {}).finally(() => {
					self._container.style.setProperty('display', 'none')
				})
			},
			isVisible() {
				const media = this.media
				const path  = this.path
				const query = this.query
				const hash  = this.hash
				if (
					media === undefined
					&& path.length === 0
					&& query.length === 0
					&& hash.length === 0
				) {
					return true
				}

				let isMatch = true

				// 1. Check Path (br:path)
				if (path.length > 0 && !path.includes(location.pathname)) {
					isMatch = false
				}

				// 2. Check Hash (br:hash)
				if (isMatch && hash.length > 0 && !hash.includes(location.hash)) {
					isMatch = false
				}

				// 3. Check Queries (br:query)
				if (isMatch && query.length > 0) {
					const parser = new QueryValidation(query, new URLSearchParams(window.location.search))
					if (!parser.evaluate()) {
						isMatch = false
					}
				}

				// 4. Check media query (br:media)
				if (isMatch && media !== undefined && !media.matches) {
					isMatch = false
				}

				return isMatch
			}
		}
	}
}

function _checkElementsState(element?: BiruIfElement | undefined): void {
	for (const el of (element? [element] : ELEMENTS)) {
		if (el.biru.isVisible()) {
			el.biru.show()
		}
		else {
			el.biru.hide()
		}

		el.dispatchEvent(new Event(EventTypes.Toggle))
	}
}

function _initListeners(): void {
	listenRouteChange(() => _checkElementsState())
}

function _initDefaultStyles(): void {
	STYLES.replaceSync(`
		:host, div {
			display: contents
		}
	`)
}

export function define(): void {
	if (customElements.get(TAGNAME)) {
		return
	}

	_initListeners()
	_initDefaultStyles()
	customElements.define(TAGNAME, BiruIfElement)
}

define()