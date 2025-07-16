import { ObservableStore } from "@/utils/store"
import { $, $$, $$$ } from "../_core/_dom-utils"
import { ElementIds } from "../_shared/_ids"
import { type ButtonElement, type IconButtonElement } from "@/components/Button"
import { IconClasses, updateIconRef, type IconElement } from "@/components/Icon"
import { isTargetValidElement } from "@/utils/element"
import { AppCSSColors } from "@/enums/app-data"
import { AnimationEffectTiming } from "@/enums/animation"
import { isAnimationAllowed } from "@/utils/animation"
import { IconCodes } from "@/enums/icons"
import { SideBarClasses } from "@/components/SideBar"
import { Pages } from "../_shared/_enums"
import { DrawerClasses } from "@/components/Drawer"
import type { DialogElement } from "@/components/Dialog"
import { safeNumber } from "@/utils/number"
import { saveStorageItem } from "../_core/_database"
import { DEFAULT_TIMER_RUNNING, DEFAULT_TIMER_SECONDS } from "../_shared/_constant"

export type TimerStoreType = Readonly<{
	running: boolean
	timerInSeconds: number
	currentSeconds: number
}>

export const TimerStore = new ObservableStore<TimerStoreType>({
	running: DEFAULT_TIMER_RUNNING,
	timerInSeconds: DEFAULT_TIMER_SECONDS,
	currentSeconds: DEFAULT_TIMER_SECONDS,
})
const _pageRef = $(ElementIds.pg_timer) as HTMLDivElement
const _audioRef = $(ElementIds.pgTm_audio) as HTMLAudioElement
const _doneDialogRef = $(ElementIds.pgTm_doneDialog) as DialogElement
const _doneTimeInfoRef = $(ElementIds.pgTm_doneTime) as HTMLParagraphElement
const _doneDateRef = $(ElementIds.pgTm_doneDate) as HTMLParagraphElement
const _playPauseButtonRef = $(ElementIds.pgTm_playPause) as ButtonElement
const _timerViewRef = $(ElementIds.pgTm_time) as HTMLHeadingElement
const _editDialogRef = $(ElementIds.pgTm_editDialog) as DialogElement
const _editHoursRef = $(ElementIds.pgTm_hours) as HTMLInputElement
const _editMinutesRef = $(ElementIds.pgTm_minutes) as HTMLInputElement
const _editSecondsRef = $(ElementIds.pgTm_seconds) as HTMLInputElement
const _editSaveButtonRef = $(ElementIds.pgTm_save) as ButtonElement
const _playPauseIconRef = $$(`.${IconClasses.icon}`, _playPauseButtonRef) as IconElement
const _playPauseTextRef = $$(`span:not(.${IconClasses.icon})`, _playPauseButtonRef) as HTMLSpanElement
const _editResetButtonRef = $(ElementIds.pgTm_editReset) as IconButtonElement
const _editResetIconRef = $$(`#${ElementIds.pgTm_editReset}>.${IconClasses.icon}`) as IconElement
const _navigationButtonIconRefs = $$$(`:is(.${SideBarClasses.button},.${DrawerClasses.button})[data-page=${Pages.timer}] .${IconClasses.icon}`)
let intervalRunningId: number | NodeJS.Timeout | null = null

function _doneAlert(): void {
	let text = ''
	let seconds = TimerStore.value.timerInSeconds
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

	_doneTimeInfoRef.textContent = text === ''? '0 second' : text
	_doneDateRef.textContent = 'Finished at ' + new Date().toLocaleTimeString('en', {hour: 'numeric', minute: 'numeric', second: 'numeric'})
	_doneDialogRef.showModal()
	_audioRef.play()
}

function _subscribeTimerInSeconds(v: TimerStoreType, o: TimerStoreType): void {
	const va = v.timerInSeconds
	if (va === o.timerInSeconds) return

	saveStorageItem('timer/seconds', va)
}

