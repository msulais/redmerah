import * as BrPopover from '@/web-components/components/br-popover.js'
import * as BrIcon from '@/web-components/components/br-icon.js'
import * as Icons from '@/enums/icons.enum.js'
import * as Constant from '../shared/constant.enum.js'
import * as Commands from '../shared/commands.enum.js'
import * as Ids from '../shared/ids.enum.js'
import * as WebComponents from '@/web-components/global-attributes.js'
import type { EnumOf } from '@/types/collections.js'
import { $, $$ } from '../core/dom-utils.js'
import { batch, signal } from '@/utils/signal'
import { delegateEvent } from '@/utils/event-registry.js'

export const sg_ms      = signal(Constant.DEFAULT_STOPWATCH_MS)
export const sg_running = signal(Constant.DEFAULT_STOPWATCH_RUNNING)
export const sg_laps    = signal(Constant.DEFAULT_STOPWATCH_LAPS)

const _ref_laps              = $(Ids.PageStopwatchLaps) as HTMLDivElement
const _ref_lapsContent       = $(Ids.PageStopwatchLapsContent) as HTMLElement
const _ref_HMS               = $(Ids.PageStopwatchHHMMSS) as HTMLSpanElement
const _ref_MS                = $(Ids.PageStopwatchMS) as HTMLElement
const _ref_moreButton        = $(Ids.PageStopwatchMoreBtn) as HTMLButtonElement
const _ref_morePopover       = $(Ids.PageStopwatchMorePopover) as BrPopover.BiruPopoverElement
const _ref_resetOrLapButton  = $(Ids.PageStopwatchResetLap) as HTMLButtonElement
const _ref_resetOrLapIcon    = $$(BrIcon.TAGNAME, _ref_resetOrLapButton) as BrIcon.BiruIconElement
const _ref_playOrPauseButton = $(Ids.PageStopwatchPlayPause) as HTMLButtonElement
const _ref_playOrPauseIcon   = $$(BrIcon.TAGNAME, _ref_playOrPauseButton) as BrIcon.BiruIconElement
const _ref_playOrPauseSpan   = $$(`span`, _ref_playOrPauseButton) as HTMLSpanElement
let _time_interval: ReturnType<typeof setInterval> | undefined

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

function _copyLaps(time: boolean, total: boolean, ms: boolean = false): void {
	const laps = sg_laps()
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

	navigator.clipboard.writeText(text)
}

function _initSubscriber(): void {
	sg_running.subscribe(v => {
		_ref_playOrPauseSpan.textContent = v? 'Pause' : 'Start'
		_ref_playOrPauseIcon.innerHTML = v? Icons.PauseFilled : Icons.PlayFilled
		_ref_resetOrLapIcon.innerHTML = v? Icons.Flag : Icons.ArrowReset
		_ref_resetOrLapButton.setAttribute('aria-label', v? 'Lap' : 'Reset')
		_ref_resetOrLapButton.setAttribute(WebComponents.GlobalAttributes.Tooltip, v? 'Lap' : 'Reset')

		clearInterval(_time_interval)
		if (v) {
			_time_interval = setInterval(() => {
				sg_ms.set(v => v + 10)
			}, 10)
		}
	})

	sg_ms.subscribe(v => {
		let ms = v
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
		const visible = v > 0
		if (visible) {
			_ref_resetOrLapButton.style.removeProperty('display')
		}
		else {
			_ref_resetOrLapButton.style.setProperty('display', 'none')
		}
	})

	sg_laps.subscribe(v => {
		if (v.length <= 0) {
			_ref_moreButton.style.setProperty('display', 'none')
			_ref_laps.style.removeProperty('display')
			_ref_lapsContent.replaceChildren()
			return
		}

		const ref_tr    = document.createElement('tr')
		const ref_lap   = document.createElement('td')
		const ref_time  = document.createElement('td')
		const ref_total = document.createElement('td')
		const ref_first = _ref_lapsContent.firstElementChild
		const lap = v[0]
		let diff = lap
		if (v.length > 1) {
			diff = diff - v[1]
		}

		ref_lap.textContent = v.length + ''
		ref_total.textContent = _msText(lap)
		ref_time.textContent = _msText(diff)
		ref_tr.tabIndex = 0
		ref_tr.append(ref_lap, ref_time, ref_total)
		if (ref_first) {
			ref_first.before(ref_tr)
		}
		else {
			_ref_lapsContent.append(ref_tr)
		}

		_ref_laps.style.setProperty('display', 'flex')
		_ref_moreButton.style.removeProperty('display')
	})
}

function _initEvents(): void {
	delegateEvent(_ref_playOrPauseButton, 'click', () => {
		sg_running.set(v => !v)
	})

	delegateEvent(_ref_resetOrLapButton, 'click', () => {
		if (sg_running()) {
			sg_laps().unshift(sg_ms())
			sg_laps.notify()
		}
		else {
			batch(() => {
				sg_ms.set(0)
				sg_laps.set([])
			})
		}
	})

	delegateEvent(_ref_morePopover, 'click', (ev) => {
		const ref_btn = (ev.target as HTMLElement)?.closest('[data-command]') as HTMLButtonElement | undefined
		if (!ref_btn) {
			return
		}

		const command = ref_btn.dataset.command
		switch (command as EnumOf<typeof Commands>) {
		case Commands.PageStopwatchCopyLapTime   : _copyLaps(true , false); break
		case Commands.PageStopwatchCopyLapTotal  : _copyLaps(false, true ); break
		case Commands.PageStopwatchCopyLapAll    : _copyLaps(true , true ); break
		case Commands.PageStopwatchCopyLapTimeMS : _copyLaps(true , false, true); break
		case Commands.PageStopwatchCopyLapTotalMS: _copyLaps(false, true , true); break
		case Commands.PageStopwatchCopyLapAllMS  : _copyLaps(true , true , true); break
		}
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}