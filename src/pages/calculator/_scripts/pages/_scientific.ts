import { updateButtonRef } from "@/native-components/Button"
import { Commands, ElementIds, ScientificAngleType } from "../_enums"
import { ButtonVariant } from "@/native-components/Button"
import { IconClasses } from "@/native-components/Icon"
import { isAnimationAllowed } from "@/utils/animation"
import { AnimationEffectTiming } from "@/enums/animation"
import { CSSClasses } from "../../_styles/_css"
import { elementAnimateUpdateText } from "@/utils/element"
import { SelectAttributes, SelectEvents } from "@/native-components/Select"
import { validEnumValue } from "@/utils/object"
import { command } from "../_utils"
import type { CommandScientificAngleDetail } from "../_types"

const $ = (id: string) => document.getElementById(id)

function _angle(): void {
	const ref = $(ElementIds.bodyScientificAngle) as HTMLElement
	ref.addEventListener(SelectEvents.change, () => {
		const angle = ref.getAttribute(SelectAttributes.value) as ScientificAngleType
		if (!angle || !validEnumValue(angle, ScientificAngleType)) return

		command<CommandScientificAngleDetail>(Commands.scientificAngle, {angle})
	})
}

function _functionButtons(): void {
	const buttonRef = $(ElementIds.bodyScientificFunctionButton) as HTMLButtonElement
	const menuRef = $(ElementIds.bodyScientificFunctionMenu) as HTMLDivElement
	const inversRef = $(ElementIds.bodyScientificFunctionInvers) as HTMLInputElement
	const hyperbolicRef = $(ElementIds.bodyScientificFunctionHyperbolic) as HTMLInputElement

	menuRef.addEventListener('toggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		buttonRef.setAttribute('aria-expanded', String(isOpen))
		updateButtonRef(buttonRef, {
			ButtonVariant: isOpen? ButtonVariant.filled : ButtonVariant.tonal
		})

		const iconRef = buttonRef.querySelector<HTMLElement>('.' + IconClasses.icon + ":last-child")
		iconRef?.style.setProperty('transform', isOpen? 'rotate(180deg)' : null)
		if (isAnimationAllowed()) {
			iconRef?.animate({
				transform: [`rotate(${isOpen? 0 : 180}deg)`, `rotate(${isOpen? 180 : 0}deg)`]
			}, {duration: 250, easing: AnimationEffectTiming.spring})
		}
	})

	menuRef.addEventListener('change', ev => {
		switch (ev.target) {
		case inversRef:
		case hyperbolicRef:
			const refs = document.querySelectorAll<HTMLButtonElement>('.' + CSSClasses.bodyPageScientificTrigonometry)
			const inv = inversRef.checked
			const hyp = hyperbolicRef.checked
			const trigonometry = [
				(inv? 'a' : '') + 'sin' + (hyp? 'h' : ''),
				(inv? 'a' : '') + 'cos' + (hyp? 'h' : ''),
				(inv? 'a' : '') + 'tan' + (hyp? 'h' : ''),
				(inv? 'a' : '') + 'csc' + (hyp? 'h' : ''),
				(inv? 'a' : '') + 'sec' + (hyp? 'h' : ''),
				(inv? 'a' : '') + 'cot' + (hyp? 'h' : '')
			]
			const animation = isAnimationAllowed()
			for (let i = 0; i < Math.min(trigonometry.length, refs.length); i++) {
				const ref = refs.item(i)
				const char = trigonometry[i]
				if (!ref || !char) continue

				ref.setAttribute('data-char', char + '(')
				if (animation) {
					elementAnimateUpdateText(ref, char + '(x)')
				} else {
					ref.textContent = char + '(x)'
				}
			}
		}
	})
}

export default function _(): void {
	_functionButtons()
	_angle()
}