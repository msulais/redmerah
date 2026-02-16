import { ObservableStore } from "@/utils/store"
import { DEFAULT_LATEX_TEXT } from "../_shared/_constant"
import { ElementIds } from "../_shared/_ids"
import { $, $$ } from "./_dom-utils"
import { CButton } from "@/components/Button"
import { Commands } from "../_shared/_commands"
import { CIcon } from "@/components/Icon"
import { IconCodes } from "@/enums/icons"
import katex from "katex"
import { AppCSSColors } from "@/enums/app-data"
import { createElementId } from "@/utils/ids"
import { isTargetValidElement } from "@/utils/element"
import { Math_clamp } from "@/utils/math"
import { CDialog } from "@/components/Dialog"
import { CTextAreaField } from "@/components/TextAreaField"
import { html_beautify } from "js-beautify"
import { CToast } from "@/components/Toast"
import { CMenu } from "@/components/Menu"
import { SettingsStore } from "./_settings"
import { saveStorageItem } from "./_database"

export type LatexStoreType = Readonly<{
	latex: string[]
}>

export const LatexStore = new ObservableStore<LatexStoreType>({
	latex: [DEFAULT_LATEX_TEXT]
})
const _ref_moreMenu = $(ElementIds.apMore_menu) as CMenu.CElement
const _ref_copyAll = $(ElementIds.apMore_copy) as CMenu.CItem.CElement
const _ref_reset = $(ElementIds.apMore_reset) as CMenu.CItem.CElement
const _ref_addLatex = $(ElementIds.bd_add) as CButton.CElement
const _ref_latexList = $(ElementIds.bd_list) as HTMLUListElement
const _ref_mathmlDialog = $(ElementIds.bd_dialogMathML) as CDialog.CElement
const _ref_mathMLInput = $(ElementIds.bd_inputMathML) as CTextAreaField.CElement
const _ref_mathMLCopy = $(ElementIds.bd_mathMLCopy) as CButton.CElement
const _ref_toastCopied = $(ElementIds.toa_copied) as CToast.CElement
let _selectedLatexIndex = 0

function _addLatex(index: number): void {
	LatexStore.update(v => {
		v.latex.splice(index, 0, '')
	})
}

