export const STYLES  = new CSSStyleSheet()
export const TAGNAME = 'br-appbar'

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
	Flex: 'flex'
} as const
export type Parts = typeof Parts[keyof typeof Parts]

const SHADOW_ROOT_INNER_HTML = `<header part="${Parts.Header}">
	<div part="${Parts.Leading}"><slot name="${Slots.Leading}"></slot></div>
	<div part="${Parts.Content}">
		<h2 part="${Parts.Headline}"><slot name="${Slots.Headline}"></slot></h2>
		<slot></slot>
	</div>
	<div part="${Parts.Flex}"></div>
	<div part="${Parts.Trailing}"><slot name="${Slots.Trailing}"></slot></div>
</header>`

export class BiruAppBarElement extends HTMLElement {
	private _headline: HTMLHeadingElement

	constructor() {
		super()
		const shadow = this.attachShadow({mode: 'open'})
		shadow.innerHTML = SHADOW_ROOT_INNER_HTML
		shadow.adoptedStyleSheets = [STYLES]
		this._headline = shadow.querySelector<HTMLHeadingElement>('h2')!
	}

	get $headline(): string {
		return this._headline.textContent
	}

	set $headline(value: string) {
		this._headline.textContent = value
	}
}

function _initDefaultStyle(): void {
	STYLES.replaceSync(`
:host {
	padding: .5rem;
	width: 100%;
}

:host, header {
	width: 100%;
	display: flex;
	align-items: center;
	gap: .25rem;
}

[part="${Parts.Content}"] {
	display: flex;
	align-items: center;
	gap: .5rem;
	overflow: hidden;
}

[part="${Parts.Headline}"] {
	font-size: 1.25rem;
	font-weight: 500;
	overflow: hidden;
	text-overflow: ellipsis;
	text-wrap: nowrap;
	display: flex;
	gap: 1rem;
	padding-right: 1rem;
	margin: 0;
}

[part="${Parts.Flex}"] {
	flex: 1;
}

[part="${Parts.Leading}"], [part="${Parts.Trailing}"] {
	display: flex;
	align-items: center;
	gap: .125rem;
}

[part="${Parts.Leading}"]:not(:empty) {
	padding-right: .5rem;
}

[part="${Parts.Trailing}"]:not(:empty) {
	padding-left: .5rem;
}

:is([part="${Parts.Leading}"], [part="${Parts.Headline}"], [part="${Parts.Trailing}"]):empty {
	display: none !important;
}
`)
}

export function define(): void {
	if (customElements.get(TAGNAME)) {
		return
	}

	_initDefaultStyle()
	customElements.define(TAGNAME, BiruAppBarElement)
}

define()