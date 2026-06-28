import { listenDocumentEvent } from '../event-registry.js'
import { GlobalAttributes } from '../global-attributes.js'
import * as BrPopover from './br-popover.js'
import * as BrTheme from './br-theme.js'
import * as Button from './button.js'

export const TAGNAME = ':where(menu:not([br\\:as~="!menu"]),[br\\:as~=menu])'
let _isDefined = false

function _findAndClosePopover(target: HTMLElement): void {
	let popover = target.closest<BrPopover.BiruPopoverElement>(BrPopover.TAGNAME)
	if (!popover) {
		return
	}

	while (true) {
		const next = (
			popover
			?.parentElement
			?.closest<BrPopover.BiruPopoverElement>(BrPopover.TAGNAME)
		) as BrPopover.BiruPopoverElement | null | undefined
		if (!next) {
			break
		}

		popover = next
	}

	popover?.biru.close()
}

function _initListeners(): void {
	listenDocumentEvent('click', (ev) => {
		const target = (ev.target as HTMLElement).closest<HTMLButtonElement>(Button.TAGNAME)
		if (
			!target
			|| target.tagName === 'LABEL'
			|| target.hasAttribute(GlobalAttributes.PreventDefault)
			|| !target.closest(`${TAGNAME}`)
		) {
			return
		}

		_findAndClosePopover(target)
	})

	listenDocumentEvent('change', (ev) => {
		const target = ev.target as HTMLInputElement
		const menu = target.closest(`${TAGNAME}`)
		if (
			target.hasAttribute(GlobalAttributes.PreventDefault)
			|| !menu
			|| !menu.closest(BrPopover.TAGNAME)
		) {
			return
		}

		_findAndClosePopover(target)
	})
}

function _initDefaultStyles(): void {
	const ELEMENT = `${BrTheme.TAGNAME} ${TAGNAME}`
	const ELEMENT_ITEM = `${ELEMENT} ${Button.TAGNAME}`
	const styles = new CSSStyleSheet()
	document.adoptedStyleSheets.push(styles)
	styles.replaceSync(`
${ELEMENT} {
	display: flex;
	flex-direction: column;
	align-items: stretch;
	list-style: none;
	padding: 0;
	gap: .25rem;
	width: 100%;
}

${ELEMENT} hr {
	position: relative;
	height: 1px;
	width: calc(100% + .5rem);
	left: -0.25rem;
	border: none;
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .12)
}

${ELEMENT_ITEM} {
	width: 100%;
	min-height: 1.75rem;
	white-space: nowrap;
	justify-content: flex-start;
}

@media (hover: none) {
	${ELEMENT_ITEM} {
		min-height: 3rem;
		min-width: 3rem;
		gap: .5rem;
		border-radius: 1.5rem;
	}
}

${ELEMENT_ITEM} input:where([type=checkbox],[type=radio]) {
	appearance: none;
	-webkit-appearance: none;
	width: 1.25rem;
	height: 1.25rem;
	border: none;
	outline: none;
	cursor: pointer;
	display: inline-grid;
	place-content: center;
}

${ELEMENT_ITEM} input[type=checkbox]::before {
	--url: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjBweCIgdmlld0JveD0iMCAtOTYwIDk2MCA5NjAiIHdpZHRoPSIyMHB4IiBmaWxsPSIjMDAwIj48cGF0aCBkPSJtNDAwLTQxNiAyMzYtMjM2cTExLTExIDI4LTExdDI4IDExcTExIDExIDExIDI4dC0xMSAyOEw0MjgtMzMycS0xMiAxMi0yOCAxMnQtMjgtMTJMMjY4LTQzNnEtMTEtMTEtMTEtMjh0MTEtMjhxMTEtMTEgMjgtMTF0MjggMTFsNzYgNzZaIi8+PC9zdmc+);
	-webkit-mask-image: var(--url);
	-webkit-mask-size: cover;
	background-color: rgb(var(${BrTheme.CSSVars.ColorAccent}));
	mask-image: var(--url);
	mask-size: cover;
	content: "";
	width: 1.5rem;
	height: 1.5rem;
	scale: 0;
	transition-duration: var(${BrTheme.CSSVars.DurationTransition});
	transition-timing-function: cubic-bezier(.25, 0, 0, 1);
}

@media (hover: none) {
	${ELEMENT_ITEM} input[type=checkbox]::before {
		width: 1.75rem;
		height: 1.75rem;
	}
}

${BrTheme.TAGNAME}[${CSS.escape(BrTheme.Attributes.ThemeMode)}=${BrTheme.ThemeMode.Dark}] :where(menu,[br\\:as~=menu]) :is(button,[br\\:as~=button]) input[type=checkbox]::before {
	--url: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjBweCIgdmlld0JveD0iMCAtOTYwIDk2MCA5NjAiIHdpZHRoPSIyMHB4IiBmaWxsPSIjZmZmIj48cGF0aCBkPSJtNDAwLTQxNiAyMzYtMjM2cTExLTExIDI4LTExdDI4IDExcTExIDExIDExIDI4dC0xMSAyOEw0MjgtMzMycS0xMiAxMi0yOCAxMnQtMjgtMTJMMjY4LTQzNnEtMTEtMTEtMTEtMjh0MTEtMjhxMTEtMTEgMjgtMTF0MjggMTFsNzYgNzZaIi8+PC9zdmc+);
}

@media (prefers-color-scheme: dark) {
	${BrTheme.TAGNAME}:where([${CSS.escape(BrTheme.Attributes.ThemeMode)}=${BrTheme.ThemeMode.Auto}],:not([${CSS.escape(BrTheme.Attributes.ThemeMode)}])) :where(menu,[br\\:as~=menu]) :is(button,[br\\:as~=button]) input[type=checkbox]::before {
		--url: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjBweCIgdmlld0JveD0iMCAtOTYwIDk2MCA5NjAiIHdpZHRoPSIyMHB4IiBmaWxsPSIjZmZmIj48cGF0aCBkPSJtNDAwLTQxNiAyMzYtMjM2cTExLTExIDI4LTExdDI4IDExcTExIDExIDExIDI4dC0xMSAyOEw0MjgtMzMycS0xMiAxMi0yOCAxMnQtMjgtMTJMMjY4LTQzNnEtMTEtMTEtMTEtMjh0MTEtMjhxMTEtMTEgMjgtMTF0MjggMTFsNzYgNzZaIi8+PC9zdmc+);
	}
}

${ELEMENT_ITEM} input[type=checkbox]:checked::before {
	scale: 1;
}

${ELEMENT_ITEM} input[type=radio]::before {
	content: "";
	width: .375rem;
	height: .375rem;
	border-radius: 999999px;
	transform: scale(0);
	transition-duration: var(${BrTheme.CSSVars.DurationTransition});
	background-color: rgb(var(${BrTheme.CSSVars.ColorAccent}));
	transition-timing-function: cubic-bezier(.25, 0, 0, 1);
}

@media (hover: none) {
	${ELEMENT_ITEM} input[type=radio]::before {
		width: .5rem;
		height: .5rem;
	}
}

${ELEMENT_ITEM} input[type=radio]:checked::before {
	transform: scale(1);
}
`)
}

export function define(): void {
	if (!document || !window || _isDefined) {
		return
	}

	_initListeners()
	_initDefaultStyles()
	_isDefined = true
}

BrPopover.define()
BrTheme.define()
Button.define()
define()