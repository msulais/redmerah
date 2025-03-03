import { mergeRefs } from "@solid-primitives/refs"
import { children, createEffect, createMemo, splitProps, type JSX, type ParentComponent } from "solid-js"

import { keyboardOnFocusIn, keyboardOnFocusOut, keyboardOnKeyDown, keyboardOnKeyDown2D } from "@/utils/keyboard"
import { eventCall } from "@/utils/event"
import { cssIsValidSelector } from "@/utils/css"

import './index.scss'

const INTERACTIVE_ELEMENT_SELECTOR = (
	':is('
		+ '[contenteditable],'
		+ '[tabindex],'
		+ 'a[href],'
		+ 'area[href],'
		+ 'button,'
		+ 'select,'
		+ 'input,'
		+ 'textarea,'
		+ 'iframe,'
		+ 'summary'
	+ ')'
)
const FOCUSABLEGROUP_CLASSNAME = 'c-focusable-group'

type FocusableGroupProps = JSX.HTMLAttributes<HTMLDivElement> & {
	'c:elements'?: string | HTMLElement[]
	'c:arrowOptions': {
		up?: "next" | "prev"
		down?: "next" | "prev"
		left?: "next" | "prev"
		right?: "next" | "prev"
	}
}
const FocusableGroup: ParentComponent<FocusableGroupProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'class', 'onFocusIn', 'children', 'onFocusOut',
		'onKeyDown', 'c:elements', 'c:arrowOptions',
		'ref'
	])
	const hasClassName = createMemo<boolean>(() => {
		const classList = other.classList
		if (!classList) return false

		const values = Object.values<boolean | undefined>(classList)
		for (const value of values) {
			if (value === true) return true
		}

		return false
	})
	const elements: HTMLElement[] = []
	const content = children(() => props.children)
	let timeOnFocusInId: number | NodeJS.Timeout | null = null
	let divRef: HTMLDivElement

	function updateElements(): void {
		if (timeOnFocusInId !== null) return

		const $elements = props["c:elements"]
		if (Array.isArray($elements)) {
			elements.length = 0
			elements.push(...($elements as HTMLElement[]))
		}
		else if (typeof $elements === 'string' && cssIsValidSelector($elements as string)) {
			elements.length = 0
			elements.push(...divRef.querySelectorAll<HTMLElement>($elements))
		}
		else {
			elements.length = 0
			elements.push(...divRef.querySelectorAll<HTMLElement>(INTERACTIVE_ELEMENT_SELECTOR))
		}

		timeOnFocusInId = setTimeout(
			() => timeOnFocusInId = null,
			200
		)
	}

	createEffect(() => {
		const $elements = props["c:elements"]
		content() // trigger effect

		if (Array.isArray($elements)) {
			elements.length = 0
			elements.push(...($elements as HTMLElement[]))
		}
		else if (typeof $elements === 'string' && cssIsValidSelector($elements as string)) {
			elements.length = 0
			elements.push(...divRef.querySelectorAll<HTMLElement>($elements))
		}
		else {
			elements.length = 0
			elements.push(...divRef.querySelectorAll<HTMLElement>(INTERACTIVE_ELEMENT_SELECTOR))
		}
	})

	return <div
		ref={mergeRefs(props.ref, r => divRef = r)}
		class={props.class ?? (hasClassName()? undefined : FOCUSABLEGROUP_CLASSNAME)}
		onFocusIn={ev => {
			eventCall(ev, props.onFocusIn)
			updateElements()
			keyboardOnFocusIn(ev, elements)
		}}
		onFocusOut={ev => {
			eventCall(ev, props.onFocusOut)
			keyboardOnFocusOut(ev, elements)
		}}
		onKeyDown={ev => {
			eventCall(ev, props.onKeyDown)
			keyboardOnKeyDown(ev, elements, props["c:arrowOptions"])
		}}
		{...other}>
		{content()}
	</div>
}

type FocusableGroup2DProps = JSX.HTMLAttributes<HTMLDivElement> & {
	'c:elements'?: string | HTMLElement[]
	'c:columnCount': number
}
const FocusableGroup2D: ParentComponent<FocusableGroup2DProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'class', 'onFocusIn', 'children', 'onFocusOut',
		'onKeyDown', 'c:elements', 'c:columnCount',
		'ref'
	])
	const hasClassName = createMemo<boolean>(() => {
		const classList = other.classList
		if (!classList) return false

		const values = Object.values<boolean | undefined>(classList)
		for (const value of values) {
			if (value === true) return true
		}

		return false
	})
	const elements: HTMLElement[] = []
	const content = children(() => props.children)
	let timeOnFocusInId: number | NodeJS.Timeout | null = null
	let divRef: HTMLDivElement

	function updateElements(): void {
		if (timeOnFocusInId !== null) return

		const $elements = props["c:elements"]
		if (Array.isArray($elements)) {
			elements.length = 0
			elements.push(...($elements as HTMLElement[]))
		}
		else if (typeof $elements === 'string' && cssIsValidSelector($elements as string)) {
			elements.length = 0
			elements.push(...divRef.querySelectorAll<HTMLElement>($elements))
		}
		else {
			elements.length = 0
			elements.push(...divRef.querySelectorAll<HTMLElement>(INTERACTIVE_ELEMENT_SELECTOR))
		}

		timeOnFocusInId = setTimeout(
			() => timeOnFocusInId = null,
			200
		)
	}

	createEffect(() => {
		const $elements = props["c:elements"]
		content() // trigger effect

		divRef.classList.length > 0

		if (Array.isArray($elements)) {
			elements.length = 0
			elements.push(...($elements as HTMLElement[]))
		}
		else if (typeof $elements === 'string' && cssIsValidSelector($elements as string)) {
			elements.length = 0
			elements.push(...divRef.querySelectorAll<HTMLElement>($elements))
		}
		else {
			elements.length = 0
			elements.push(...divRef.querySelectorAll<HTMLElement>(INTERACTIVE_ELEMENT_SELECTOR))
		}
	})

	return <div
		ref={mergeRefs(props.ref, r => divRef = r)}
		class={props.class ?? (hasClassName()? undefined : FOCUSABLEGROUP_CLASSNAME)}
		onFocusIn={ev => {
			eventCall(ev, props.onFocusIn)
			updateElements()
			keyboardOnFocusIn(ev, elements)
		}}
		onFocusOut={ev => {
			eventCall(ev, props.onFocusOut)
			keyboardOnFocusOut(ev, elements)
		}}
		onKeyDown={ev => {
			eventCall(ev, props.onKeyDown)
			keyboardOnKeyDown2D(ev, elements, props["c:columnCount"])
		}}
		{...other}>
		{content()}
	</div>
}

export {
	FocusableGroup,
	FocusableGroup2D,
	FOCUSABLEGROUP_CLASSNAME
}
export type {
	FocusableGroupProps,
	FocusableGroup2DProps
}
export default FocusableGroup