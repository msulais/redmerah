import { stringToHash } from "@/utils/string"

let _ID_INDEX = 0
const _prefix = stringToHash('article-page')
function _createId(): string {
	return _prefix + (++_ID_INDEX)
}

export class ElementIds {
	static readonly shareBtn = _createId()
}