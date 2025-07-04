import { ObservableStore } from "@/utils/store"
import { DEFAULT_LATEX_TEXT } from "../_shared/_constant"
import { ElementIds } from "../_shared/_ids"
import { $, $$ } from "./_dom-utils"
import { createTooltipRef } from "@/native-components/Tooltip"
import { ButtonVariant, createButtonRef, createIconButtonRef, type ButtonElement } from "@/native-components/Button"
import { Commands } from "../_shared/_commands"
import { createIconRef } from "@/native-components/Icon"
import { IconCodes } from "@/enums/icons"
import katex from "katex"
import { AppCSSColors } from "@/enums/app-data"
import { createElementId } from "@/utils/ids"
import { isTargetValidElement } from "@/utils/element"
import { Math_clamp } from "@/utils/math"
import type { DialogElement } from "@/native-components/Dialog"
import type { TextAreaFieldElement } from "@/native-components/TextAreaField"
import { html_beautify } from "js-beautify"
import type { ToastElement } from "@/native-components/Toast"
import type { MenuElement, MenuItemElement } from "@/native-components/Menu"
import { SettingsStore } from "./_settings"
import { saveStorageItem } from "./_database"

export type LatexStoreType = Readonly<{
	latex: string[]
}>

export const LatexStore = new ObservableStore<LatexStoreType>({
	latex: [DEFAULT_LATEX_TEXT]
})
const _moreMenuRef = $(ElementIds.apMore_menu) as MenuElement
const _copyAllRef = $(ElementIds.apMore_copy) as MenuItemElement
const _resetRef = $(ElementIds.apMore_reset) as MenuItemElement
const _addLatexRef = $(ElementIds.bd_add) as ButtonElement
const _latexListRef = $(ElementIds.bd_list) as HTMLUListElement
const _mathmlDialogRef = $(ElementIds.bd_dialogMathML) as DialogElement
const _mathMLInputRef = $(ElementIds.bd_inputMathML) as TextAreaFieldElement
const _mathMLCopyRef = $(ElementIds.bd_mathMLCopy) as ButtonElement
const _toastCopiedRef = $(ElementIds.bdToas_copied) as ToastElement
let _selectedLatexIndex = 0

function _addLatex(index: number): void {
	LatexStore.update(v => {
		const latex = [...v.latex]
		latex.splice(index, 0, '')
		return {...v, latex}
	})
}

function _updateLatexList(index: number): void {
	const latex = LatexStore.value.latex[index]
	if (latex === null || latex === undefined) {return}

	let liRef = $$<HTMLLIElement>(`li:nth-child(${index + 1})`, _latexListRef)
	let textareaRef = $$<HTMLTextAreaElement>(`textarea`, liRef)
	let outputRef = $$<HTMLOutputElement>(`output`, liRef)
	let deleteRef = $$<HTMLButtonElement>(`[data-command="${CSS.escape(Commands.eq_delete)}"]`, liRef)
	if (!outputRef) {
		const children = [..._latexListRef.children]
		deleteRef = createIconButtonRef({
			IconButtonIcon: {IconCode: IconCodes.delete},
			IconButtonRefs: {button(ref) {
				ref.setAttribute('aria-label', 'Delete')
				ref.setAttribute('data-tooltip', 'Delete')
				ref.setAttribute('data-command', Commands.eq_delete)
			}}
		})
		const actions = createTooltipRef({TooltipChildren: [
			createButtonRef({
				ButtonChildren: [
					createIconRef({IconCode: IconCodes.add}),
					'New equation'
				],
				ButtonVariant: ButtonVariant.outlined,
				ButtonRefs: {button(ref) {
					ref.setAttribute('data-command', Commands.eq_new)
				}}
			}),
			createIconButtonRef({
				IconButtonIcon: {IconCode: IconCodes.copy},
				IconButtonRefs: {button(ref) {
					ref.setAttribute('aria-label', 'Copy')
					ref.setAttribute('data-tooltip', 'Copy')
					ref.setAttribute('data-command', Commands.eq_copy)
				}}
			}),
			createIconButtonRef({
				IconButtonIcon: {IconCode: IconCodes.code},
				IconButtonRefs: {button(ref) {
					ref.setAttribute('aria-label', 'MathML')
					ref.setAttribute('data-tooltip', 'MathML')
					ref.setAttribute('data-command', Commands.eq_copyMathML)
				}}
			}),
			deleteRef,
		]})

		const textareaId = createElementId()
		textareaRef = document.createElement('textarea')
		outputRef = document.createElement('output')
		liRef = document.createElement('li')
		textareaRef.id = textareaId
		outputRef.htmlFor = textareaId
		liRef.replaceChildren(textareaRef, outputRef, actions)
		children.splice(index, 0, liRef)
		_latexListRef.replaceChildren(...children)
	}

	if (deleteRef) {
		deleteRef.disabled = LatexStore.value.latex.length <= 1
	}

	if (textareaRef!.value !== latex) {
		textareaRef!.value = latex
	}

	if (!textareaRef!.oninput) {
		let timeId: NodeJS.Timeout | number | null = null
		textareaRef!.oninput = () => {
			if (timeId !== null) {
				clearTimeout(timeId)
			}

			timeId = setTimeout(() => {
				timeId = null
				LatexStore.update(v => {
					const latex = [...v.latex]
					const index = [..._latexListRef.children].findIndex(v => v === liRef)
					if (index >= 0) {
						latex[index] = textareaRef!.value
					}

					return ({...v, latex})
				})
			}, 100)
		}
	}

	outputRef.innerHTML = katex.renderToString(latex, {
		displayMode: true,
		output: 'mathml',
		errorColor: `rgb(${AppCSSColors.error})`,
		throwOnError: false
	})
}

