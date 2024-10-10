import { createEffect, createMemo, createSignal, mergeProps, onCleanup, onMount, splitProps, type JSX, type ParentComponent } from "solid-js"

import type { ComponentEvent } from "@/types/event"
import { AnimationEffectTiming } from "@/enums/animation"
import { _animate, _blur, _cancel, _catch, _check, _checkbox, _checked, _children, _class, _code, _currentTarget, _detail, _disabled, _dispatchEvent, _filled, _finished, _forEach, _iconAttr, _isSameNode, _labelAttr, _name, _onChange, _onChangeRadioOff, _radio, _ref, _replace, _spring, _then, _variant } from "@/constants/string"
import { toggleAttribute } from "@/utils/attributes"
import { querySelectorAll } from "@/utils/element"
import { addEventListener, removeEventListener } from "@/utils/event"

import Icon, { type IconProps } from "@/components/Icon"
import '@/components/Button/index.scss'
import './index.scss'

enum CheckBoxEvents {
	/** @param {HTMLInputElement} el `HTMLInputElement` */
	onChangeRadioOff = 'on-change-radio-off'
}

enum CheckBoxVariant {
	radio,
	check
}

type CheckBoxProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'ref'> & {
	onChange?(ev: ComponentEvent<Event, HTMLInputElement>): unknown
	variant?: CheckBoxVariant
	ref?(el: HTMLInputElement): unknown
	labelAttr?: JSX.LabelHTMLAttributes<HTMLLabelElement>
	iconAttr?: Omit<IconProps, 'ref'> & {
		ref?(el: HTMLElement): unknown
	}
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
	let icon_ref: HTMLElement
	let input_ref: HTMLInputElement
	let animation: Animation | null = null

	function changeCheckedState(checked: boolean): void {
		if (animation != null) animation[_cancel]()

		animation = icon_ref[_animate]({scale: [1, 0]}, animationOptions)
		animation
		[_finished]
		[_then](() => {
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
		changeCheckedState(false)
	}

	onMount(() => {
		addEventListener<CustomEvent<HTMLInputElement>>(
			input_ref,
			CheckBoxEvents.onChangeRadioOff,
			onChangeRadioOff
		)
	})

	createEffect(() => {
		const checked = other[_checked]
		setIsChecked(c => checked ?? c)
	})

	onCleanup(() => {
		removeEventListener<CustomEvent<HTMLInputElement>>(
			input_ref,
			CheckBoxEvents.onChangeRadioOff,
			onChangeRadioOff
		)
	})

	return (<label
		class={`checkbox${labelProps[_class] != null ? ` ${labelProps[_class]}` : ''}`}
		data-disabled={toggleAttribute(isDisabled())}
		{...otherLabelProps}>
		<input
			ref={r => {
				input_ref = r
				if (props[_ref]) props[_ref](r)
			}}
			type={props[_variant] == CheckBoxVariant[_radio]? _radio : _checkbox}
			onChange={(ev) => {
				const isChecked = ev[_currentTarget][_checked]
				if (props[_onChange]) props[_onChange](ev)

				if (props[_variant] == CheckBoxVariant[_radio] && other[_name] != null) {
					const getAllRadioWithSameName = querySelectorAll(`input[type=radio][name="${other[_name][_replace](/"/g, '\\"')}"]`)
					getAllRadioWithSameName[_forEach](el => el[_dispatchEvent](new CustomEvent(
						CheckBoxEvents[_onChangeRadioOff],
						{detail: input_ref}
					)))
				}

				changeCheckedState(isChecked)
			}}
			{...other}
		/>
		<div class="btn square-btn">
			<div class="btn-layer">
				<Icon
					ref={r => {
						icon_ref = r
						if (iconProps[_ref]) iconProps[_ref](r)
					}}
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