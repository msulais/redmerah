/*
Example:
```html
<br-appbar></br-appbar>
```
 */

import { slotEmptyListeners } from "../utils"

export const Slots = {
	Leading: 'leading',
	Headline: 'headline',
	Trailing: 'trailing'
} as const
export type Slots = typeof Slots[keyof typeof Slots]

export const Parts = {
	Header: 'header',
	Leading: 'leading',
	Content: 'content',
	Trailing: 'trailing',
	Headline: 'headline',
} as const
export type Parts = typeof Parts[keyof typeof Parts]

export const TAGNAME = 'br-appbar'
const STYLES = new CSSStyleSheet()

export class BiruAppBarElement extends HTMLElement {
	private _emptySlotListenerDesctructor: (() => unknown) | undefined

	constructor() {
		super()

		const shadow = this.attachShadow({mode: 'open'})
		shadow.adoptedStyleSheets = [STYLES]
		shadow.innerHTML = `<header part="${Parts.Header}">
	<div part="${Parts.Leading}"><slot name="${Slots.Leading}"></slot></div>
	<div part="${Parts.Content}">
		<h2 part="${Parts.Headline}"><slot name="${Slots.Headline}"></slot></h2>
		<slot></slot>
	</div>
	<div part="${Parts.Trailing}"><slot name="${Slots.Trailing}"></slot></div>
</header>`
	}

	connectedCallback(): void {
		this._emptySlotListenerDesctructor = slotEmptyListeners(this.shadowRoot!,
			[Slots.Leading, Parts.Leading],
			[Slots.Headline, Parts.Headline],
			[Slots.Trailing, Parts.Trailing],
		)
	}

	disconnectedCallback(): void {
		this._emptySlotListenerDesctructor?.()
	}
}

function _initDefaultStyles(): void {
	STYLES.replaceSync(`
:host {
	padding: .5rem;
	width: 100%;
}

:host, header {
	width: 100%;
	display: flex;
	align-items: center;
}

[part="${Parts.Content}"] {
	display: flex;
	align-items: center;
	overflow: hidden;
	flex: 1;
}

[part="${Parts.Headline}"] {
	font-size: 1.25rem;
	font-weight: 500;
	overflow: hidden;
	text-overflow: ellipsis;
	text-wrap: nowrap;
	display: flex;
	padding-right: 1rem;
	margin: 0;
}

[part="${Parts.Leading}"], [part="${Parts.Trailing}"] {
	display: flex;
	align-items: center;
}

:is([part="${Parts.Leading}"], [part="${Parts.Headline}"], [part="${Parts.Trailing}"]).empty {
	display: none !important;
}
`)
}

export function define(): void {
	if (customElements.get(TAGNAME)) {
		return
	}

	_initDefaultStyles()
	customElements.define(TAGNAME, BiruAppBarElement)
}

define()