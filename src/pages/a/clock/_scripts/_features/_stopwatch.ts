import { ObservableStore } from "@/utils/store"
import { $, $$, $$$ } from "../_core/_dom-utils"
import { ElementIds } from "../_shared/_ids"
import { CIcon } from "@/components/Icon"
import { isTargetValidElement } from "@/utils/element"
import { IconCodes } from "@/enums/icons"
import { isAnimationAllowed } from "@/utils/animation"
import { AnimationEasing } from "@/enums/animation"
import { CSideBar } from "@/components/SideBar2"
import { CDrawer } from "@/components/Drawer"
import { Pages } from "../_shared/_enums"
import { AppCSSColors } from "@/enums/app-data"
import { CButton } from "@/components/Button"
import { Commands } from "../_shared/_commands"
import { CToast } from "@/components/Toast"
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
const _ref_toastCopied = $(ElementIds.toa_copied) as CToast.CElement
const _ref_laps = $(ElementIds.pgSw_laps) as HTMLDivElement
const _ref_lapsContent = $(ElementIds.pgSw_lapsContent) as HTMLDivElement
const _ref_page = $(ElementIds.pg_stopwatch) as HTMLDivElement
const _ref_HMS = $(ElementIds.pgSw_hhmmss) as HTMLSpanElement
const _ref_MS = $(ElementIds.pgSw_ms) as HTMLElement
const _ref_time = _ref_HMS.parentElement as HTMLHeadingElement
const _ref_moreButton = $(ElementIds.pgSw_moreBtn) as CButton.CElement
const _ref_moreMenu = $(ElementIds.pgSw_moreMenu) as HTMLDivElement
const _ref_resetOrLapButton = $(ElementIds.pgSw_resetLap) as CButton.CElement
const _ref_resetOrLapIcon = $$(`#${ElementIds.pgSw_resetLap}>.${CIcon.Classes.icon}`) as CIcon.CElement
const _ref_playOrPauseButton = $(ElementIds.pgSw_playPause) as CButton.CElement
const _ref_playOrPauseIcon = $$(`#${ElementIds.pgSw_playPause}>.${CIcon.Classes.icon}`) as CIcon.CElement
const _ref_playOrPauseSpan = $$(`#${ElementIds.pgSw_playPause}>span:not(.${CIcon.Classes.icon})`) as HTMLSpanElement
const _refs_navigationButtonIcon = $$$(`:is(.${CSideBar.Classes.button},.${CDrawer.Classes.button})[data-page=${Pages.stopwatch}] .${CIcon.Classes.icon}`)
let _interval: null | number | NodeJS.Timeout = null
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

	if (_interval !== null) {
		clearInterval(_interval)
	}

	if (!running) {return}

	_interval = setInterval(() => {
		StopwatchStore.update(v => v.ms += 10)
	}, 10)
}

