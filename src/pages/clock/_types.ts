import type { StopwatchState, TimerState } from "./_enums"

export type Stopwatch = {
	ms: number
	state: StopwatchState
	timeIntervalId: number | null

	/** value of date in milliseconds */
	startDate: number | null

	/** value of date in milliseconds */
	pauseDate: number | null
	laps: number[]
}

export type Timer = {
	seconds: number
	startSeconds: number
	state: TimerState
	timeIntervalId: number | null

	/** value of date in seconds */
	startDate: number | null

	/** value of date in seconds */
	pauseDate: number | null
}

export type Settings = {
	keepAwake: boolean
}