function _updateLatexList(index: number): void {
	const latex = LatexStore.value.latex[index]
	if (latex === null || latex === undefined) {return}

	let ref_li = $$<HTMLLIElement>(`li:nth-child(${index + 1})`, _ref_latexList)
	let ref_textarea = $$<HTMLTextAreaElement>(`textarea`, ref_li)
	let ref_output = $$<HTMLOutputElement>(`output`, ref_li)
	let ref_delete = $$<CButton.CElement>(`[data-command="${CSS.escape(Commands.EquationDelete)}"]`, ref_li)
	if (!ref_output) {
		const refs_children = [..._ref_latexList.children]
		ref_delete = CButton.CIcon.create({IconButton: {
			Icon: {code: IconCodes.Delete},
			refs: {button(ref) {
				ref.setAttribute('aria-label', 'Delete')
				ref.setAttribute('data-tooltip', 'Delete')
				ref.setAttribute('data-command', Commands.EquationDelete)
			}}
		}})

		const textareaId = createElementId()
		ref_textarea = document.createElement('textarea')
		ref_output = document.createElement('output')
		ref_li = document.createElement('li')
		ref_textarea.id = textareaId
		ref_output.setAttribute('for', textareaId)
		ref_li.replaceChildren(ref_textarea, ref_output,
			CButton.create({Button: {
				children: [
					CIcon.create({Icon: {code: IconCodes.Add}}),
					'New equation'
				],
				variant: CButton.Variant.Outlined,
				refs: {button(ref) {
					ref.setAttribute('data-command', Commands.EquationNew)
				}}
			}}),
			CButton.CIcon.create({IconButton: {
				Icon: {code: IconCodes.Copy},
				refs: {button(ref) {
					ref.setAttribute('aria-label', 'Copy')
					ref.setAttribute('data-tooltip', 'Copy')
					ref.setAttribute('data-command', Commands.EquationCopy)
				}}
			}}),
			CButton.CIcon.create({IconButton: {
				Icon: {code: IconCodes.Code},
				refs: {button(ref) {
					ref.setAttribute('aria-label', 'MathML')
					ref.setAttribute('data-tooltip', 'MathML')
					ref.setAttribute('data-command', Commands.EquationMathML)
				}}
			}}),
			ref_delete
		)
		refs_children.splice(index, 0, ref_li)
		_ref_latexList.replaceChildren(...refs_children)
	}

	if (ref_delete) {
		ref_delete.disabled = LatexStore.value.latex.length <= 1
	}

	if (ref_textarea!.value !== latex) {
		ref_textarea!.value = latex
	}

	if (!ref_textarea!.oninput) {
		let timeId: NodeJS.Timeout | number | null = null
		ref_textarea!.oninput = () => {
			if (timeId !== null) {
				clearTimeout(timeId)
			}

			timeId = setTimeout(() => {
				timeId = null
				LatexStore.update(v => {
					const index = [..._ref_latexList.children].findIndex(v => v === ref_li)
					if (index >= 0) {
						v.latex[index] = ref_textarea!.value
					}
				})
			}, 100)
		}
	}

	ref_output.innerHTML = katex.renderToString(latex, {
		displayMode: true,
		output: 'mathml',
		errorColor: `rgb(${AppCSSColors.Error})`,
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
		const children = [..._ref_latexList.children] // must spread to keep array length
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
	_ref_addLatex.addEventListener('click', () => {
		_addLatex(0)
	})

	_ref_latexList.addEventListener('click', () => {
		const ref_btn = document.activeElement as CButton.CElement
		if (!isTargetValidElement(_ref_latexList, ref_btn)) {return}

		const command = ref_btn.dataset.command as Commands
		const getLatexIndex = () => {
			const li = ref_btn.closest('li')
			const children = [..._ref_latexList.children]
			const index = children.findIndex(v => v === li)
			return Math_clamp(index, 0, LatexStore.value.latex.length - 1)
		}

		const settings = SettingsStore.value
		switch (command) {
		case Commands.EquationNew:
			_selectedLatexIndex = getLatexIndex()
			_addLatex(_selectedLatexIndex + 1)
			break
		case Commands.EquationCopy:
			_selectedLatexIndex = getLatexIndex()
			navigator.clipboard.writeText([
				settings.prefix,
				LatexStore.value.latex[_selectedLatexIndex],
				settings.suffix
			].join('')).then(() => {
				_ref_toastCopied.showPopover()
			})
			break
		case Commands.EquationMathML:
			_selectedLatexIndex = getLatexIndex()
			_ref_mathmlDialog.showModal()
			_ref_mathMLInput.value = html_beautify(
				ref_btn.closest('li')!.querySelector('output')!.firstElementChild!.innerHTML,
				{indent_size: 2}
			)
			break
		case Commands.EquationDelete:
			_selectedLatexIndex = getLatexIndex()
			LatexStore.update(v => v.latex.splice(_selectedLatexIndex, 1))
			break
		}
	})

	_ref_mathMLCopy.addEventListener('click', () => {
		navigator.clipboard.writeText(_ref_mathMLInput.value).then(() => {
			_ref_toastCopied.showPopover()
		})
	})

	_ref_copyAll.addEventListener('click', () => {
		_ref_moreMenu.hidePopover()
		const settings = SettingsStore.value
		navigator.clipboard.writeText(
			LatexStore.value.latex.map(v => settings.prefix + v + settings.suffix)
			.join('\n\n')
		).then(() => {
			_ref_toastCopied.showPopover()
		})
	})

	_ref_reset.addEventListener('click', () => {
		_ref_moreMenu.hidePopover()
		LatexStore.update(v => v.latex = [DEFAULT_LATEX_TEXT])
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