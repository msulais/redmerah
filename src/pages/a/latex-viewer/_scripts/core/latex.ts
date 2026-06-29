import * as Ids from '../shared/ids.enum.js'
import * as WebComponent from '@/web-components/global-attributes.js'
import * as BrIcon from '@/web-components/components/br-icon.js'
import * as Button from '@/web-components/components/button.js'
import * as BrFocusGroup from '@/web-components/components/br-focusgroup.js'
import * as Commands from '../shared/commands.enum.js'
import * as Constant from '../shared/constant.enum.js'
import * as Settings from './settings.js'
import * as Icons from '@/enums/icons.enum.js'
import * as BrDialog from '@/web-components/components/br-dialog.js'
import * as BrTheme from '@/web-components/components/br-theme.js'
import type { EnumOf } from '@/types/collections'
import { signal } from "@/utils/signal"
import { $ } from './dom-utils.js'
import { delegateEvent } from '@/utils/event-registry'
import { Math_clamp } from '@/utils/math'
import { html_beautify } from 'js-beautify'
import { saveStorageItem } from './database.js'
import { createElement, updateElementList } from '@/utils/element'
import katex from 'katex'

export const sg_inputs = signal<string[]>([Constant.DEFAULT_LATEX_TEXT])

const _ref_copyAll      = $(Ids.CopyAll) as HTMLButtonElement
const _ref_addLatex     = $(Ids.AddButton) as HTMLButtonElement
const _ref_latexList    = $(Ids.List) as HTMLUListElement
const _ref_mathmlDialog = $(Ids.DialogMathML) as BrDialog.BiruDialogElement
const _ref_mathMLInput  = $(Ids.DialogMathMLInput) as HTMLTextAreaElement
const _ref_mathMLCopy   = $(Ids.DialogMathMLCopy) as HTMLButtonElement

let _selectedLatexIndex = 0

function _addLatex(index: number): void {
	sg_inputs().splice(index, 0, '')
	sg_inputs.notify()
}

function _initSubscriber(): void {
	sg_inputs.subscribe(v => {
		saveStorageItem('inputs', ([] as ReturnType<typeof sg_inputs>).concat(sg_inputs()))
		updateElementList(_ref_latexList, v,
			() => {
				const id_textarea = crypto.randomUUID().substring(0, 8).toUpperCase()
				const li = createElement('li', {tabindex: '0'}, null, [
					createElement('textarea', {id: id_textarea, 'br:as': WebComponent.As.TextField}),
					createElement('output', {for: id_textarea}),
					createElement(BrFocusGroup.TAGNAME, {'br:direction': BrFocusGroup.Direction.Horizontal}, null, [
						createElement('button', {
								'data-command': Commands.EquationNew,
								'br:variant': [Button.Variant.Tonal, Button.Variant.Colored].join(' ')
							},
							null, [
								createElement(BrIcon.TAGNAME, {}, ref => ref.innerHTML = Icons.Add),
								'New equation'
							]
						),
						createElement('button', {
								'data-command': Commands.EquationCopy,
								'br:variant': Button.Variant.Icon,
								'aria-label': 'Copy',
								'br:tooltip': 'Copy'
							},
							null, [
								createElement(BrIcon.TAGNAME, {}, ref => ref.innerHTML = Icons.Copy)
							]
						),
						createElement('button', {
								'data-command': Commands.EquationMathML,
								'br:variant': Button.Variant.Icon,
								'aria-label': 'MathML',
								'br:tooltip': 'MathML'
							},
							null, [
								createElement(BrIcon.TAGNAME, {}, ref => ref.innerHTML = Icons.Code)
							]
						),
						createElement('button', {
								'data-command': Commands.EquationDelete,
								'br:variant': Button.Variant.Icon,
								'aria-label': 'Delete',
								'br:tooltip': 'Delete'
							},
							null, [
								createElement(BrIcon.TAGNAME, {}, ref => ref.innerHTML = Icons.Delete)
							]
						),
					])
				])
				return li
			},
			(ref, data, index) => {
				const ref_textarea = ref.querySelector('textarea')
				const ref_output = ref.querySelector('output')
				const ref_delete = ref.querySelector<HTMLButtonElement>(`button[data-command="${CSS.escape(Commands.EquationDelete)}"]`)
				const fn_updateOutput = () => {
					const latex = sg_inputs()[index]
					if (!ref_output || typeof latex !== 'string') {
						return
					}

					ref_output.innerHTML = katex.renderToString(latex, {
						displayMode: true,
						output: 'mathml',
						errorColor: `rgb(var(${BrTheme.CSSVars.ColorAccent}))`,
						throwOnError: false
					})
				}

				let time_update: ReturnType<typeof setTimeout> | undefined

				if (ref_textarea) {
					ref_textarea.value = data
					ref_textarea.oninput = () => {
						sg_inputs()[index] = ref_textarea.value
						// Don't call `.notify()` to avoid recreate elements
						saveStorageItem('inputs', sg_inputs())
						clearTimeout(time_update)
						time_update = setTimeout(() => fn_updateOutput(), 100)
					}
				}

				if (ref_delete) {
					ref_delete.disabled = sg_inputs().length <= 1
				}

				fn_updateOutput()
			}
		)
	})
}

function _initEvents(): void {
	delegateEvent(_ref_addLatex, 'click', () => {
		_addLatex(0)
	})

	delegateEvent(_ref_latexList, 'click', (ev) => {
		const button = (ev.target as HTMLElement).closest<HTMLButtonElement>('[data-command]')
		if (!button) {
			return
		}
		const command = button.dataset.command as EnumOf<typeof Commands>
		const getLatexIndex = () => {
			const li = button.closest('li')
			const children = [..._ref_latexList.children]
			const index = children.findIndex(v => v === li)
			return Math_clamp(index, 0, sg_inputs().length - 1)
		}

		switch (command) {
		case Commands.EquationNew:
			_selectedLatexIndex = getLatexIndex()
			_addLatex(_selectedLatexIndex + 1)
			break
		case Commands.EquationCopy:
			_selectedLatexIndex = getLatexIndex()
			navigator.clipboard.writeText([
				Settings.sg_prefix(),
				sg_inputs()[_selectedLatexIndex],
				Settings.sg_suffix()
			].join(''))
			break
		case Commands.EquationMathML:
			_selectedLatexIndex = getLatexIndex()
			_ref_mathmlDialog.biru.open()
			_ref_mathMLInput.value = html_beautify(
				button.closest('li')!.querySelector('output')!.firstElementChild!.innerHTML,
				{indent_size: 2}
			)
			break
		case Commands.EquationDelete:
			_selectedLatexIndex = getLatexIndex()
			sg_inputs().splice(_selectedLatexIndex, 1)
			sg_inputs.notify()
			break
		}
	})

	delegateEvent(_ref_mathMLCopy, 'click', () => {
		navigator.clipboard.writeText(_ref_mathMLInput.value)
	})

	delegateEvent(_ref_copyAll, 'click', () => {
		navigator.clipboard.writeText(
			sg_inputs().map(v => Settings.sg_prefix() + v + Settings.sg_suffix()).join('\n\n')
		)
	})
}

export default () => {
	_initEvents()
	_initSubscriber()
	sg_inputs.notify() // must after _initSubscriber()
}