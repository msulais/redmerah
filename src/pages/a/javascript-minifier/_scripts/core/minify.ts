import * as Constant from '../shared/constant.enum.js'
import * as Settings from './settings.js'
import * as BrTheme from '@/web-components/components/br-theme.js'
import * as Ids from '../shared/ids.enum.js'
import beautify from 'js-beautify'
import { minify } from "terser"
import { $ } from './dom-utils.js'
import { signal, subscribe } from "@/utils/signal"
import { delegateEvent } from '@/utils/event-registry.js'
import { saveStorageItem } from './database.js'

export const sg_input = signal(Constant.DEFAULT_JAVASCRIPT_INPUT_TEXT)
export const sg_output = signal(Constant.DEFAULT_JAVASCRIPT_OUTPUT_TEXT)

const _ref_input = $(Ids.Input) as HTMLTextAreaElement
const _ref_output = $(Ids.Output) as HTMLTextAreaElement
const _ref_downloadOutput = $(Ids.PopoverAppBarMoreDownload) as HTMLButtonElement
const _ref_copyOutput = $(Ids.PopoverAppBarMoreCopy) as HTMLButtonElement

let _time_minify: ReturnType<typeof setTimeout> | undefined

function _minify(): void {
	clearTimeout(_time_minify)
	_time_minify = setTimeout(() => {
		minify(sg_input(), {
			keep_classnames: Settings.sg_keepClassNames(),
			keep_fnames: Settings.sg_keepFunctionNames(),
			module: Settings.sg_module(),
			toplevel: Settings.sg_topLevel(),
		}).then((data) => {
			let output = data.code ?? ''
			if (Settings.sg_beautify()) {
				output = beautify(output)
			}

			sg_output.set(output)
			_ref_output.style.removeProperty('color')
			_ref_copyOutput.disabled = _ref_downloadOutput.disabled = false
		}).catch((er) => {
			_ref_copyOutput.disabled = _ref_downloadOutput.disabled = true
			_ref_output.style.setProperty('color', `rgb(var(${BrTheme.CSSVars.ColorAccent}))`)
			sg_output.set(er + '')
		})
	}, 250)
}

function _initSubscriber() {
	sg_input.subscribe(v => {
		if (!_ref_input.matches(":focus")) {
			_ref_input.value = v
		}

		_minify()
		saveStorageItem('input', v)
	})

	sg_output.subscribe(v => {
		_ref_output.value = v
	})

	subscribe(() => {
		sg_input.notify()
	},
		Settings.sg_beautify,
		Settings.sg_keepClassNames,
		Settings.sg_keepFunctionNames,
		Settings.sg_module,
		Settings.sg_topLevel
	)
}

function _initEvents(): void {
	delegateEvent(_ref_input, 'input', () => {
		sg_input.set(_ref_input.value)
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}