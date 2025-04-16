(() => {
'use strict';

const root = document.documentElement

function checkAnimation() {
	const animation = localStorage.getItem('platform:animation')
	if (!animation || !['auto', 'on', 'off'].includes(animation)) return

	root.setAttribute('data-animation', animation)
}

function checkTheme() {
	const theme = localStorage.getItem('platform:theme')
	if (!theme || !['auto', 'light', 'dark'].includes(theme)) return

	root.setAttribute('data-theme', theme)
}

checkAnimation()
checkTheme()

})()