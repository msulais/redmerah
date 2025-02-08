import { createEffect, createMemo, createSignal, createUniqueId, mergeProps, onCleanup, onMount, splitProps, type JSX, type ParentComponent } from "solid-js"
import { mergeRefs } from "@solid-primitives/refs"

import { AnimationEffectTiming } from "@/enums/animation"
import { attrSetIfExist, attrClassList } from "@/utils/attributes"
import { elementAnimate, elementDispatchEvent, elementIsSame, elementAllBySelector } from "@/utils/element"
import { eventListenerAdd, eventCall, eventCurrentTarget, eventListenerRemove } from "@/utils/event"
import { promiseDone } from "@/utils/object"
import { ICON_CHECKBOX_CHECKED, ICON_CHECKBOX_UNCHECKED, ICON_RADIO_BUTTON } from "@/constants/icons"

import Icon, { type IconProps } from "@/components/Icon"
import '@/components/Button/index.scss'
import './index.scss'

enum CheckBoxEvents {
	/** @param {HTMLInputElement} el `HTMLInputElement` */
	changestate = 'custom:checkbox-changestate'
}

enum CheckBoxVariant {
	radio,
	check
}

type CheckBoxProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
	'c:variant'?: CheckBoxVariant
	'c:attrLabel'?: Omit<JSX.LabelHTMLAttributes<HTMLLabelElement>, 'for'>
	'c:attrIcon'?: IconProps
}

const CheckBox: ParentComponent<CheckBoxProps> = ($props) => {
	const animationOptions = {
		duration: 150,
		easing: AnimationEffectTiming.spring
	}
	const $$props = mergeProps({
		'c:variant': CheckBoxVariant.check,
		id: createUniqueId()
	}, $props)
	const [props, other] = splitProps($$props, [
		'c:variant', 'children', 'c:attrLabel',
		'c:attrIcon', 'onChange', 'ref', 'id'
	])
	const [labelProps, otherLabelProps] = splitProps(props['c:attrLabel'] ?? {}, ['class'])
	const [iconProps, otherIconProps] = splitProps(props['c:attrIcon']! ?? {}, ['ref', 'c:filled', 'c:code'])
	const [isChecked, setIsChecked] = createSignal<boolean>(false)
	const isDisabled = createMemo(() => other.disabled == true)
	let $isChecked: boolean = false
	let isMounted: boolean = false
	let iconRef: HTMLElement
	let inputRef: HTMLInputElement
	let animation: Animation | null = null

	function changeCheckedState(checked: boolean): void {
		if (animation != null) animation.cancel()

		animation = elementAnimate(iconRef, {scale: [1, 0]}, animationOptions)
		promiseDone(animation.finished, () => {
			$isChecked = checked
			setIsChecked(checked)
			animation = elementAnimate(iconRef, {scale: [0, 1]}, animationOptions)
			promiseDone(
				animation.finished,
				() => animation = null,
				() => {}
			)
		}, () => {})
	}

	function onChangeRadioOff(ev: CustomEvent<HTMLInputElement>): void {
		if (elementIsSame(ev.detail, inputRef) || !isChecked()) return
		changeCheckedState(inputRef.checked)
	}

	onMount(() => {
		eventListenerAdd<CustomEvent<HTMLInputElement>>(
			inputRef,
			CheckBoxEvents.changestate,
			onChangeRadioOff
		)
	})

	createEffect(() => {
		$isChecked = other.checked ?? $isChecked
		if (!isMounted) {
			setIsChecked(c => $isChecked ?? c)
			isMounted = true
			return
		}
		if (
			$isChecked == null
			|| $isChecked == isChecked()
		) return;

		changeCheckedState($isChecked)
	})

	onCleanup(() => {
		eventListenerRemove<CustomEvent<HTMLInputElement>>(
			inputRef,
			CheckBoxEvents.changestate,
			onChangeRadioOff
		)
	})

	return (<label
		class={attrClassList('c-checkbox', 'c-btn', labelProps.class ?? '')}
		data-c-disabled={attrSetIfExist(isDisabled())}
		for={props.id}
		{...otherLabelProps}>
		<input
			ref={mergeRefs(props.ref, el => inputRef = el)}
			type={props['c:variant'] == CheckBoxVariant.radio? 'radio' : 'checkbox'}
			id={props.id}
			onChange={(ev) => {
				eventCall(ev, props.onChange)
				const isChecked = eventCurrentTarget(ev).checked

				if (props['c:variant'] == CheckBoxVariant.radio && other.name != null) {
					const getAllRadioWithSameName = elementAllBySelector(`input[type=radio][name=${CSS.escape(other.name)}]`)
					for (const el of getAllRadioWithSameName) elementDispatchEvent(el as HTMLElement, new CustomEvent(
						CheckBoxEvents.changestate,
						{detail: inputRef}
					))
				}

				changeCheckedState(isChecked)
			}}
			{...other}
		/>
		<Icon
			ref={mergeRefs(iconProps.ref, r => iconRef = r)}
			c:code={iconProps["c:code"] ?? (props['c:variant'] == CheckBoxVariant.check? (isChecked()? ICON_CHECKBOX_CHECKED : ICON_CHECKBOX_UNCHECKED) : ICON_RADIO_BUTTON)}
			c:filled={iconProps["c:filled"] ?? isChecked()}
			{...otherIconProps}
		/>
		{props.children}
	</label>)
}

export {
	CheckBox,
	CheckBoxEvents,
	CheckBoxVariant
}
export type {
	CheckBoxProps
}
export default CheckBox