function _subscribeRunningRefView(v: _StopwatchStoreType, o: _StopwatchStoreType): void {
	const running = v.running
	if (running === o.running) {return}

	_ref_playOrPauseSpan.textContent = running? 'Pause' : 'Start'
	CIcon.update(_ref_playOrPauseIcon, {
		Icon: {
			code: running? IconCodes.pause : IconCodes.play,
			filled: true
		}
	})
	CButton.CIcon.update(_ref_resetOrLapButton, {
		IconButton: {
			Icon: {
				code: running? IconCodes.flag : IconCodes.arrowReset
			}
		}
	})
	_ref_resetOrLapButton.setAttribute('aria-label', running? 'Lap' : 'Reset')
	_ref_resetOrLapButton.setAttribute('data-tooltip', running? 'Lap' : 'Reset')

	if (!isAnimationAllowed()) {return}

	_ref_resetOrLapIcon.animate({
		opacity: [0, 1],
		scale: [0, 1]
	}, _animationOption)
	_ref_playOrPauseSpan.animate({
		opacity: [0, 1],
		translate: [`${pxToRem(-8)}rem 0`, '0 0']
	}, _animationOption)
	_ref_playOrPauseIcon.animate({
		opacity: [0, 1],
		translate: [`${pxToRem(8)}rem 0`, '0 0']
	}, _animationOption)

	for (const ref of _refs_navigationButtonIcon) {
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

	_ref_HMS.textContent =  hour.toString() + ':' + [minute, second].map(v => v.toString().padStart(2, '0')).join(':')
	_ref_MS.textContent = Math.floor(ms / 10).toString().padStart(2, '0')
	const visible = v.ms > 0
	if (visible === _isResetOrLapButtonVisible) {return}

	const btnRect = _ref_playOrPauseButton.getBoundingClientRect()
	_isResetOrLapButtonVisible = visible
	if (visible) {
		_ref_resetOrLapButton.style.removeProperty('display')
	} else {
		_ref_resetOrLapButton.style.setProperty('display', 'none')
	}

	if (!isAnimationAllowed()) {return}

	const btnRect2 = _ref_playOrPauseButton.getBoundingClientRect()
	_ref_playOrPauseButton.animate({
		translate: [`${pxToRem(btnRect.x - btnRect2.x)}rem ${pxToRem(btnRect.y - btnRect2.y)}rem`, '0 0']
	}, _animationOption)
}

function _subscribeLapsRefView(v: _StopwatchStoreType, o: _StopwatchStoreType): void {
	const laps = v.laps
	const length = laps.length
	if (length === o.laps.length) {return}
	if (length <= 0) {
		const _timeRect = _ref_time.getBoundingClientRect()
		const _playBtnRect = _ref_playOrPauseButton.getBoundingClientRect()
		_isLapVisible = false
		_ref_moreButton.style.setProperty('display', 'none')
		_ref_laps.style.removeProperty('display')
		_ref_lapsContent.replaceChildren()
		if (!isAnimationAllowed()) {return}

		const _timeRect2 = _ref_time.getBoundingClientRect()
		const _playBtnRect2 = _ref_playOrPauseButton.getBoundingClientRect()
		_ref_playOrPauseButton.animate({
			translate: [`${pxToRem(_playBtnRect.x - _playBtnRect2.x)}rem ${pxToRem(_playBtnRect.y - _playBtnRect2.y)}rem`, '0 0']
		}, _animationOption)
		_ref_time.animate({
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
	_ref_lapsContent.replaceChildren(divRef, ...[..._ref_lapsContent.children])
	_ref_laps.scrollTo({top: 0, behavior: 'instant'})
	if (isAnimationAllowed()) {
		divRef.animate({
			opacity: [0, 1],
			transform: ['scaleX(.9)', 'scaleX(1)']
		}, {..._animationOption, duration: 500})
	}
	if (_isLapVisible) {return}

	const _timeRect = _ref_time.getBoundingClientRect()
	const _playBtnRect = _ref_playOrPauseButton.getBoundingClientRect()
	const _resetBtnRect = _ref_resetOrLapButton.getBoundingClientRect()
	_isLapVisible = true
	_ref_laps.style.setProperty('display', 'flex')
	_ref_moreButton.style.removeProperty('display')
	if (!isAnimationAllowed()) {return}

	const _timeRect2 = _ref_time.getBoundingClientRect()
	const _playBtnRect2 = _ref_playOrPauseButton.getBoundingClientRect()
	const _resetBtnRect2 = _ref_resetOrLapButton.getBoundingClientRect()
	_ref_laps.animate({
		opacity: [0, 1],
		scale: [.9, 1]
	}, _animationOption)
	_ref_moreButton.animate({
		scale: [0, 1],
		opacity: [0, 1]
	}, _animationOption)
	_ref_time.animate({
		translate: [`${pxToRem(_timeRect.x - _timeRect2.x)}rem ${pxToRem(_timeRect.y - _timeRect2.y)}rem`, '0 0']
	}, _animationOption)
	_ref_playOrPauseButton.animate({
		translate: [`${pxToRem(_playBtnRect.x - _playBtnRect2.x)}rem ${pxToRem(_playBtnRect.y - _playBtnRect2.y)}rem`, '0 0']
	}, _animationOption)
	_ref_resetOrLapButton.animate({
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
		CToast.open(_ref_toastCopied)
	})
}

function _initEvents(): void {
	_ref_page.addEventListener('click', () => {
		const ref_btn = document.activeElement as CButton.CElement
		if (!isTargetValidElement(_ref_page, ref_btn)) {
			return
		}

		const value = StopwatchStore.value
		switch (ref_btn) {
		case _ref_playOrPauseButton:
			StopwatchStore.update(v => v.running = !v.running)
			break
		case _ref_resetOrLapButton:
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

	_ref_moreMenu.addEventListener('beforetoggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		CButton.update(_ref_moreButton, {
			Button: {focused: isOpen}
		})
	})

	_ref_moreMenu.addEventListener('click', () => {
		const ref_btn = document.activeElement as CButton.CElement
		if (!isTargetValidElement(_ref_moreMenu, ref_btn)) return

		const command = ref_btn.dataset.command
		const closeMenu = () => _ref_moreMenu.hidePopover()
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