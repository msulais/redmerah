let _ID_INDEX = 0

function _createId(): string {
	++_ID_INDEX
	return 'article-' + _ID_INDEX
}

export class ElementIds {
	static readonly shareBtn = _createId()
}