import { splitProps, type JSX, type ParentComponent } from "solid-js"

import { document_active } from "@/utils/document"
import { element_tagname, element_focus_by_arrowkey, element_contains, element_children_remove_tabindex, element_children_tabindex, element_set_tabindex, element_is_child, element_focusable } from "@/utils/element"
import { event_call, event_current_target, event_prevent_default } from "@/utils/event"
import { KEY_ARROW_LEFT, KEY_ARROW_RIGHT } from "@/constants/key_code"
import { classlist } from "@/utils/attributes"
import { timeout_clear, timeout_set } from "@/utils/timeout"
import { is_number } from "@/utils/typecheck"

import './index.scss'

type FocusableGroupProps = JSX.HTMLAttributes<HTMLDivElement> & {
	/**
	 * if `true`, the default behaviour of `'keydown'` event
	 * that control focus with arrow key will not fired
	 */
	custom_arrow_focus?: boolean
	arrow_options?: {
		up?: "next" | "prev"
		down?: "next" | "prev"
		left?: "next" | "prev"
		right?: "next" | "prev"
	}
	on_before_set_tabindex?(el: HTMLElement): boolean
	on_before_change_focus?(el: HTMLElement): boolean
}
const FocusableGroup: ParentComponent<FocusableGroupProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'class', 'onFocusIn', 'children', 'onFocusOut',
		'onKeyDown', 'on_before_set_tabindex', 'custom_arrow_focus',
		'arrow_options', 'on_before_change_focus'
	])
	let tabindex_removed: boolean = true
	let focus_by_arrow_key: boolean = false
	let element_with_tabindex_zero: HTMLElement | null = null
	let timeout_id: number | null = null

	return <div
		class={classlist("c-focusable-group", props.class)}
		onFocusIn={ev => {
			event_call(ev, props.onFocusIn)
			const self = event_current_target(ev)

			// 'focusin' event fired before `from_arrow_key` assigned
			timeout_set(() => {
				if (!tabindex_removed) {
					if (!focus_by_arrow_key && element_with_tabindex_zero) {
						const is_child = element_is_child(document_active()!, self)
						if (is_child) {
							element_set_tabindex(document_active()!, 0)
							element_set_tabindex(element_with_tabindex_zero, -1)
						}
					}
					focus_by_arrow_key = false
					return
				}

				element_with_tabindex_zero = element_children_tabindex(
					self,
					props.on_before_set_tabindex ?? element_focusable
				)
				tabindex_removed = false
				focus_by_arrow_key = false
			})
		}}
		onFocusOut={ev => {
			event_call(ev, props.onFocusOut)
			const self = event_current_target(ev)

			if (is_number(timeout_id)) timeout_clear(timeout_id!)
			timeout_id = timeout_set(() => {
				timeout_id = null
				const active_el = document_active()
				if (active_el && element_contains(self, active_el)) return

				element_children_remove_tabindex(self, props.on_before_set_tabindex)
				tabindex_removed = true
			}, 200)
		}}
		onKeyDown={ev => {
			event_call(ev, props.onKeyDown)
			if (props.custom_arrow_focus) return

			const active = document_active()
			if (!active) return

			const code = ev.code
			const tag_name = element_tagname(active)
			if (tag_name == 'INPUT' && (code == KEY_ARROW_RIGHT || code == KEY_ARROW_LEFT)) return
			if (tag_name == 'TEXTAREA') return

			element_with_tabindex_zero = element_focus_by_arrowkey(
				event_current_target(ev),
				code,
				props.arrow_options,
				props.on_before_change_focus ?? element_focusable
			)
			if (element_with_tabindex_zero) {
				focus_by_arrow_key = true
				event_prevent_default(ev) // disable scroll
			}
		}}
		{...other}>
		{props.children}
	</div>
}

export {
	FocusableGroup
}
export type {
	FocusableGroupProps
}
export default FocusableGroup