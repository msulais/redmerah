import { mergeRefs } from "@solid-primitives/refs"
import { children, createEffect, splitProps, type JSX, type ParentComponent } from "solid-js"

import { keyboardOnFocusIn, keyboardOnFocusOut, keyboardOnKeyDown, keyboardOnKeyDown2D } from "@/utils/keyboard"
import { eventCall } from "@/utils/event"
import { attrClassList } from "@/utils/attributes"
import { arrayClear, arrayPush } from "@/utils/array"
import { typeIsArray, typeIsString } from "@/utils/typecheck"
import { elementAllBySelector } from "@/utils/element"
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
	const elements: HTMLElement[] = []
	const content = children(() => props.children)
	let divRef: HTMLDivElement

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
		class={attrClassList(FOCUSABLEGROUP_CLASSNAME, props.class)}
		onFocusIn={ev => {
			eventCall(ev, props.onFocusIn)
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
	const elements: HTMLElement[] = []
	const content = children(() => props.children)
	let divRef: HTMLDivElement

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
		class={attrClassList(FOCUSABLEGROUP_CLASSNAME, props.class)}
		onFocusIn={ev => {
			eventCall(ev, props.onFocusIn)
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