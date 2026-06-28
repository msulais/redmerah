import * as Constant from '../shared/constant.enum.js'
import * as Ids from '../shared/ids.enum.js'
import * as BrDialog from '@/web-components/components/br-dialog.js'
import * as Icons from '@/enums/icons.enum.js'
import * as BrTheme from '@/web-components/components/br-theme.js'
import * as BrIcon from '@/web-components/components/br-icon.js'
import * as WebComponents from '@/web-components/global-attributes.js'
import { $, $$ } from '../core/dom-utils.js'
import { batch, signal } from "@/utils/signal"
import { safeNumber } from '@/utils/number.js'
import { saveStorageItem } from '../core/database.js'
import { delegateEvent } from '@/utils/event-registry.js'

export const sg_running        = signal(Constant.DEFAULT_TIMER_RUNNING)
export const sg_timerInSeconds = signal(Constant.DEFAULT_TIMER_SECONDS)
export const sg_currectSeconds = signal(Constant.DEFAULT_TIMER_SECONDS)

const _ref_audio           = $(Ids.PageTimerAudio) as HTMLAudioElement
const _ref_doneDialog      = $(Ids.PageTimerDoneDialog) as BrDialog.BiruDialogElement
const _ref_doneTimeInfo    = $(Ids.PageTimerDoneTime) as HTMLParagraphElement
const _ref_doneDate        = $(Ids.PageTimerDoneDate) as HTMLParagraphElement
const _ref_playPauseButton = $(Ids.PageTimerPlayPause) as HTMLButtonElement
const _ref_timerView       = $(Ids.PageTimerTime) as HTMLHeadingElement
const _ref_editDialog      = $(Ids.PageTimerEditDialog) as BrDialog.BiruDialogElement
const _ref_editHours       = $(Ids.PageTimerHours) as HTMLInputElement
const _ref_editMinutes     = $(Ids.PageTimerMinutes) as HTMLInputElement
const _ref_editSeconds     = $(Ids.PageTimerSeconds) as HTMLInputElement
const _ref_editSaveButton  = $(Ids.PageTimerSave) as HTMLButtonElement
const _ref_playPauseIcon   = $$(BrIcon.TAGNAME, _ref_playPauseButton) as BrIcon.BiruIconElement
const _ref_playPauseText   = $$(`span`, _ref_playPauseButton) as HTMLSpanElement
const _ref_editResetButton = $(Ids.PageTimerEditReset) as HTMLButtonElement
const _ref_editResetIcon   = $$(BrIcon.TAGNAME, _ref_editResetButton) as BrIcon.BiruIconElement
let time_running: ReturnType<typeof setInterval> | undefined

function _doneAlert(): void {
	let text = ''
	let seconds = sg_timerInSeconds()
	if (seconds >= 3600) {
		const hours = Math.floor(seconds / 3600)
		text = hours + ' hour' + (hours > 1? 's' : '')
		seconds = Math.floor(seconds % 3600)
	}
	if (seconds >= 60) {
		if (text !== '') text += ', '
		const minutes = Math.floor(seconds / 60)
		text += minutes + ' minute' + (minutes > 1? 's' : '')
		seconds = Math.floor(seconds % 60)
	}
	if (seconds > 0) {
		if (text !== '') text += ', '
		text = seconds + ' second' + (seconds > 1? 's' : '')
	}

	_ref_doneTimeInfo.textContent = text === ''? '0 second' : text
	_ref_doneDate.textContent = 'Finished at ' + new Date().toLocaleTimeString('en', {hour: 'numeric', minute: 'numeric', second: 'numeric'})
	_ref_doneDialog.biru.open()
	_ref_audio.play()
}

function _showEditModal(): void {
	let seconds = sg_currectSeconds()
	let minutes = 0
	let hours = 0
	if (seconds >= 3600) {
		hours = Math.floor(seconds / 3600)
		seconds = Math.floor(seconds % 3600)
	}
	if (seconds >= 60) {
		minutes = Math.floor(seconds / 60)
		seconds = Math.floor(seconds % 60)
	}

	_ref_editHours.valueAsNumber = hours
	_ref_editMinutes.valueAsNumber = minutes
	_ref_editSeconds.valueAsNumber = seconds
	_ref_editDialog.biru.open()
}

function _initSubscriber(): void {
	sg_running.subscribe(v => {
		clearInterval(time_running)
		_ref_playPauseText.textContent = v? 'Pause' : 'Start'
		_ref_playPauseIcon.innerHTML = v? Icons.PauseFilled : Icons.PlayFilled
		if (!v) {
			const isNotStarted = sg_timerInSeconds() === sg_currectSeconds()
			_ref_timerView.style.removeProperty('color')
			_ref_editResetButton.style.removeProperty('display')
			_ref_editResetIcon.innerHTML = isNotStarted? Icons.Edit : Icons.History
			_ref_editResetButton.setAttribute(WebComponents.GlobalAttributes.Tooltip, isNotStarted? 'Edit timer' : 'Reset timer')
		}
		else {
			_ref_editResetButton.style.setProperty('display', 'none')
			_ref_timerView.style.setProperty('color', `rgb(var(${BrTheme.CSSVars.ColorAccent}))`)
			const cancel = () => {
				_doneAlert()
				sg_running.set(false)
				sg_currectSeconds.set(sg_timerInSeconds())
				clearInterval(time_running)
			}
			time_running = setInterval(() => {
				if (sg_currectSeconds() <= 0) {
					return cancel()
				}

				sg_currectSeconds.set(v => Math.max(v - 1, 0))
				if (sg_currectSeconds() <= 0) {
					return cancel()
				}
			}, 1000)
		}
	})

	sg_timerInSeconds.subscribe(v => {
		saveStorageItem('page-timer-seconds', v)
	})

	sg_currectSeconds.subscribe(v => {
		let seconds = v
		let minutes = 0
		let hours = 0
		if (seconds >= 3600) {
			hours = Math.floor(seconds / 3600)
			seconds = Math.floor(seconds % 3600)
		}
		if (seconds >= 60) {
			minutes = Math.floor(seconds / 60)
			seconds = Math.floor(seconds % 60)
		}

		_ref_timerView.textContent = [hours, minutes, seconds].map(v => `${v}`.padStart(2, '0')).join(':')
	})
}

function _initEvents(): void {
	delegateEvent(_ref_playPauseButton, 'click', () => {
		sg_currectSeconds.set(v => sg_running()? v : (v - 1))
		sg_running.set(v => !v)
	})

	delegateEvent(_ref_editResetButton, 'click', () => {
		if (sg_currectSeconds() === sg_timerInSeconds()) {
			_showEditModal()
		}
		else {
			sg_currectSeconds.set(sg_timerInSeconds())
			_ref_editResetButton.setAttribute(WebComponents.GlobalAttributes.Tooltip, 'Edit timer')
			_ref_editResetIcon.innerHTML = Icons.Edit
		}
	})

	delegateEvent(_ref_editSaveButton, 'click', () => {
		const seconds = Math.floor(safeNumber(
			(_ref_editHours.valueAsNumber * 3600)
			+ (_ref_editMinutes.valueAsNumber * 60)
			+ _ref_editSeconds.valueAsNumber
		))

		batch(() => {
			sg_timerInSeconds.set(seconds)
			sg_currectSeconds.set(seconds)
		})
	})

	delegateEvent(_ref_doneDialog, BrDialog.EventTypes.Toggle, () => {
		if (!_ref_doneDialog.biru.isOpen) {
			_ref_audio.pause()
		}
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}