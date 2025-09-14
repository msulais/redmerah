import { ObservableStore } from "@/utils/store"
import { $, $$, $$$ } from "../_core/_dom-utils"
import { ElementIds } from "../_shared/_ids"
import { IconClasses, updateIconRef, type IconElement } from "@/components/Icon"
import { isTargetValidElement } from "@/utils/element"
import { IconCodes } from "@/enums/icons"
import { isAnimationAllowed } from "@/utils/animation"
import { AnimationEasing } from "@/enums/animation"
import { SideBarClasses } from "@/components/SideBar2"
import { DrawerClasses } from "@/components/Drawer"
import { Pages } from "../_shared/_enums"
import { AppCSSColors } from "@/enums/app-data"
import { updateButtonRef, updateIconButtonRef } from "@/components/Button"
import { Commands } from "../_shared/_commands"
import { openToastRef, type ToastElement } from "@/components/Toast"
import { DEFAULT_STOPWATCH_MS, DEFAULT_STOPWATCH_RUNNING, DEFAULT_STOPWATCH_LAPS } from "../_shared/_constant"
import { pxToRem } from "@/utils/css"

type _StopwatchStoreType = {
	ms: number
	running: boolean
	laps: number[]
}

export const StopwatchStore = new ObservableStore<_StopwatchStoreType>({
	ms: DEFAULT_STOPWATCH_MS,
	running: DEFAULT_STOPWATCH_RUNNING,
	laps: DEFAULT_STOPWATCH_LAPS
})
const _animationOption = {duration: 250, easing: AnimationEasing.spring}
const _toastCopiedRef = $(ElementIds.toa_copied) as ToastElement
const _lapsRef = $(ElementIds.pgSw_laps) as HTMLDivElement
const _lapsContentRef = $(ElementIds.pgSw_lapsContent) as HTMLDivElement
const _pageRef = $(ElementIds.pg_stopwatch) as HTMLDivElement
const _HMSRef = $(ElementIds.pgSw_hhmmss) as HTMLSpanElement
const _MSRef = $(ElementIds.pgSw_ms) as HTMLElement
const _timeRef = _HMSRef.parentElement as HTMLHeadingElement
const _moreButtonRef = $(ElementIds.pgSw_moreBtn) as HTMLButtonElement
const _moreMenuRef = $(ElementIds.pgSw_moreMenu) as HTMLDivElement
const _resetOrLapButtonRef = $(ElementIds.pgSw_resetLap) as HTMLButtonElement
const _resetOrLapIconRef = $$(`#${ElementIds.pgSw_resetLap}>.${IconClasses.icon}`) as IconElement
const _playOrPauseButtonRef = $(ElementIds.pgSw_playPause) as HTMLButtonElement
const _playOrPauseIconRef = $$(`#${ElementIds.pgSw_playPause}>.${IconClasses.icon}`) as IconElement
const _playOrPauseSpanRef = $$(`#${ElementIds.pgSw_playPause}>span:not(.${IconClasses.icon})`) as HTMLSpanElement
const _navigationButtonIconRefs = $$$(`:is(.${SideBarClasses.button},.${DrawerClasses.button})[data-page=${Pages.stopwatch}] .${IconClasses.icon}`)
let _intervalId: null | number | NodeJS.Timeout = null
let _isResetOrLapButtonVisible = false
let _isLapVisible = false

function _msText(ms: number): string {
	let hour = 0
	let minute = 0
	let second = 0
	if (ms >= 3_600_000) {
		hour = Math.floor(ms / 3_600_000)
		ms = Math.floor(ms % 3_600_000)
	}
	if (ms >= 60_000) {
		minute = Math.floor(ms / 60_000)
		ms = Math.floor(ms % 60_000)
	}
	if (ms >= 1000) {
		second = Math.floor(ms / 1000)
		ms = Math.floor(ms % 1000)
	}

	ms = Math.floor(ms / 10)
	return (
		hour.toString()
		+ ':'
		+ [minute, second].map(v => v.toString().padStart(2, '0')).join(':')
		+ ','
		+ ms.toString().padStart(2, '0')
	)
}

function _subscribeRunningChanges(v: _StopwatchStoreType, o: _StopwatchStoreType): void {
	const running = v.running
	if (running === o.running) {return}

	if (_intervalId !== null) {
		clearInterval(_intervalId)
	}

	if (!running) {return}

	_intervalId = setInterval(() => {
		StopwatchStore.update(v => v.ms += 10)
	}, 10)
}

