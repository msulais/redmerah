export enum Pages {
	timer = 'timer',
	clock = 'clock',
	stopwatch = 'stopwatch'
}

export enum StopwatchState {
	running,
	stopped
}

export enum TimerState {
	running,
	stopped
}

export enum Commands {
	toggleNavigationExpand,
	toggleBodyExpand,

	/**@param Pages page */
	updatePage,

	/**@param number seconds */
	updateTimerStartSeconds,

	/** @param boolean value */
	toggleKeepAwake
}