function _subscribeRunningRefView(v: TimerStoreType, o: TimerStoreType): void {
	const running = v.running
	if (running === o.running) return

	if (intervalRunningId !== null) {
		clearInterval(intervalRunningId)
	}

	const btnRect = _playPauseButtonRef.getBoundingClientRect()
	_playPauseTextRef.textContent = running? 'Pause' : 'Start'
	updateIconRef(_playPauseIconRef, {
		IconCode: running? IconCodes.pause : IconCodes.play,
		IconFilled: true
	})

	for (const ref of _navigationButtonIconRefs) {
		ref.style.removeProperty('color')
		ref.getAnimations().forEach(v => v.cancel())
	}

	if (!running) {
		_timerViewRef.style.removeProperty('color')
		_editResetButtonRef.style.removeProperty('display')
		updateIconRef(_editResetIconRef, {
			IconCode: v.timerInSeconds === v.currentSeconds? IconCodes.edit : IconCodes.history
		})
		_editResetButtonRef.setAttribute('data-tooltip', v.timerInSeconds === v.currentSeconds? 'Edit timer' : 'Reset timer')
	}
	else {
		_editResetButtonRef.style.setProperty('display', 'none')
		_timerViewRef.style.setProperty('color', `rgb(${AppCSSColors.accent})`)
		const cancel = () => {
			_doneAlert()
			TimerStore.update(v => {
				v.running = false
				v.currentSeconds = v.timerInSeconds
			})
			if (intervalRunningId !== null) {
				clearInterval(intervalRunningId)
			}
		}
		intervalRunningId = setInterval(() => {
			const oldseconds = TimerStore.value.currentSeconds
			if (oldseconds <= 0) {
				return cancel()
			}

			TimerStore.update(v => v.currentSeconds = Math.max(v.currentSeconds - 1, 0))
			const seconds = TimerStore.value.currentSeconds
			if (seconds <= 0) {
				return cancel()
			}
		}, 1000)
	}

	if (isAnimationAllowed()) {
		const options = {duration: 250, easing: AnimationEffectTiming.spring}
		const btnRect2 = _playPauseButtonRef.getBoundingClientRect()
		_editResetButtonRef.animate({
			scale: [0, 1],
			opacity: [0, 1]
		}, options)
		_playPauseTextRef.animate({
			opacity: [0, 1],
			translate: ['-8px 0', '0 0']
		}, options)
		_playPauseIconRef.animate({
			opacity: [0, 1],
			translate: ['8px 0', '0 0']
		}, options)
		_playPauseButtonRef.animate({
			translate: [[btnRect.left - btnRect2.left + 'px', '0px'].join(' '), '0 0']
		}, options)
		if (running) {
			for (const ref of _navigationButtonIconRefs) {
				ref.style.setProperty('color', `rgb(${AppCSSColors.accent})`)
				ref.animate({
					scale: [1, .85, 1],
					rotate: ['0deg', '180deg']
				}, {...options, duration: 1000, iterations: Infinity})
			}
		}
	}
}

function _subscribeCurrentSecondsRefView(v: TimerStoreType, o: TimerStoreType): void {
	let seconds = v.currentSeconds
	if (seconds === o.currentSeconds) return

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

	_timerViewRef.textContent = [hours, minutes, seconds].map(v => `${v}`.padStart(2, '0')).join(':')
}

function _initSubscriber(): void {
	TimerStore.subscribe(_subscribeCurrentSecondsRefView)
	TimerStore.subscribe(_subscribeRunningRefView)
	TimerStore.subscribe(_subscribeTimerInSeconds)
}

function _showEditModal(): void {
	let seconds = TimerStore.value.currentSeconds
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

	_editHoursRef.valueAsNumber = hours
	_editMinutesRef.valueAsNumber = minutes
	_editSecondsRef.valueAsNumber = seconds
	_editDialogRef.showModal()
}

function _initEvents(): void {
	_pageRef.addEventListener('click', () => {
		const buttonRef = document.activeElement
		if (!isTargetValidElement(_pageRef, buttonRef)) return

		const value = TimerStore.value
		switch (buttonRef) {
		case _playPauseButtonRef:
			TimerStore.update(v => {
				const running = v.running
				v.currentSeconds = running? v.currentSeconds : (v.currentSeconds - 1)
				v.running = !running
			})
			break
		case _editResetButtonRef:
			if (value.currentSeconds === value.timerInSeconds) {
				_showEditModal()
			} else {
				TimerStore.update(v => v.currentSeconds = v.timerInSeconds)
				_editResetButtonRef.setAttribute('data-tooltip', 'Edit timer')
				updateIconRef(_editResetIconRef, {
					IconCode: IconCodes.edit
				})

				if (isAnimationAllowed()) {
					_editResetIconRef.animate({
						scale: [0, 1],
						opacity: [0, 1]
					}, {duration: 250, easing: AnimationEffectTiming.spring})
				}
			}
		}
	})

	_editSaveButtonRef.addEventListener('click', () => {
		const seconds = Math.floor(safeNumber(
			(_editHoursRef.valueAsNumber * 3600)
			+ (_editMinutesRef.valueAsNumber * 60)
			+ _editSecondsRef.valueAsNumber
		))

		TimerStore.update(v => v.timerInSeconds = v.currentSeconds = seconds)
	})

	_doneDialogRef.addEventListener('close', () => {
		_audioRef.pause()
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}