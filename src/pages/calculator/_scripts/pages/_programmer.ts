import { elementValidTarget } from "@/utils/element"
import { CSSClasses } from "../../_styles/_css"
import { Commands, ElementIds, NumberType } from "../_enums"
import { ButtonVariant, updateButtonRef } from "@/native-components/Button"
import { command } from "../_utils"
import type { CommandChangeProgrammerTypeDetail } from "../_types"

const $ = (id: string) => document.getElementById(id)
const $$ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)
const $$$ = <T extends HTMLElement>(selector: string) => document.querySelectorAll<T>(selector)

const _outputRef = $(ElementIds.bodyProgrammerOutput) as HTMLDivElement
const _hexRef = $(ElementIds.bodyProgrammerOutputHex) as HTMLDivElement
const _decRef = $(ElementIds.bodyProgrammerOutputDec) as HTMLDivElement
const _octRef = $(ElementIds.bodyProgrammerOutputOct) as HTMLDivElement
const _binRef = $(ElementIds.bodyProgrammerOutputBin) as HTMLDivElement
const _hexButtonRef = $$<HTMLButtonElement>(`#${(ElementIds.bodyProgrammerOutputHex)}>button`)
const _decButtonRef = $$<HTMLButtonElement>(`#${(ElementIds.bodyProgrammerOutputDec)}>button`)
const _octButtonRef = $$<HTMLButtonElement>(`#${(ElementIds.bodyProgrammerOutputOct)}>button`)
const _binButtonRef = $$<HTMLButtonElement>(`#${(ElementIds.bodyProgrammerOutputBin)}>button`)
const _hexButtonRefs = $$$<HTMLButtonElement>(`.${CSSClasses.bodyPageProgrammerButtonHex}`)
const _decButtonRefs = $$$<HTMLButtonElement>(`.${CSSClasses.bodyPageProgrammerButtonDec}`)
const _octButtonRefs = $$$<HTMLButtonElement>(`.${CSSClasses.bodyPageProgrammerButtonOct}`)
const _binButtonRefs = $$$<HTMLButtonElement>(`.${CSSClasses.bodyPageProgrammerButtonBin}`)

function _updateDisabledButtons(type: NumberType): void {
	let cls = CSSClasses.bodyPageProgrammerButtonDec
	let elements = _decButtonRefs
	_decRef.setAttribute('aria-selected', 'false')
	_hexRef.setAttribute('aria-selected', 'false')
	_octRef.setAttribute('aria-selected', 'false')
	_binRef.setAttribute('aria-selected', 'false')
	updateButtonRef(_hexButtonRef!, {ButtonVariant: ButtonVariant.transparent})
	updateButtonRef(_decButtonRef!, {ButtonVariant: ButtonVariant.transparent})
	updateButtonRef(_octButtonRef!, {ButtonVariant: ButtonVariant.transparent})
	updateButtonRef(_binButtonRef!, {ButtonVariant: ButtonVariant.transparent})
	switch (type) {
	case NumberType.decimal:
		cls = CSSClasses.bodyPageProgrammerButtonDec
		elements = _decButtonRefs
		_decRef.setAttribute('aria-selected', 'true')
		updateButtonRef(_decButtonRef!, {ButtonVariant: ButtonVariant.filled})
		break
	case NumberType.hexadecimal:
		cls = CSSClasses.bodyPageProgrammerButtonHex
		elements = _hexButtonRefs
		_hexRef.setAttribute('aria-selected', 'true')
		updateButtonRef(_hexButtonRef!, {ButtonVariant: ButtonVariant.filled})
		break
	case NumberType.octal:
		cls = CSSClasses.bodyPageProgrammerButtonOct
		elements = _octButtonRefs
		_octRef.setAttribute('aria-selected', 'true')
		updateButtonRef(_octButtonRef!, {ButtonVariant: ButtonVariant.filled})
		break
	case NumberType.binary:
		cls = CSSClasses.bodyPageProgrammerButtonBin
		elements = _binButtonRefs
		_binRef.setAttribute('aria-selected', 'true')
		updateButtonRef(_binButtonRef!, {ButtonVariant: ButtonVariant.filled})
		break
	}

	const buttonRefs = $$$<HTMLButtonElement>(`.${CSSClasses.bodyPageProgrammerButtonValue}:not(.${cls})`)
	for (const ref of buttonRefs) {
		ref.disabled = true
	}

	for (const ref of elements) {
		ref.disabled = false
	}
}

function _initBaseChange(): void {
	_outputRef.addEventListener('click', () => {
		const buttonRef = document.activeElement as HTMLButtonElement
		if (!elementValidTarget(_outputRef, buttonRef, el => el.tagName === 'BUTTON')) return

		let type: NumberType = NumberType.decimal
		switch (buttonRef) {
		case _hexButtonRef: type = NumberType.hexadecimal; break
		case _decButtonRef: type = NumberType.decimal; break
		case _octButtonRef: type = NumberType.octal; break
		case _binButtonRef: type = NumberType.binary; break
		}

		_updateDisabledButtons(type)
		command<CommandChangeProgrammerTypeDetail>(
			Commands.changeProgrammerType,
			{programmer: type}
		)
	})
}

export default function _(): void {
	_initBaseChange()
}