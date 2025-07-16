import { ButtonAttributes, ButtonVariant } from "@/components/Button"
import { CSSClasses } from "../../_styles/_css"
import { $, $$, $$$ } from "./_dom-utils"
import { repositionEdgePopoverRef, type PopoverElement } from "@/components/Popover"
import { ElementIds } from "../_shared/_ids"

const _gradControlPopoverRef = $(ElementIds.bdGrad_controlPopover) as PopoverElement
const _editorRef = $$<HTMLDivElement>(`.${CSSClasses.bodyEditor}`)
const _editorRefs = $$$<HTMLDetailsElement>(`.${CSSClasses.bodyEditor}> details`)
const _gradientControlRefs = $$$<HTMLDetailsElement>(`.${CSSClasses.bodyGradientControl} details`)
const _resizePopoverObserver = new ResizeObserver((entries) => {
	for (const entry of entries) {
		const target = entry.target as PopoverElement
		repositionEdgePopoverRef(target)
	}
})

function _initObserver(): void {
	_resizePopoverObserver.observe(_gradControlPopoverRef, {
		box: 'border-box'
	})
}

function _initEvents(): void {
	for (const ref of _editorRefs) {
		const summary = $$<HTMLElement>(`summary`, ref)
		const callback = () => {
			if (ref.open) {
				summary?.setAttribute(ButtonAttributes.variant, ButtonVariant.filled)
			}	else {
				summary?.removeAttribute(ButtonAttributes.variant)
			}
		}
		callback()
		ref.addEventListener('toggle', callback)
	}

	for (const ref of _gradientControlRefs) {
		const summary = $$<HTMLElement>(`summary`, ref)
		const callback = () => {
			summary?.setAttribute(
				ButtonAttributes.variant,
				ref.open? ButtonVariant.filled : ButtonVariant.tonal
			)
		}
		callback()
		ref.addEventListener('toggle', callback)
	}

	_editorRef?.addEventListener('focusin', ev => {
		const target = ev.target
		if (target instanceof HTMLInputElement && target.type === 'number') {
			target.select()
		}
	})
}

export default () => {
	_initEvents()
	_initObserver()
}