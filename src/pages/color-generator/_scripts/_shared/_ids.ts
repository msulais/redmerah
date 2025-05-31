let _ID_INDEX = 0

function _createId(): string {
	++_ID_INDEX
	return 'app-' + _ID_INDEX
}

export class ElementIds {
	static readonly appbar = _createId()
	static readonly appbarCopyButton = _createId()
	static readonly appbarInfoButton = _createId()
	static readonly appbarInfoMenu = _createId()
	static readonly appbarInfoMenuShareButton = _createId()
	static readonly appbarSettingsButton = _createId()
	static readonly appbarSettingsMenu = _createId()
	static readonly appbarSettingsAnimationMenu = _createId()
	static readonly appbarSettingsThemeMenu = _createId()
	static readonly bodyColorPickerButton = _createId()
	static readonly bodySaveButton = _createId()
	static readonly bodyColorPickerButtonSpan = _createId()
	static readonly bodyColorPickerPopover = _createId()
	static readonly bodyColorAccentLight = _createId()
	static readonly bodyColorOnAccentLight = _createId()
	static readonly bodyColorAccentDark = _createId()
	static readonly bodyColorOnAccentDark = _createId()
	static readonly bodyToastCopied = _createId()
}