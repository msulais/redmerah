import { AppBarAttributes, ElementIds, ID } from "./_enums"


function _(): void {
	const appbar = document.getElementById(ID + ElementIds.appbar) as HTMLElement
	let isTop = window.scrollY <= 16

	appbar.toggleAttribute(AppBarAttributes.top, isTop)
	window.addEventListener('scroll', () => {
		const localIsTop = window.scrollY <= 16

		if (isTop === localIsTop) return
		isTop = localIsTop

		appbar.toggleAttribute(AppBarAttributes.top, isTop)
	})
}

export default _