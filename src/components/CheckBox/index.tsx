import { createEffect, createMemo, createSignal, mergeProps, onCleanup, onMount, splitProps, type JSX, type ParentComponent } from "solid-js"
import { mergeRefs } from "@solid-primitives/refs"

import { AnimationEffectTiming } from "@/enums/animation"
import { _animate, _blur, _cancel, _catch, _check, _checkbox, _checked, _children, _class, _code, _currentTarget, _detail, _disabled, _dispatchEvent, _filled, _finished, _forEach, _iconAttr, _isSameNode, _labelAttr, _name, _onChange, _onChangeRadioState, _radio, _ref, _replace, _spring, _then, _variant } from "@/constants/string"
import { toggleAttribute } from "@/utils/attributes"
import { querySelectorAll } from "@/utils/element"
import { addEventListener, callEventHandler, removeEventListener } from "@/utils/event"

import Icon, { type IconProps } from "@/components/Icon"
import '@/components/Button/index.scss'
import './index.scss'

enum CheckBoxEvents {
	/** @param {HTMLInputElement} el `HTMLInputElement` */
	onChangeRadioState = 'on-change-radio-off'
}

enum CheckBoxVariant {
	radio,
	check
}

type CheckBoxProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
	variant?: CheckBoxVariant
	labelAttr?: JSX.LabelHTMLAttributes<HTMLLabelElement>
	iconAttr?: IconProps
}

const CheckBox: ParentComponent<CheckBoxProps> = ($props) => {
	const animationOptions = {
		duration: 150,
		easing: AnimationEffectTiming[_spring]
	}
	const [props, other] = splitProps(
		mergeProps({variant: CheckBoxVariant[_check]}, $props),
		[
			_variant, _children, _labelAttr, _iconAttr,
			_onChange, _ref
		]
	)
	const [labelProps, otherLabelProps] = splitProps(props[_labelAttr] ?? {}, [_class])
	const [iconProps, otherIconProps] = splitProps(props[_iconAttr]! ?? {}, [_ref, _filled, _code])
	const [isChecked, setIsChecked] = createSignal<boolean>(false)
	const isDisabled = createMemo(() => other[_disabled] == true)
	let $isChecked: boolean = false
	let isMounted: boolean = false
	let icon_ref: HTMLElement
	let input_ref: HTMLInputElement
	let animation: Animation | null = null

	function changeCheckedState(checked: boolean): void {
		if (animation != null) animation[_cancel]()

		animation = icon_ref[_animate]({scale: [1, 0]}, animationOptions)
		animation
		[_finished]
		[_then](() => {
			$isChecked = checked
			setIsChecked(checked)
			animation = icon_ref[_animate]({scale: [0, 1]}, animationOptions)
			animation[_finished]
			[_then](() => animation = null)
			[_catch](() => {})
		})
		[_catch](() => {})
	}

	function onChangeRadioOff(ev: CustomEvent<HTMLInputElement>): void {
		if (ev[_detail][_isSameNode](input_ref) || !isChecked()) return
		changeCheckedState(input_ref[_checked])
	}

	onMount(() => {
		addEventListener<CustomEvent<HTMLInputElement>>(
			input_ref,
			CheckBoxEvents[_onChangeRadioState],
			onChangeRadioOff
		)
	})

	createEffect(() => {
		$isChecked = other[_checked] ?? $isChecked
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
		removeEventListener<CustomEvent<HTMLInputElement>>(
			input_ref,
			CheckBoxEvents[_onChangeRadioState],
			onChangeRadioOff
		)
	})

	return (<label
		class={`c-checkbox${labelProps[_class]? ` ${labelProps[_class]}` : ''}`}
		data-c-disabled={toggleAttribute(isDisabled())}
		{...otherLabelProps}>
		<input
			ref={mergeRefs(props[_ref], el => input_ref = el)}
			type={props[_variant] == CheckBoxVariant[_radio]? _radio : _checkbox}
			onChange={(ev) => {
				const isChecked = ev[_currentTarget][_checked]
				callEventHandler(ev, props[_onChange])

				if (props[_variant] == CheckBoxVariant[_radio] && other[_name] != null) {
					const getAllRadioWithSameName = querySelectorAll(`input[type=radio][name]`)
					getAllRadioWithSameName[_forEach](el => el[_dispatchEvent](new CustomEvent(
						CheckBoxEvents[_onChangeRadioState],
						{detail: input_ref}
					)))
				}

				changeCheckedState(isChecked)
			}}
			{...other}
		/>
		<div class="c-btn c-square-btn">
			<div class="c-btn-layer">
				<Icon
					ref={mergeRefs(iconProps[_ref], r => icon_ref = r)}
					code={iconProps[_code] ?? (props[_variant] == CheckBoxVariant[_check]? (isChecked()? 0xE3CB : 0xE3D4) : 0xED2F)}
					filled={iconProps[_filled] ?? (props[_variant] != CheckBoxVariant[_check] && isChecked())}
					{...otherIconProps}
				/>
			</div>
		</div>
		{props[_children]}
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