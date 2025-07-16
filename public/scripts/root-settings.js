(() => {
'use strict';

const root = document.documentElement
const get = (key) => localStorage.getItem(key)
const setAttr = (name, value) => root.setAttribute(name, value)
const includes = (target, values) => values.includes(target)
const checkAnimation = () => {
	const animation = get('platform:animation')
	if (!animation || !includes(animation, ['auto', 'on', 'off'])) {return}

	setAttr('data-animation', animation)
}
const checkTheme = () => {
	const theme = get('platform:theme')
	if (!theme || !includes(theme, ['auto', 'light', 'dark'])) {return}

	setAttr('data-theme', theme)
}

checkAnimation()
checkTheme()
})()