function _subscribeRunningRefView(v: _StopwatchStoreType, o: _StopwatchStoreType): void {
	const running = v.running
	if (running === o.running) {return}

	_playOrPauseSpanRef.textContent = running? 'Pause' : 'Start'
	updateIconRef(_playOrPauseIconRef, {
		IconCode: running? IconCodes.pause : IconCodes.play,
		IconFilled: true
	})
	updateIconButtonRef(_resetOrLapButtonRef, {
		IconButtonIcon: {
			IconCode: running? IconCodes.flag : IconCodes.arrowReset
		}
	})
	_resetOrLapButtonRef.setAttribute('aria-label', running? 'Lap' : 'Reset')
	_resetOrLapButtonRef.setAttribute('data-tooltip', running? 'Lap' : 'Reset')

	if (!isAnimationAllowed()) {return}

	_resetOrLapIconRef.animate({
		opacity: [0, 1],
		scale: [0, 1]
	}, _animationOption)
	_playOrPauseSpanRef.animate({
		opacity: [0, 1],
		translate: [`${pxToRem(-8)}rem 0`, '0 0']
	}, _animationOption)
	_playOrPauseIconRef.animate({
		opacity: [0, 1],
		translate: [`${pxToRem(8)}rem 0`, '0 0']
	}, _animationOption)

	for (const ref of _navigationButtonIconRefs) {
		if (running) {
			ref.style.setProperty('color', `rgb(${AppCSSColors.accent})`)
			ref.animate({
				rotate: ['0deg', '45deg', '-45deg', '45deg', '0deg']
			}, {..._animationOption, duration: 1000, iterations: Infinity})
		} else {
			ref.style.removeProperty('color')
			ref.getAnimations().forEach(v => v.cancel())
		}
	}
}

function _subscribeMSRefView(v: _StopwatchStoreType, o: _StopwatchStoreType): void {
	let ms = v.ms
	if (ms === o.ms) {return}

	let hour = 0
	let minute = 0
	let second = 0
	if (ms >= 3_600_000) {
		hour = Math.floor(ms / 3_600_000)
		ms = Math.floor(ms % 3_600_000)
	}
	if (ms >= 60_000) {
		minute = Math.floor(ms / 60_000)
		ms = Math.floor(ms % 60_000)
	}
	if (ms >= 1000) {
		second = Math.floor(ms / 1000)
		ms = Math.floor(ms % 1000)
	}

	_HMSRef.textContent =  hour.toString() + ':' + [minute, second].map(v => v.toString().padStart(2, '0')).join(':')
	_MSRef.textContent = Math.floor(ms / 10).toString().padStart(2, '0')
	const visible = v.ms > 0
	if (visible === _isResetOrLapButtonVisible) {return}

	const btnRect = _playOrPauseButtonRef.getBoundingClientRect()
	_isResetOrLapButtonVisible = visible
	if (visible) {
		_resetOrLapButtonRef.style.removeProperty('display')
	} else {
		_resetOrLapButtonRef.style.setProperty('display', 'none')
	}

	if (!isAnimationAllowed()) {return}

	const btnRect2 = _playOrPauseButtonRef.getBoundingClientRect()
	_playOrPauseButtonRef.animate({
		translate: [`${pxToRem(btnRect.x - btnRect2.x)}rem ${pxToRem(btnRect.y - btnRect2.y)}rem`, '0 0']
	}, _animationOption)
}

function _subscribeLapsRefView(v: _StopwatchStoreType, o: _StopwatchStoreType): void {
	const laps = v.laps
	const length = laps.length
	if (length === o.laps.length) {return}
	if (length <= 0) {
		const _timeRect = _timeRef.getBoundingClientRect()
		const _playBtnRect = _playOrPauseButtonRef.getBoundingClientRect()
		_isLapVisible = false
		_moreButtonRef.style.setProperty('display', 'none')
		_lapsRef.style.removeProperty('display')
		_lapsContentRef.replaceChildren()
		if (!isAnimationAllowed()) {return}

		const _timeRect2 = _timeRef.getBoundingClientRect()
		const _playBtnRect2 = _playOrPauseButtonRef.getBoundingClientRect()
		_playOrPauseButtonRef.animate({
			translate: [`${pxToRem(_playBtnRect.x - _playBtnRect2.x)}rem ${pxToRem(_playBtnRect.y - _playBtnRect2.y)}rem`, '0 0']
		}, _animationOption)
		_timeRef.animate({
			translate: [`${pxToRem(_timeRect.x - _timeRect2.x)}rem ${pxToRem(_timeRect.y - _timeRect2.y)}rem`, '0 0']
		}, _animationOption)
		return
	}

	const divRef = document.createElement('div')
	const spanLapRef   = document.createElement('span')
	const spanTimeRef  = document.createElement('span')
	const spanTotalRef = document.createElement('span')
	const lap = laps[0]
	let diff = lap
	if (laps.length > 1) {
		diff = diff - laps[1]
	}

	spanLapRef.textContent = length + ''
	spanTotalRef.textContent = _msText(lap)
	spanTimeRef.textContent = _msText(diff)
	divRef.tabIndex = 0
	divRef.append(spanLapRef, spanTimeRef, spanTotalRef)
	_lapsContentRef.replaceChildren(divRef, ...[..._lapsContentRef.children])
	_lapsRef.scrollTo({top: 0, behavior: 'instant'})
	if (isAnimationAllowed()) {
		divRef.animate({
			opacity: [0, 1],
			transform: ['scaleX(.9)', 'scaleX(1)']
		}, {..._animationOption, duration: 500})
	}
	if (_isLapVisible) {return}

	const _timeRect = _timeRef.getBoundingClientRect()
	const _playBtnRect = _playOrPauseButtonRef.getBoundingClientRect()
	const _resetBtnRect = _resetOrLapButtonRef.getBoundingClientRect()
	_isLapVisible = true
	_lapsRef.style.setProperty('display', 'flex')
	_moreButtonRef.style.removeProperty('display')
	if (!isAnimationAllowed()) {return}

	const _timeRect2 = _timeRef.getBoundingClientRect()
	const _playBtnRect2 = _playOrPauseButtonRef.getBoundingClientRect()
	const _resetBtnRect2 = _resetOrLapButtonRef.getBoundingClientRect()
	_lapsRef.animate({
		opacity: [0, 1],
		scale: [.9, 1]
	}, _animationOption)
	_moreButtonRef.animate({
		scale: [0, 1],
		opacity: [0, 1]
	}, _animationOption)
	_timeRef.animate({
		translate: [`${pxToRem(_timeRect.x - _timeRect2.x)}rem ${pxToRem(_timeRect.y - _timeRect2.y)}rem`, '0 0']
	}, _animationOption)
	_playOrPauseButtonRef.animate({
		translate: [`${pxToRem(_playBtnRect.x - _playBtnRect2.x)}rem ${pxToRem(_playBtnRect.y - _playBtnRect2.y)}rem`, '0 0']
	}, _animationOption)
	_resetOrLapButtonRef.animate({
		translate: [`${pxToRem(_resetBtnRect.x - _resetBtnRect2.x)}rem ${pxToRem(_resetBtnRect.y - _resetBtnRect2.y)}rem`, '0 0']
	}, _animationOption)
}

