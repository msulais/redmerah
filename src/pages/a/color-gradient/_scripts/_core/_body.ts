import { CButton } from "@/components/Button"
import { CSSClasses } from "../../_styles/_css"
import { $, $$, $$$ } from "./_dom-utils"
import { CPopover } from "@/components/Popover"
import { ElementIds } from "../_shared/_ids"

const _ref_gradControlPopover = $(ElementIds.bdGrad_controlPopover) as CPopover.CElement
const _ref_editor = $$<HTMLDivElement>(`.${CSSClasses.bodyEditor}`)
const _refs_editor = $$$<HTMLDetailsElement>(`.${CSSClasses.bodyEditor}> details`)
const _refs_gradientControl = $$$<HTMLDetailsElement>(`.${CSSClasses.bodyGradientControl} details`)
const _resizePopoverObserver = new ResizeObserver((entries) => {
	for (const entry of entries) {
		const target = entry.target as CPopover.CElement
		CPopover.reposition(target, true)
	}
})

function _initObserver(): void {
	_resizePopoverObserver.observe(_ref_gradControlPopover, {
		box: 'border-box'
	})
}

function _initEvents(): void {
	for (const ref of _refs_editor) {
		const summary = $$<HTMLElement>(`summary`, ref)
		const callback = () => {
			if (ref.open) {
				summary?.setAttribute(CButton.Attributes.Variant, CButton.Variant.Filled)
			}	else {
				summary?.removeAttribute(CButton.Attributes.Variant)
			}
		}
		callback()
		ref.addEventListener('toggle', callback)
	}

	for (const ref of _refs_gradientControl) {
		const summary = $$<HTMLElement>(`summary`, ref)
		const callback = () => {
			summary?.setAttribute(
				CButton.Attributes.Variant,
				ref.open? CButton.Variant.Filled : CButton.Variant.Tonal
			)
		}
		callback()
		ref.addEventListener('toggle', callback)
	}

	_ref_editor?.addEventListener('focusin', ev => {
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