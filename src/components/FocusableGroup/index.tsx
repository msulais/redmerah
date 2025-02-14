import { mergeRefs } from "@solid-primitives/refs"
import { children, createEffect, createMemo, splitProps, type JSX, type ParentComponent } from "solid-js"

import { keyboardOnFocusIn, keyboardOnFocusOut, keyboardOnKeyDown, keyboardOnKeyDown2D } from "@/utils/keyboard"
import { eventCall } from "@/utils/event"
import { arrayClear, arrayPush } from "@/utils/array"
import { typeIsArray, typeIsString } from "@/utils/typecheck"
import { elementAllBySelector } from "@/utils/element"
import { cssIsValidSelector } from "@/utils/css"
import { objectValues } from "@/utils/object"
import { timeTimerSet } from "@/utils/time"

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
		+ 'iframe'
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

		const values = objectValues<boolean | undefined>(classList)
		for (const value of values) {
			if (value === true) return true
		}

		return false
	})
	const elements: HTMLElement[] = []
	const content = children(() => props.children)
	let timeOnFocusInId: number | null = null
	let divRef: HTMLDivElement

	function updateElements(): void {
		if (timeOnFocusInId !== null) return

		const $elements = props["c:elements"]
		if (typeIsArray($elements)) {
			arrayClear(elements)
			arrayPush(elements, ...($elements as HTMLElement[]))
		}
		else if (typeIsString($elements) && cssIsValidSelector($elements as string)) {
			arrayClear(elements)
			arrayPush(elements, ...elementAllBySelector($elements as string, divRef))
		}
		else {
			arrayClear(elements)
			arrayPush(elements, ...elementAllBySelector(INTERACTIVE_ELEMENT_SELECTOR, divRef))
		}

		timeOnFocusInId = timeTimerSet(
			() => timeOnFocusInId = null,
			200
		)
	}

	createEffect(() => {
		const $elements = props["c:elements"]
		content() // trigger effect

		if (typeIsArray($elements)) {
			arrayClear(elements)
			arrayPush(elements, ...($elements as HTMLElement[]))
		}
		else if (typeIsString($elements) && cssIsValidSelector($elements as string)) {
			arrayClear(elements)
			arrayPush(elements, ...elementAllBySelector($elements as string, divRef))
		}
		else {
			arrayClear(elements)
			arrayPush(elements, ...elementAllBySelector(INTERACTIVE_ELEMENT_SELECTOR, divRef))
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

		const values = objectValues<boolean | undefined>(classList)
		for (const value of values) {
			if (value === true) return true
		}

		return false
	})
	const elements: HTMLElement[] = []
	const content = children(() => props.children)
	let timeOnFocusInId: number | null = null
	let divRef: HTMLDivElement

	function updateElements(): void {
		if (timeOnFocusInId !== null) return

		const $elements = props["c:elements"]
		if (typeIsArray($elements)) {
			arrayClear(elements)
			arrayPush(elements, ...($elements as HTMLElement[]))
		}
		else if (typeIsString($elements) && cssIsValidSelector($elements as string)) {
			arrayClear(elements)
			arrayPush(elements, ...elementAllBySelector($elements as string, divRef))
		}
		else {
			arrayClear(elements)
			arrayPush(elements, ...elementAllBySelector(INTERACTIVE_ELEMENT_SELECTOR, divRef))
		}

		timeOnFocusInId = timeTimerSet(
			() => timeOnFocusInId = null,
			200
		)
	}

	createEffect(() => {
		const $elements = props["c:elements"]
		content() // trigger effect

		divRef.classList.length > 0

		if (typeIsArray($elements)) {
			arrayClear(elements)
			arrayPush(elements, ...($elements as HTMLElement[]))
		}
		else if (typeIsString($elements) && cssIsValidSelector($elements as string)) {
			arrayClear(elements)
			arrayPush(elements, ...elementAllBySelector($elements as string, divRef))
		}
		else {
			arrayClear(elements)
			arrayPush(elements, ...elementAllBySelector(INTERACTIVE_ELEMENT_SELECTOR, divRef))
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