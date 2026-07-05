import * as Constant from '../shared/constant.enum.js'
import * as Ids from '../shared/ids.enum.js'
import * as Settings from './settings.js'
import * as TabValues from '../shared/tab-values.enum.js'
import * as Tabs from './tabs.js'
import { $ } from './dom-utils.js'
import { signal, subscribe } from "@/utils/signal"
import { compileStringAsync } from "sass"
import { saveStorageItem } from './database.js'
import { delegateEvent } from '@/utils/event-registry.js'

export const sg_scss = signal(Constant.DEFAULT_SCSS_TEXT)
export const sg_sass = signal(Constant.DEFAULT_SASS_TEXT)

const _ref_inputSCSS = $(Ids.InputSCSS) as HTMLTextAreaElement
const _ref_inputSASS = $(Ids.InputSASS) as HTMLTextAreaElement
const _ref_outputCSS = $(Ids.OutputCSS) as HTMLTextAreaElement

let _time_update: ReturnType<typeof setTimeout> | undefined

function _updateOutput(): void {
	clearTimeout(_time_update)
	_time_update = setTimeout(() => {
		const isSASS = Tabs.sg_inputTab() === TabValues.InputSASS
		const text = isSASS? sg_sass() : sg_scss()
		compileStringAsync(text, {
			style: Settings.sg_minify()? 'compressed' : 'expanded',
			syntax: isSASS? 'indented' : 'scss',
		})
		.then((v) => _ref_outputCSS.value = v.css)
		.catch(() => _ref_outputCSS.value = '')
	}, 100)
}

function _initSubscriber(): void {
	sg_sass.subscribe(v => {
		if (!_ref_inputSASS.matches(':focus')) {
			_ref_inputSASS.value = v
		}

		saveStorageItem('input-sass', v)
	})

	sg_scss.subscribe(v => {
		if (!_ref_inputSCSS.matches(':focus')) {
			_ref_inputSCSS.value = v
		}

		saveStorageItem('input-scss', v)
	})

	subscribe(() =>
		_updateOutput(),
		Settings.sg_minify,
		Tabs.sg_inputTab,
		sg_sass,
		sg_scss
	)
}

function _initEvents(): void {
	delegateEvent(_ref_inputSCSS, 'input', () => {
		sg_scss.set(_ref_inputSCSS.value)
	})

	delegateEvent(_ref_inputSASS, 'input', () => {
		sg_sass.set(_ref_inputSASS.value)
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
	_updateOutput()
}