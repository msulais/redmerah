import { createEffect, createMemo, createSignal, createUniqueId, mergeProps, onCleanup, onMount, splitProps, type JSX, type ParentComponent } from "solid-js"
import { mergeRefs } from "@solid-primitives/refs"

import { AnimationEffectTiming } from "@/enums/animation"
import { attrSetIfExist, attrClassList } from "@/utils/attributes"
import { eventCall } from "@/utils/event"
import { ICON_CHECKBOX_CHECKED, ICON_CHECKBOX_UNCHECKED, ICON_RADIO_BUTTON } from "@/constants/icons"
import { animationIsOn } from "@/utils/animation"

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
	const [iconProps, otherIconProps] = splitProps(props['c:attrIcon']! ?? {}, [
		'ref', 'c:filled', 'c:code', 'style'
	])
	const [isChecked, setIsChecked] = createSignal<boolean>(false)
	const [styleWillChange, setStyleWillChange] = createSignal<string | undefined>()
	const isDisabled = createMemo(() => other.disabled == true)
	let $isChecked: boolean = false
	let isMounted: boolean = false
	let iconRef: HTMLElement
	let inputRef: HTMLInputElement
	let animation: Animation | null = null

	function changeCheckedState(checked: boolean): void {
		if (animation != null) animation.cancel()

		if (animationIsOn()) {
			setStyleWillChange('scale')
			animation = iconRef.animate({scale: [1, 0]}, animationOptions)
			animation.finished.then(() => {
				$isChecked = checked
				setIsChecked(checked)
				animation = iconRef.animate({scale: [0, 1]}, animationOptions)
				animation.finished.then(() => {
					animation = null
					setStyleWillChange(undefined)
				}).catch(() => setStyleWillChange(undefined))
			}, () => {})
			return
		}

		$isChecked = checked
		setIsChecked(checked)
	}

	function onChangeRadioOff(ev: CustomEvent<HTMLInputElement>): void {
		if (ev.detail === inputRef || !isChecked()) return
		changeCheckedState(inputRef.checked)
	}

	onMount(() => {
		inputRef.addEventListener(
			CheckBoxEvents.changestate as any,
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
		inputRef.removeEventListener(
			CheckBoxEvents.changestate as any,
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
				const isChecked = ev.currentTarget.checked

				if (props['c:variant'] == CheckBoxVariant.radio && other.name != null) {
					const getAllRadioWithSameName = document.querySelectorAll(`input[type=radio][name=${CSS.escape(other.name)}]`)
					for (const el of getAllRadioWithSameName) (el as HTMLElement).dispatchEvent(new CustomEvent(
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
			style={typeof iconProps.style === 'string'? iconProps.style : {
				...(iconProps.style ?? {}),
				"will-change": iconProps.style?.["will-change"] ?? styleWillChange()
			}}
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