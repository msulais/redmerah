import { splitProps, type JSX, type ParentComponent } from "solid-js"

import { documentActive } from "@/utils/document"
import { elementTagName, elementFocusByArrowKey, elementContains, elementChildrenRemoveTabIndex, elementChildrenTabIndex, elementTabIndexSet, elementIsChild, elementIsFocusable } from "@/utils/element"
import { eventCall, eventCurrentTarget, eventPreventDefault } from "@/utils/event"
import { KEY_ARROW_LEFT, KEY_ARROW_RIGHT } from "@/constants/key_code"
import { attrClassList } from "@/utils/attributes"
import { timeTimerClear, timeTimerSet } from "@/utils/time"
import { typeIsNumber } from "@/utils/typecheck"

import './index.scss'

const FOCUSABLEGROUP_CLASSNAME = 'c-focusable-group'

type FocusableGroupProps = JSX.HTMLAttributes<HTMLDivElement> & {
	/**
	 * if `true`, the default behaviour of `'keydown'` event
	 * that control focus with arrow key will not fired
	 */
	'c:customArrowFocus'?: boolean
	'c:arrowOptions'?: {
		up?: "next" | "prev"
		down?: "next" | "prev"
		left?: "next" | "prev"
		right?: "next" | "prev"
	}
	'c:onBeforeSetTabIndex'?(el: HTMLElement): boolean
	'c:onBeforeChangeFocus'?(el: HTMLElement): boolean
}
const FocusableGroup: ParentComponent<FocusableGroupProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'class', 'onFocusIn', 'children', 'onFocusOut',
		'onKeyDown', 'c:onBeforeSetTabIndex', 'c:customArrowFocus',
		'c:arrowOptions', 'c:onBeforeChangeFocus'
	])
	let isTabIndexRemoved: boolean = true
	let isFocusByArrowKey: boolean = false
	let elementWithTabIndexZero: HTMLElement | null = null
	let timeId: number | null = null

	return <div
		class={attrClassList(FOCUSABLEGROUP_CLASSNAME, props.class)}
		onFocusIn={ev => {
			eventCall(ev, props.onFocusIn)
			const self = eventCurrentTarget(ev)

			// 'focusin' event fired before `from_arrow_key` assigned
			timeTimerSet(() => {
				if (!isTabIndexRemoved) {
					if (!isFocusByArrowKey && elementWithTabIndexZero) {
						const is_child = elementIsChild(documentActive()!, self)
						if (is_child) {
							elementTabIndexSet(documentActive()!, 0)
							elementTabIndexSet(elementWithTabIndexZero, -1)
						}
					}
					isFocusByArrowKey = false
					return
				}

				elementWithTabIndexZero = elementChildrenTabIndex(
					self,
					props['c:onBeforeSetTabIndex'] ?? elementIsFocusable
				)
				isTabIndexRemoved = false
				isFocusByArrowKey = false
			})
		}}
		onFocusOut={ev => {
			eventCall(ev, props.onFocusOut)
			const self = eventCurrentTarget(ev)

			if (typeIsNumber(timeId)) timeTimerClear(timeId!)
			timeId = timeTimerSet(() => {
				timeId = null
				const active_el = documentActive()
				if (active_el && elementContains(self, active_el)) return

				elementChildrenRemoveTabIndex(self, props['c:onBeforeSetTabIndex'])
				isTabIndexRemoved = true
			}, 200)
		}}
		onKeyDown={ev => {
			eventCall(ev, props.onKeyDown)
			if (props['c:customArrowFocus']) return

			const active = documentActive()
			if (!active) return

			const code = ev.code
			const tagName = elementTagName(active)
			if (tagName == 'INPUT' && (code == KEY_ARROW_RIGHT || code == KEY_ARROW_LEFT)) return
			if (tagName == 'TEXTAREA') return

			elementWithTabIndexZero = elementFocusByArrowKey(
				eventCurrentTarget(ev),
				code,
				props['c:arrowOptions'],
				props['c:onBeforeChangeFocus'] ?? elementIsFocusable
			)
			if (elementWithTabIndexZero) {
				isFocusByArrowKey = true
				eventPreventDefault(ev) // disable scroll
			}
		}}
		{...other}>
		{props.children}
	</div>
}

export {
	FocusableGroup,
	FOCUSABLEGROUP_CLASSNAME
}
export type {
	FocusableGroupProps
}
export default FocusableGroup