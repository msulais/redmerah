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
	static readonly appbarSearchButton = _createId()
	static readonly appbarSearchPopover = _createId()
	static readonly appbarSearchTextField = _createId()
	static readonly body = _createId()
	static readonly bodyEmojiList = _createId()
	static readonly bodySkinTone = _createId()
	static readonly bodyTitle = _createId()
	static readonly bodyToastCopied = _createId()
	static readonly bodyTextField = _createId()
	static readonly bodyTextFieldDismiss = _createId()
	static readonly bodyTextFieldCopy = _createId()
	static readonly navigationSideBar = _createId()
	static readonly navigationDrawer = _createId()
}