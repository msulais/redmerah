import { ElementIds } from "../_shared/_ids"

const _ref_shareBtn = document.getElementById(ElementIds.shareBtn)

function _initEvents() {
	_ref_shareBtn?.addEventListener('click', () => navigator.share({url: document.URL}))
}

export default () => {
	_initEvents()
}