import * as BrTheme from './br-theme.js'
import { slotEmptyListeners } from "../utils.js"

export const Slots = {
	LeftSideBar: 'left-sidebar',
	RightSideBar: 'right-sidebar',
	AppBar: 'appbar',
	BottomBar: 'bottombar'
} as const
export type Slots = typeof Slots[keyof typeof Slots]

export const Parts = {
	Scaffold: 'scaffold',
	LeftSideBar: 'left-sidebar',
	RightSideBar: 'right-sidebar',
	Container: 'container',
	AppBar: 'appbar',
	Body: 'body',
	BottomBar: 'bottombar',
} as const
export type Parts = typeof Parts[keyof typeof Parts]

export const TAGNAME = 'br-scaffold'
const STYLES = new CSSStyleSheet()

export class BiruScaffoldElement extends HTMLElement {
	private _emptySlotListenerDesctructor: (() => unknown) | undefined

	constructor() {
		super()
		const shadow = this.attachShadow({mode: 'open'})
		shadow.adoptedStyleSheets = [STYLES]
		shadow.innerHTML = `<div part="${Parts.Scaffold}">
			<div part="${Parts.AppBar}"><slot name="${Slots.AppBar}"></slot></div>
			<div part="${Parts.Container}">
				<div part="${Parts.LeftSideBar}"><slot name="${Slots.LeftSideBar}"></slot></div>
				<div part="${Parts.Body}"><slot></slot></div>
				<div part="${Parts.RightSideBar}"><slot name="${Slots.RightSideBar}"></slot></div>
			</div>
			<div part="${Parts.BottomBar}"><slot name="${Slots.BottomBar}"></slot></div>
		</div>`
	}

	connectedCallback(): void {
		this._emptySlotListenerDesctructor = slotEmptyListeners(this.shadowRoot!,
			[Slots.AppBar, Parts.AppBar],
			[Slots.BottomBar, Parts.BottomBar],
			[Slots.LeftSideBar, Parts.LeftSideBar],
			[Slots.RightSideBar, Parts.RightSideBar],
		)
	}

	disconnectedCallback(): void {
		this._emptySlotListenerDesctructor?.()
	}
}

function _initDefaultStyles(): void {
	STYLES.replaceSync(`:host, [part="${Parts.Scaffold}"] {
	max-height: 100dvh;
	max-width: 100%;
	width: 100%;
	height: 100dvh;
	display: flex;
	flex-direction: column;
	align-items: stretch;
	justify-content: stretch;
	overflow: hidden;
	background-color: rgb(var(${BrTheme.CSSVars.ColorBackground}));
}

[part="${Parts.Container}"] {
	overflow: auto;
	flex: 1;
	max-width: 100%;
	max-height: 100dvh;
	display: flex;
	flex-direci
	align-items: stretch;
	justify-content: stretch;
}

[part="${Parts.Body}"] {
	flex: 1;
	max-width: 100%;
	max-height: 100%;
}

[part="${Parts.LeftSideBar}"], [part="${Parts.RightSideBar}"] {
	max-height: 100%;
	overflow: auto;
}

:is(
	[part="${Parts.AppBar}"],
	[part="${Parts.LeftSideBar}"],
	[part="${Parts.RightSideBar}"],
	[part="${Parts.BottomBar}"]
).empty {
	display: none;
}`)
}

export function define(): void {
	if (customElements.get(TAGNAME)) {
		return
	}

	_initDefaultStyles()
	customElements.define(TAGNAME, BiruScaffoldElement)
}

define()