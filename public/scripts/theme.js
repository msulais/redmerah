function checkTheme() {
	const theme = localStorage.getItem('theme')
	if (theme == null) return;
	if (['system', 'light', 'dark'].includes(theme)) {
		document.documentElement.setAttribute('data-theme', theme)
	}
}

checkTheme()