function _initSubscriber(): void {
	StopwatchStore.subscribe(_subscribeRunningChanges)
	StopwatchStore.subscribe(_subscribeRunningRefView)
	StopwatchStore.subscribe(_subscribeMSRefView)
	StopwatchStore.subscribe(_subscribeLapsRefView)
}

function _copyLaps(time: boolean, total: boolean, ms: boolean = false): void {
	const laps = StopwatchStore.value.laps
	let text = ''
	if (time && total) {
		text = 'Laps\tTime\tTotal'
	}

	const length = laps.length
	for (let i = 0; i < length; i++) {
		const lap = laps[i]
		if (text.length > 0) {
			text += '\n'
		}

		let diff = lap
		if (i < length - 1) {
			diff = diff - laps[i + 1]
		}
		if (time && total) {
			text += [
				length - i,
				ms? diff : _msText(diff),
				ms? lap : _msText(lap)
			].join('\t')
		}
		else if (time) {
			text += (ms? diff : _msText(diff))
		}
		else if (total) {
			text += (ms? lap : _msText(lap))
		}
	}

	navigator.clipboard.writeText(text).then(() => {
		openToastRef(_toastCopiedRef)
	})
}

function _initEvents(): void {
	_pageRef.addEventListener('click', () => {
		const buttonRef = document.activeElement as HTMLButtonElement
		if (!isTargetValidElement(_pageRef, buttonRef)) {
			return
		}

		const value = StopwatchStore.value
		switch (buttonRef) {
		case _playOrPauseButtonRef:
			StopwatchStore.update(v => v.running = !v.running)
			break
		case _resetOrLapButtonRef:
			if (value.running) {
				StopwatchStore.update(v => v.laps = [v.ms, ...v.laps])
			}
			else {
				StopwatchStore.update(v => {
					v.ms = 0
					v.laps = []
				})
			}
		}
	})

	_moreMenuRef.addEventListener('beforetoggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		updateButtonRef(_moreButtonRef, {
			ButtonFocused: isOpen
		})
	})

	_moreMenuRef.addEventListener('click', () => {
		const buttonRef = document.activeElement as HTMLButtonElement
		if (!isTargetValidElement(_moreMenuRef, buttonRef)) return

		const command = buttonRef.dataset.command
		const closeMenu = () => _moreMenuRef.hidePopover()
		switch (command as Commands) {
		case Commands.swCpLp_time:
			_copyLaps(true, false)
			closeMenu()
			break
		case Commands.swCpLp_total:
			_copyLaps(false, true)
			closeMenu()
			break
		case Commands.swCpLp_all:
			_copyLaps(true, true)
			closeMenu()
			break
		case Commands.swCpLp_timeMS:
			_copyLaps(true, false, true)
			closeMenu()
			break
		case Commands.swCpLp_totalMS:
			_copyLaps(false, true, true)
			closeMenu()
			break
		case Commands.swCpLp_allMS:
			_copyLaps(true, true, true)
			closeMenu()
			break
		}
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}