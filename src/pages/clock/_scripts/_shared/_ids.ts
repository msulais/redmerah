let _ID_INDEX = 0

function _createId(): string {
	++_ID_INDEX
	return 'app-' + _ID_INDEX
}

export class ElementIds {
	static readonly appbar = _createId()
	static readonly appbarSideBarButton = _createId()
	static readonly appbarInfoButton = _createId()
	static readonly appbarInfoMenu = _createId()
	static readonly appbarInfoMenuShareButton = _createId()
	static readonly appbarSettingsButton = _createId()
	static readonly appbarSettingsMenu = _createId()
	static readonly appbarSettingsAnimationMenu = _createId()
	static readonly appbarSettingsThemeMenu = _createId()
	static readonly appbarInfoMenuKeepAwake = _createId()
	static readonly bodyAlertWakeLockError = _createId()
	static readonly bodyClock = _createId()
	static readonly bodyClockTime = _createId()
	static readonly bodyClockDate = _createId()
	static readonly bodyStopwatch = _createId()
	static readonly bodyStopwatchHHMMSS = _createId()
	static readonly bodyStopwatchMS = _createId()
	static readonly bodyStopwatchLaps = _createId()
	static readonly bodyStopwatchLapsContent = _createId()
	static readonly bodyStopwatchPlayOrPause = _createId()
	static readonly bodyStopwatchResetOrLap = _createId()
	static readonly bodyStopwatchMoreButton = _createId()
	static readonly bodyStopwatchMoreMenu = _createId()
	static readonly bodyStopwatchMoreMillisecondsMenu = _createId()
	static readonly bodyTimer = _createId()
	static readonly bodyTimerAudio = _createId()
	static readonly bodyTimerTime = _createId()
	static readonly bodyTimerActionPlayPause = _createId()
	static readonly bodyTimerActionEditReset = _createId()
	static readonly bodyTimerEditDialog = _createId()
	static readonly bodyTimerEditHours = _createId()
	static readonly bodyTimerEditMinutes = _createId()
	static readonly bodyTimerEditSeconds = _createId()
	static readonly bodyTimerEditSave = _createId()
	static readonly bodyTimerDone = _createId()
	static readonly bodyTimerDoneTimeInfo = _createId()
	static readonly bodyTimerDoneDate = _createId()
	static readonly bodyToastCopied = _createId()
	static readonly navigationSideBar = _createId()
	static readonly navigationDrawer = _createId()
}