import { produce, type SetStoreFunction, type Store } from "solid-js/store"
import { batch, createEffect, createMemo, createSignal, createUniqueId, For, Match, onCleanup, onMount, Show, Switch, type VoidComponent } from "solid-js"

import type { Stopwatch, Timer } from "./_types"
import { Commands, Pages, StopwatchState, TimerState } from "./_enums"
import { attrSetIfExist } from "@/utils/attributes"
import { numberToString } from "@/utils/number"
import { stringMatch, stringPadStart, stringReplace, stringTrim } from "@/utils/string"
import { dateHours, dateMinutes, dateSeconds, dateValueOf } from "@/utils/datetime"
import { timeIntervalClear, timeIntervalSet, timeTimerClear, timeTimerSet } from "@/utils/time"
import { eventCurrentTarget, eventListenerAdd, eventListenerRemove } from "@/utils/event"
import { ICON_ARROW_RESET, ICON_CHEVRON_DOWN, ICON_CHEVRON_UP, ICON_COPY, ICON_DISMISS, ICON_DOCUMENT_ARROW_UP, ICON_EDIT, ICON_FLAG, ICON_MORE_VERTICAL, ICON_PAUSE, ICON_PLAY, ICON_TIMER } from "@/constants/icons"
import { KEY_ARROW_DOWN, KEY_ARROW_UP, KEY_DIGIT_0, KEY_DIGIT_1, KEY_DIGIT_2, KEY_DIGIT_3, KEY_DIGIT_4, KEY_DIGIT_5, KEY_DIGIT_6, KEY_DIGIT_7, KEY_DIGIT_8, KEY_DIGIT_9 } from "@/constants/key_code"
import { mathFloor } from "@/utils/math"
import { navigatorClipboardWriteText } from "@/utils/navigator"
import { promiseDone } from "@/utils/object"
import { regexTest } from "@/utils/regex"
import { fileDownload } from "@/utils/file"
import { documentActive } from "@/utils/document"
import { elementById, elementDataset, elementFocus, elementId, elementTagName, elementValidTarget } from "@/utils/element"
import { arrayIncludes, arrayLength, arrayPush, arrayReverse } from "@/utils/array"
import { openModal } from "@/components/Modal"
import ringtone from '@/assets/audio/simple-ringtone-84595.mp3'

import Button, { ButtonVariant, IconButton } from "@/components/Button"
import Icon from "@/components/Icon"
import Tooltip from "@/components/Tooltip"
import FocusableGroup from "@/components/FocusableGroup"
import Menu, { closeMenu, MenuDivider, MenuIndent, MenuItem, openMenu, SubMenu, SubMenuItem } from "@/components/Menu"
import Dialog, { closeDialog, openDialog } from "@/components/Dialog"
import CSS from './_index.module.scss'


const BodyClock: VoidComponent = () => {
	const [hour, setHour] = createSignal(0)
	const [minute, setMinute] = createSignal(0)
	const [second, setSecond] = createSignal(0)
	const pad = (t: number) => stringPadStart(numberToString(t), 2, '0')
	const getTime = createMemo(() => {
		return pad(hour()) + ':' + pad(minute()) + ':' + pad(second())
	})
	const [date, setDate] = createSignal<Date>(new Date)
	let timeIntervalId: number | null = null
	let [$hour, $minute, $second] = [0, 0, 0]

	function updateDateTime(): void {
		clearTimeInterval()

		const d = new Date()
		setDate(d)
		$hour = dateHours(d)
		$minute = dateMinutes(d)
		$second = dateSeconds(d)
		setHour($hour)
		setMinute($minute)
		setSecond($second)

		let i = 0
		timeIntervalId = timeIntervalSet(() => {
			if (i >= 60) updateDateTime() // update date

			$second += 1
			if ($second >= 60) {
				$second = 0
				$minute += 1
			}
			if ($minute >= 60) {
				$minute = 0
				$hour += 1
			}
			if ($hour >= 24) {
				$hour = 0
			}
			setHour($hour)
			setMinute($minute)
			setSecond($second)
			++i
		}, 1000)
	}

	function clearTimeInterval(): void {
		if (timeIntervalId !== null) timeIntervalClear(timeIntervalId)
	}

	function initEvents(): void {
		const target = document
		const eventType = 'visibilitychange'
		eventListenerAdd(target, eventType, updateDateTime)

		onCleanup(() => {
			eventListenerRemove(target, eventType, updateDateTime)
		})
	}

	onMount(() => {
		updateDateTime()
		initEvents()
	})

	onCleanup(() => {
		clearTimeInterval()
	})

	return (<div class={CSS.bodyClock}>
		<h2>{getTime()}</h2>
		<p>{date().toLocaleDateString(undefined, {day: 'numeric', month: 'long', year: 'numeric'})}</p>
	</div>)
}