function _subsLatexView(v: LatexStoreType, o: LatexStoreType): void {
	const latex = v.latex
	const oldLatex = o.latex

	for (let i = 0; i < latex.length; i++) {
		_updateLatexList(i)
	}

	if (latex.length < oldLatex.length) {
		const children = [..._latexListRef.children] // must spread to keep array length
		for (let i = 0; i < oldLatex.length - latex.length; i++) {
			children[latex.length + i]?.remove()
		}
	}
}

function _subsLatexChanges(v: LatexStoreType, o: LatexStoreType): void {
	const latex = v.latex
	if (latex.join() === o.latex.join()) {return}

	saveStorageItem('latex', [...latex])
}

function _initSubscriber(): void {
	LatexStore.subscribe(_subsLatexChanges)
	LatexStore.subscribe(_subsLatexView)
}

function _initEvents(): void {
	_addLatexRef.addEventListener('click', () => {
		_addLatex(0)
	})

	_latexListRef.addEventListener('click', () => {
		const btnRef = document.activeElement as HTMLButtonElement
		if (!isTargetValidElement(_latexListRef, btnRef)) {return}

		const command = btnRef.dataset.command as Commands
		const getLatexIndex = () => {
			const li = btnRef.closest('li')
			const children = [..._latexListRef.children]
			const index = children.findIndex(v => v === li)
			return Math_clamp(index, 0, LatexStore.value.latex.length - 1)
		}

		const settings = SettingsStore.value
		switch (command) {
		case Commands.eq_new:
			_selectedLatexIndex = getLatexIndex()
			_addLatex(_selectedLatexIndex + 1)
			break
		case Commands.eq_copy:
			_selectedLatexIndex = getLatexIndex()
			navigator.clipboard.writeText([
				settings.prefix,
				LatexStore.value.latex[_selectedLatexIndex],
				settings.suffix
			].join('')).then(() => {
				_toastCopiedRef.showPopover()
			})
			break
		case Commands.eq_copyMathML:
			_selectedLatexIndex = getLatexIndex()
			_mathmlDialogRef.showModal()
			_mathMLInputRef.value = html_beautify(
				btnRef.closest('li')!.querySelector('output')!.firstElementChild!.innerHTML,
				{indent_size: 2}
			)
			break
		case Commands.eq_delete:
			_selectedLatexIndex = getLatexIndex()
			LatexStore.update(v => {
				const latex = [...v.latex]
				latex.splice(_selectedLatexIndex, 1)
				return ({...v, latex})
			})
			break
		}
	})

	_mathMLCopyRef.addEventListener('click', () => {
		navigator.clipboard.writeText(_mathMLInputRef.value).then(() => {
			_toastCopiedRef.showPopover()
		})
	})

	_copyAllRef.addEventListener('click', () => {
		_moreMenuRef.hidePopover()
		const settings = SettingsStore.value
		navigator.clipboard.writeText(
			LatexStore.value.latex.map(v => settings.prefix + v + settings.suffix)
			.join('\n\n')
		).then(() => {
			_toastCopiedRef.showPopover()
		})
	})

	_resetRef.addEventListener('click', () => {
		_moreMenuRef.hidePopover()
		LatexStore.update(v => ({...v, latex: [DEFAULT_LATEX_TEXT]}))
	})
}

function _initDefaultLatex(): void {
	for (let i = 0; i < LatexStore.value.latex.length; i++) {
		_updateLatexList(i)
	}
}

export default () => {
	_initEvents()
	_initSubscriber()
	_initDefaultLatex() // must after _initSubscriber()
}