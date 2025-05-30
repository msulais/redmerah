let _ID_INDEX = 0

function _createId(): string {
	++_ID_INDEX
	return 'app-' + _ID_INDEX
}

export class ElementIds {
	static readonly appbar = _createId()
	static readonly appbarInfoButton = _createId()
	static readonly appbarInfoMenu = _createId()
	static readonly appbarInfoMenuShareButton = _createId()
	static readonly appbarSettingsButton = _createId()
	static readonly appbarSettingsMenu = _createId()
	static readonly appbarSettingsAnimationMenu = _createId()
	static readonly appbarSettingsThemeMenu = _createId()
	static readonly bodyLevelText = _createId()
	static readonly bodyStatusIcon = _createId()
	static readonly bodyStatusText = _createId()
	static readonly dialogBrowserNotSupported = _createId()
}

export enum Links {
	broswerCompatibility = 'https://developer.mozilla.org/en-US/docs/Web/API/BatteryManager#browser_compatibility'
}

export enum RadioGroupNames {
	settingsAnimation = 'settings:animation',
	settingsTheme = 'settings:theme',
}