const BodyTimer: VoidComponent<{
	timer: [get: Store<Timer>, set: SetStoreFunction<Timer>]
	command(type: Commands, ...args: unknown[]): unknown
}> = (props) => {
	const buttonEditId = createUniqueId()
	const buttonStartId = createUniqueId()
	const buttonPauseId = createUniqueId()
	const buttonResetId = createUniqueId()
	const pad = (t: number, l: number = 2) => stringPadStart(numberToString(t), l, '0')
	const [inputHours, setInputHours] = createSignal(0)
	const [inputMinutes, setInputMinutes] = createSignal(0)
	const [inputSeconds, setInputSeconds] = createSignal(0)
	const [finishDate, setFinishDate] = createSignal(new Date)
	const getTimer = createMemo(() => props.timer[0])
	const setTimer = createMemo(() => props.timer[1])
	const getTimeIntervalId = createMemo(() => getTimer().timeIntervalId)
	const getSeconds = createMemo(() => getTimer().seconds)
	const getStartSeconds = createMemo(() => getTimer().startSeconds)
	const getState = createMemo(() => getTimer().state)
	const getCurrentTime = createMemo(() => {
		const $seconds = getSeconds()
		let seconds = $seconds
		if (seconds >= 60) seconds %= 60

		let minutes = mathFloor($seconds / 60)
		if (minutes >= 60) minutes %= 60

		let hours = mathFloor($seconds / 3_600)
		return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds)
	})
	const getFormattedTimeFromStartSeconds = createMemo(() => {
		const $seconds = getStartSeconds()
		let text = ''
		let seconds = $seconds
		if (seconds >= 60) seconds %= 60
		if (seconds > 0) text = seconds + (seconds > 1? ' seconds' : ' second')

		let minutes = mathFloor($seconds / 60)
		if (minutes >= 60) minutes %= 60
		if (minutes > 0) text = minutes + (minutes > 1? ' minutes' : ' minute') + ' ' + text

		let hours = mathFloor($seconds / 3_600)
		if (hours > 0) text = hours + (hours > 1? ' hours' : ' hour') + ' ' + text

		return stringTrim(stringReplace(text, /\s+/g, ' '))
	})
	let dialogEditRef: HTMLDialogElement
	let dialogFinishRef: HTMLDialogElement
	let audioRef: HTMLAudioElement
	let timeTimerPressId: null | number = null
	let timeIntervalPressId: null | number = null

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function startTimer(): void {
		setTimer()(produce(value => {
			if (value.seconds === value.startSeconds) {
				value.startDate = mathFloor(dateValueOf(new Date) / 1000)
			}
			if (value.startDate !== null && value.pauseDate !== null) {
				const diff = mathFloor(dateValueOf(new Date) / 1000) - value.pauseDate
				value.startDate += diff
			}

			value.state = TimerState.running
		}))
		elementFocus(elementById(buttonPauseId)!)
		clearTimeInterval()
		setTimer()('seconds', s => s - 1)
		if (getSeconds() <= 0) {
			finishTimer()
			return
		}
		setTimer()('timeIntervalId', timeIntervalSet(() => {
			setTimer()('seconds', s => s - 1)
			if (getSeconds() <= 0) {
				finishTimer()
			}
		}, 1000))
	}

	function finishTimer(): void {
		clearTimeInterval()
		setTimer()('state', TimerState.stopped)
		openModal(dialogFinishRef)
		setFinishDate(new Date)
		try {
			audioRef.play()
		} catch {}
	}

	function pauseTimer(): void {
		setTimer()(produce(value => {
			value.state = TimerState.stopped
			value.pauseDate = mathFloor(dateValueOf(new Date) / 1000)
		}))
		elementFocus(elementById(buttonStartId)!)
		clearTimeInterval()
	}

	function resetTimer(): void {
		setTimer()(produce(value => {
			value.state = TimerState.stopped
			value.startDate = null
			value.pauseDate = null
			value.seconds = getStartSeconds()
		}))
		if (getStartSeconds() > 0) elementFocus(elementById(buttonStartId)!)
		clearTimeInterval()
		audioRef.pause()
	}

	function clearTimeInterval(): void {
		if (getTimeIntervalId() !== null) timeIntervalClear(getTimeIntervalId()!)
	}

	function updateInputs(): void {
		const $seconds = getStartSeconds()

		batch(() => {
			let seconds = $seconds
			if (seconds >= 60) seconds %= 60

			let minutes = mathFloor($seconds / 60)
			if (minutes >= 60) minutes %= 60

			let hours = mathFloor($seconds / 3_600)
			setInputSeconds(seconds)
			setInputMinutes(minutes)
			setInputHours(hours)
		})
	}

	function onPointerDownInput(ev: PointerEvent & {currentTarget: HTMLDialogElement}): void {

		// let focus behaviour pass to button first
		timeTimerSet(() => {
			const button = documentActive()!
			if (!elementValidTarget(
				eventCurrentTarget(ev),
				button,
				el => {
					const isButton = elementTagName(el) === 'BUTTON'
					const dataInputAction = elementDataset(el, 'inputAction')
					const validData = dataInputAction
						? regexTest(/(up|down):(hour|minute|second)s/, dataInputAction)
						: false
					return isButton && Boolean(dataInputAction) && validData
				}
			)) return

			const dataInputAction = elementDataset(button, 'inputAction')!
			const match = stringMatch(dataInputAction, /(up|down):(hours|minutes|seconds)/)!
			const direction = match[1]
			const type = match[2]
			let value = 0
			switch (type) {
			case 'hours': value = inputHours(); break
			case 'minutes': value = inputMinutes(); break
			case 'seconds': value = inputSeconds(); break
			}

			if (timeTimerPressId !== null) timeTimerClear(timeTimerPressId)

			timeTimerPressId = timeTimerSet(() => {
				timeTimerPressId = null
				if (timeIntervalPressId !== null) timeIntervalClear(timeIntervalPressId)

				timeIntervalPressId = timeIntervalSet(() => {
					switch (direction) {
					case 'up'  : ++value; break
					case 'down': --value; break
					}

					if (value >= 100) value = 0
					if (value < 0) value = 99

					switch (type) {
					case 'hours': setInputHours(value); break
					case 'minutes': setInputMinutes(value); break
					case 'seconds': setInputSeconds(value); break
					}
				}, 30)
			}, 200)
		})
	}

	function onPointerUpInput(ev: PointerEvent & {currentTarget: HTMLDialogElement}): void {
		const button = documentActive()!
		if (!elementValidTarget(
			eventCurrentTarget(ev),
			button,
			el => {
				const isButton = elementTagName(el) === 'BUTTON'
				const dataInputAction = elementDataset(el, 'inputAction')
				const validData = dataInputAction
					? regexTest(/(up|down):(hour|minute|second)s/, dataInputAction)
					: false
				return isButton && Boolean(dataInputAction) && validData
			}
		)) return

		const dataInputAction = elementDataset(button, 'inputAction')!
		const match = stringMatch(dataInputAction, /(up|down):(hours|minutes|seconds)/)!
		const direction = match[1]
		const type = match[2]
		let value = 0
		switch (type) {
		case 'hours': value = inputHours(); break
		case 'minutes': value = inputMinutes(); break
		case 'seconds': value = inputSeconds(); break
		}

		if (timeTimerPressId !== null) timeTimerClear(timeTimerPressId)
		if (timeIntervalPressId !== null) timeIntervalClear(timeIntervalPressId)

		timeTimerPressId = timeIntervalPressId = null
		switch (direction) {
		case 'up'  : ++value; break
		case 'down': --value; break
		}

		if (value >= 100) value = 0
		if (value < 0) value = 99

		switch (type) {
		case 'hours': setInputHours(value); break
		case 'minutes': setInputMinutes(value); break
		case 'seconds': setInputSeconds(value); break
		}
	}

	createEffect(() => {
		updateInputs()
	})

	return (<div class={CSS.bodyTimer}>
		<h2>{getCurrentTime()}</h2>
		<audio ref={r => audioRef = r} loop src={ringtone}></audio>
		<Tooltip
			onClick={ev => {
				const button = documentActive()!
				if (!elementValidTarget(
					eventCurrentTarget(ev),
					button,
					el => elementTagName(el) === 'BUTTON'
				)) return

				switch (elementId(button)) {
				case buttonPauseId:
					pauseTimer()
					break
				case buttonResetId:
					resetTimer()
					break
				case buttonStartId:
					startTimer()
					break
				case buttonEditId:
					openDialog(dialogEditRef)
					break
				}
			}}>
			<FocusableGroup c:arrowOptions={{left: 'prev', right: 'next'}}>
				<Show when={getSeconds() > 0 && getState() === TimerState.stopped}>
					<Button
						id={buttonStartId}
						c:variant={ButtonVariant.filled}>
						<Icon c:code={ICON_PLAY} c:filled/>
						Start
					</Button>
				</Show>
				<Show when={getState() === TimerState.running}>
					<Button
						id={buttonPauseId}
						c:variant={ButtonVariant.filled}>
						<Icon c:code={ICON_PAUSE} c:filled/>
						Pause
					</Button>
				</Show>
				<Show when={getSeconds() < getStartSeconds() && getState() === TimerState.stopped}>
					<IconButton
						data-tooltip="Reset"
						id={buttonResetId}
						c:code={ICON_ARROW_RESET}
						c:variant={ButtonVariant.tonal}
					/>
				</Show>
				<Show when={getSeconds() === getStartSeconds() && getState() === TimerState.stopped}>
					<IconButton
						data-tooltip="Edit"
						id={buttonEditId}
						c:code={ICON_EDIT}
						c:variant={ButtonVariant.tonal}
					/>
				</Show>
			</FocusableGroup>
		</Tooltip>
		<Dialog
			ref={r => dialogEditRef = r}
			style={{width: '512px'}}
			c:header="Edit timer"
			c:actions={<>
				<Button data-action="cancel" c:variant={ButtonVariant.tonal}>Cancel</Button>
				<Button data-action="done" c:variant={ButtonVariant.filled}>Done</Button>
			</>}
			onClose={() => updateInputs()}
			onClick={ev => {
				const button = documentActive()!
				if (!elementValidTarget(
					eventCurrentTarget(ev),
					button,
					el => elementTagName(el) === 'BUTTON'
				)) return

				const dataAction = elementDataset(button, 'action')
				if (dataAction) {
					switch (dataAction) {
					case 'cancel':
						closeDialog(dialogEditRef)
						break
					case 'done':
						const hoursInSeconds = inputHours() * 3600
						const minutesInSeconds = inputMinutes() * 60
						const seconds = inputSeconds() + hoursInSeconds + minutesInSeconds
						command(Commands.updateTimerStartSeconds, seconds)
						closeDialog(dialogEditRef)

					}

					return
				}
			}}
			onKeyDown={ev => {
				const code = ev.code
				const button = documentActive()!
				let value = 0
				if (!elementValidTarget(
					eventCurrentTarget(ev),
					button,
					el => elementTagName(el) === 'BUTTON' && Boolean(elementDataset(el, 'input'))
				)) return

				const dataInput = elementDataset(button, 'input')
				const isByArrowKey = code === KEY_ARROW_UP || code === KEY_ARROW_DOWN
				switch (dataInput) {
				case 'hours': value = inputHours(); break
				case 'minutes': value = inputMinutes(); break
				case 'seconds': value = inputSeconds(); break
				}

				switch (code) {
				case KEY_ARROW_UP  : ++value; break
				case KEY_ARROW_DOWN: --value; break
				case KEY_DIGIT_0: value *= 10; value += 0; break
				case KEY_DIGIT_1: value *= 10; value += 1; break
				case KEY_DIGIT_2: value *= 10; value += 2; break
				case KEY_DIGIT_3: value *= 10; value += 3; break
				case KEY_DIGIT_4: value *= 10; value += 4; break
				case KEY_DIGIT_5: value *= 10; value += 5; break
				case KEY_DIGIT_6: value *= 10; value += 6; break
				case KEY_DIGIT_7: value *= 10; value += 7; break
				case KEY_DIGIT_8: value *= 10; value += 8; break
				case KEY_DIGIT_9: value *= 10; value += 9; break
				}

				if (value > 99) value = isByArrowKey? 0 : value % 100
				if (value <  0) value = 99

				switch (dataInput) {
				case 'hours': setInputHours(value); break
				case 'minutes': setInputMinutes(value); break
				case 'seconds': setInputSeconds(value); break
				}
			}}
			onPointerDown={onPointerDownInput}
			onPointerCancel={onPointerUpInput}
			onPointerUp={onPointerUpInput}>
			<FocusableGroup
				class={CSS.bodyDialogInputActions}
				c:arrowOptions={{left: 'prev', right: 'next'}}>
				<IconButton c:code={ICON_CHEVRON_UP} data-input-action="up:hours"/>
				<IconButton c:code={ICON_CHEVRON_UP} data-input-action="up:minutes"/>
				<IconButton c:code={ICON_CHEVRON_UP} data-input-action="up:seconds"/>
			</FocusableGroup>
			<FocusableGroup
				class={CSS.bodyDialogInput}
				c:arrowOptions={{left: 'prev', right: 'next'}}>
				<Button
					data-input="hours"
					c:variant={ButtonVariant.tonal}>
					{stringPadStart(inputHours() + '', 2, '0')}
				</Button>
				:
				<Button
					data-input="minutes"
					c:variant={ButtonVariant.tonal}>
					{stringPadStart(inputMinutes() + '', 2, '0')}
				</Button>
				:
				<Button
					data-input="seconds"
					c:variant={ButtonVariant.tonal}>
					{stringPadStart(inputSeconds() + '', 2, '0')}
				</Button>
			</FocusableGroup>
			<FocusableGroup
				class={CSS.bodyDialogInputActions}
				c:arrowOptions={{left: 'prev', right: 'next'}}>
				<IconButton c:code={ICON_CHEVRON_DOWN} data-input-action="down:hours"/>
				<IconButton c:code={ICON_CHEVRON_DOWN} data-input-action="down:minutes"/>
				<IconButton c:code={ICON_CHEVRON_DOWN} data-input-action="down:seconds"/>
			</FocusableGroup>
		</Dialog>
		<Dialog
			ref={r => dialogFinishRef = r}
			style={{width: '360px'}}
			onClose={() => resetTimer()}
			c:header="Timer done"
			c:actions={<Button
				c:variant={ButtonVariant.filled}
				onClick={() => closeDialog(dialogFinishRef)}>
				<Icon c:code={ICON_DISMISS} c:filled/>
				Dismiss
			</Button>}>
			<p>{getFormattedTimeFromStartSeconds()}</p>
			<p>Finished at {finishDate().toLocaleTimeString('en',
				{hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true})
			}</p>
		</Dialog>
	</div>)
}

