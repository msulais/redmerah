let _ID_INDEX = 0

function _createId(): string {
	++_ID_INDEX
	return 'apps-' + _ID_INDEX
}

export class ElementIds {
	static readonly searchInput = _createId()
	static readonly appList = _createId()
}