const BodyStopwatch: VoidComponent<{
	stopwatch: [get: Store<Stopwatch>, set: SetStoreFunction<Stopwatch>]
}> = (props) => {
	const pad = (t: number, l: number = 2) => stringPadStart(numberToString(t), l, '0')
	const buttonStartId = createUniqueId()
	const buttonPauseId = createUniqueId()
	const buttonLapId = createUniqueId()
	const buttonResetId = createUniqueId()
	const buttonMoreId = createUniqueId()
	const [isMenuMoreActionOpen, setIsMenuMoreActionOpen] = createSignal<boolean>(false)
	const getStopwatch = createMemo(() => props.stopwatch[0])
	const setStopwatch = createMemo(() => props.stopwatch[1])
	const getTimeIntervalId = createMemo(() => getStopwatch().timeIntervalId)
	const getMs = createMemo(() => getStopwatch().ms)
	const getState = createMemo(() => getStopwatch().state)
	const getReversedLaps = createMemo(() => arrayReverse([...getStopwatch().laps]))
	const getMinutesDigits = createMemo<number>(() => {
		const m = mathFloor(getReversedLaps()[0] / 60_000)
		return m >= 10? 2 : m > 0? 1 : 0
	})
	const getSecondsDigits = createMemo<number>(() => mathFloor(getReversedLaps()[0] / 1000) >= 10? 2 : 1)
	const getHoursDigits = createMemo<number>(() => {
		const h = mathFloor(getReversedLaps()[0] / 3_600_000)
		return h >= 100? 3 : h >= 10? 2 : h > 0? 1 : 0
	})
	const getTimeText = createMemo<string>(() => {
		let text = ''
		let seconds = mathFloor(getMs() / 1000)
		if (seconds >= 60) {
			seconds %= 60
			text = pad(seconds)
		}
		else text = seconds + ''

		let minutes = mathFloor(getMs() / 60_000)
		if (minutes >= 60) {
			minutes %= 60
			text = pad(minutes) + ':' + text
		}
		else if (minutes > 0) text = minutes + ':' + text

		let hours = mathFloor(getMs() / 3_600_000)
		if (hours > 0) text = hours + ':' + text

		return text
	})
	const getMillisecondsText = createMemo<string>(() => {
		let milliseconds = mathFloor(getMs() / 10)
		if (milliseconds >= 100) milliseconds %= 100

		return pad(milliseconds)
	})
	let menuMoreActionRef: HTMLDialogElement

	function startStopwatch(): void {
		setStopwatch()(produce(value => {
			if (value.ms === 0) value.startDate = dateValueOf(new Date)
			if (value.startDate !== null && value.pauseDate !== null) {
				const diff = dateValueOf(new Date) - value.pauseDate
				value.startDate += diff
			}

			value.state = StopwatchState.running
		}))
		elementFocus(elementById(buttonPauseId)!)
		clearTimeInterval()
		setStopwatch()('timeIntervalId', timeIntervalSet(
			() => setStopwatch()('ms', v => v + 10),
			10
		))
	}

	function pauseStopwatch(): void {
		setStopwatch()(produce(value => {
			value.state = StopwatchState.stopped
			value.pauseDate = dateValueOf(new Date)
		}))
		elementFocus(elementById(buttonStartId)!)
		clearTimeInterval()
	}

	function resetStopwatch(): void {
		setStopwatch()(produce(value => {
			value.state = StopwatchState.stopped
			value.startDate = null
			value.pauseDate = null
			value.ms = 0
			value.laps = []
		}))
		elementFocus(elementById(buttonStartId)!)
		clearTimeInterval()
	}

	function addStopwatchLap(): void {
		setStopwatch()(produce(value => {
			arrayPush(value.laps, value.ms)
		}))
	}

	function clearTimeInterval(): void {
		if (getTimeIntervalId() !== null) timeIntervalClear(getTimeIntervalId()!)
	}

	function exportAsCSV(useMilliseconds: boolean = false): void {
		const lapsLength = arrayLength(getStopwatch().laps)
		let text = 'Laps,Time,Total'

		for (let i = 0; i < lapsLength; i++) {
			const ms = getReversedLaps()[i]
			const time = ms - (i < lapsLength - 1
				? getReversedLaps()[i + 1]
				: 0
			)
			const lap = lapsLength - i
			if (useMilliseconds) {
				text += ('\n' + lap + ',' + time + ',' + ms)
				continue
			}
			const timeText = formatStopwatchTime(
				time, getSecondsDigits(), getMinutesDigits(), getHoursDigits()
			)
			const msText = formatStopwatchTime(
				ms, getSecondsDigits(), getMinutesDigits(), getHoursDigits()
			)
			text += ('\n' + lap + ',"' + timeText + '","' + msText + '"')
		}

		fileDownload(new Blob([text]), 'Stopwatch Laps.csv')
		closeMenu(menuMoreActionRef)
	}

	function copyLaps(
		useTime: boolean = true,
		useTotal: boolean = true,
		useMilliseconds: boolean = false
	): void {
		const lapsLength = arrayLength(getStopwatch().laps)
		let text = ''

		if (useTime && useTotal) text += 'Laps\tTime\tTotal'
		else if (useTime) text += 'Time'
		else if (useTotal) text += 'Total'

		for (let i = 0; i < lapsLength; i++) {
			const ms = getReversedLaps()[i]
			const time = ms - (i < lapsLength - 1
				? getReversedLaps()[i + 1]
				: 0
			)
			const lap = lapsLength - i
			if (useMilliseconds) {
				if (useTime && useTotal) text += ('\n' + lap + '\t' + time + '\t' + ms)
				else if (useTime) text += ('\n' + time)
				else if (useTotal) text += ('\n' + ms)
				continue
			}
			const timeText = formatStopwatchTime(
				time, getSecondsDigits(), getMinutesDigits(), getHoursDigits()
			)
			const msText = formatStopwatchTime(
				ms, getSecondsDigits(), getMinutesDigits(), getHoursDigits()
			)
			if (useTime && useTotal) text += ('\n' + lap + '\t' + timeText + '\t' + msText)
			else if (useTime) text += ('\n' + timeText)
			else if (useTotal) text += ('\n' + msText)
		}

		promiseDone(
			navigatorClipboardWriteText(text),
			() => closeMenu(menuMoreActionRef)
		)
	}

	function formatStopwatchTime(
		ms: number,
		secondDigits: number,
		minuteDigits: number,
		hourDigits: number
	): string {
		let text = '00'
		let milliseconds = mathFloor(ms / 10)
		if (milliseconds >= 100) milliseconds %= 100

		text = pad(milliseconds) + ''

		let seconds = mathFloor(ms / 1000)
		if (seconds >= 60) {
			seconds %= 60
			text = pad(seconds) + ',' + text
		}
		else if (secondDigits >= 2) text = pad(seconds, secondDigits) + ',' + text
		else text = seconds + ',' + text

		let minutes = mathFloor(ms / 60_000)
		if (minutes >= 60) {
			minutes %= 60
			text = pad(minutes) + ':' + text
		}
		else if (minuteDigits >= 2) text = pad(minutes, minuteDigits) + ':' + text
		else if (minuteDigits >= 1) text = minutes + ':' + text
		else if (minutes > 0) text = minutes + ':' + text

		let hours = mathFloor(ms / 3_600_000)
		if (hourDigits >= 2) text = pad(hours, hourDigits) + ':' + text
		else if (hourDigits >= 1) text = hours + ':' + text
		else if (hours > 0) text = hours + ':' + text

		return text
	}

	const LapItem: VoidComponent<{lap: number, i: number}> = (props) => {
		const i = createMemo(() => props.i)
		const lap = createMemo(() => props.lap)
		return (<div>
			<span>{arrayLength(getStopwatch().laps) - i()}</span>
			<span>{formatStopwatchTime(
				lap() - (i() < arrayLength(getStopwatch().laps)-1
					? getReversedLaps()[i() + 1]
					: 0
				),
				getSecondsDigits(), getMinutesDigits(), getHoursDigits()
			)}</span>
			<span>{formatStopwatchTime(lap(), getSecondsDigits(), getMinutesDigits(), getHoursDigits())}</span>
		</div>)
	}

	return (<div class={CSS.bodyStopwatch}>
		<h2>{getTimeText()},<small>{getMillisecondsText()}</small></h2>
		<Tooltip
			onClick={ev => {
				const button = documentActive()!
				if (!elementValidTarget(
					eventCurrentTarget(ev),
					button,
					el => elementTagName(el) === 'BUTTON'
				)) return

				switch (elementId(button)) {
				case buttonLapId:
					addStopwatchLap()
					break
				case buttonPauseId:
					pauseStopwatch()
					break
				case buttonResetId:
					resetStopwatch()
					break
				case buttonStartId:
					startStopwatch()
					break
				case buttonMoreId:
					openMenu(menuMoreActionRef, {
						anchor: button
					})
					break
				}
			}}>
			<FocusableGroup c:arrowOptions={{left: 'prev', right: 'next'}}>
				<Show when={getState() === StopwatchState.stopped}>
					<Button
						id={buttonStartId}
						c:variant={ButtonVariant.filled}>
						<Icon c:code={ICON_PLAY} c:filled/>
						Start
					</Button>
				</Show>
				<Show when={getState() === StopwatchState.running}>
					<Button
						id={buttonPauseId}
						c:variant={ButtonVariant.filled}>
						<Icon c:code={ICON_PAUSE} c:filled/>
						Pause
					</Button>
					<IconButton
						data-tooltip="Lap"
						id={buttonLapId}
						c:code={ICON_FLAG}
						c:variant={ButtonVariant.tonal}
					/>
				</Show>
				<Show when={getMs() > 0 && getState() === StopwatchState.stopped}>
					<IconButton
						data-tooltip="Reset"
						id={buttonResetId}
						c:code={ICON_ARROW_RESET}
						c:variant={ButtonVariant.tonal}
					/>
				</Show>
				<Show when={arrayLength(getStopwatch().laps) > 0}>
					<IconButton
						data-tooltip="More actions"
						id={buttonMoreId}
						c:focused={isMenuMoreActionOpen()}
						c:code={ICON_MORE_VERTICAL}
						c:variant={ButtonVariant.tonal}
					/>
				</Show>
			</FocusableGroup>
		</Tooltip>
		<Show when={arrayLength(getStopwatch().laps) > 0}>
			<div data-laps>
				<div>
					<span>Laps</span>
					<span>Time</span>
					<span>Total</span>
				</div>
				<div>
					<For each={getReversedLaps()}>{(lap, i) =>
						<LapItem lap={lap} i={i()}/>
					}</For>
				</div>
			</div>
		</Show>
		<Menu
			ref={r => menuMoreActionRef = r}
			c:onToggleOpen={o => setIsMenuMoreActionOpen(o)}
			onClick={ev => {
				const button = documentActive()!
				if (!elementValidTarget(
					eventCurrentTarget(ev),
					button,
					el => elementTagName(el) === 'BUTTON'
				)) return

				const dataCopy = elementDataset(button, 'copy')
				if (dataCopy && arrayIncludes(
					['time', 'ms:time', 'total', 'ms:total', 'all', 'ms:all'],
					dataCopy
				)) {
					return copyLaps(
						regexTest(/time|all/, dataCopy),
						regexTest(/total|all/, dataCopy),
						regexTest(/^ms/, dataCopy),
					)
				}

				const dataExport = elementDataset(button, 'export')
				if (dataExport) {
					return exportAsCSV(regexTest(/^ms/, dataExport))
				}
			}}>
			<MenuItem
				data-copy="time"
				c:iconCode={ICON_COPY}
				c:trailing={<MenuIndent/>}>
				Copy time
			</MenuItem>
			<MenuItem
				data-copy="total"
				c:iconCode={ICON_COPY}
				c:trailing={<MenuIndent/>}>
				Copy total
			</MenuItem>
			<MenuItem
				data-copy="all"
				c:iconCode={ICON_COPY}
				c:trailing={<MenuIndent/>}>
				Copy all
			</MenuItem>
			<MenuDivider />
			<MenuItem
				data-export="csv"
				c:iconCode={ICON_DOCUMENT_ARROW_UP}
				c:trailing={<MenuIndent/>}>
				Export as CSV
			</MenuItem>
			<MenuDivider />
			<SubMenu
				c:item={<SubMenuItem c:iconCode={ICON_TIMER}>Milliseconds</SubMenuItem>}>
				<MenuItem data-copy="ms:time" c:iconCode={ICON_COPY}>Copy time</MenuItem>
				<MenuItem data-copy="ms:total" c:iconCode={ICON_COPY}>Copy total</MenuItem>
				<MenuItem data-copy="ms:all" c:iconCode={ICON_COPY}>Copy all</MenuItem>
				<MenuDivider />
				<MenuItem data-export="ms:csv" c:iconCode={ICON_DOCUMENT_ARROW_UP}>Export as CSV</MenuItem>
			</SubMenu>
		</Menu>
	</div>)
}

const _: VoidComponent<{
	page: Pages
	isBodyExpanded: boolean
	command(type: Commands, ...args: unknown[]): unknown
	timer: [get: Store<Timer>, set: SetStoreFunction<Timer>]
	stopwatch: [get: Store<Stopwatch>, set: SetStoreFunction<Stopwatch>]
}> = (props) => {
	const page = createMemo(() => props.page)
	const command = createMemo(() => props.command)
	return (<main class={CSS.body} data-expanded={attrSetIfExist(props.isBodyExpanded)}>
		<Switch>
			<Match when={page() == Pages.clock}><BodyClock/></Match>
			<Match when={page() == Pages.stopwatch}><BodyStopwatch stopwatch={props.stopwatch}/></Match>
			<Match when={page() == Pages.timer}><BodyTimer timer={props.timer} command={command()}/></Match>
		</Switch>
	</main>)
}

export default _