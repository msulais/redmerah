type AppProps = astroHTML.JSX.HTMLAttributes & {
	'c:tagName'         ?: string
	'c:attrAppBar'      ?: astroHTML.JSX.HTMLAttributes
	'c:attrBottomBar'   ?: astroHTML.JSX.HTMLAttributes
	'c:attrBody'        ?: astroHTML.JSX.HTMLAttributes
	'c:attrContainer'   ?: astroHTML.JSX.HTMLAttributes
	'c:attrLeftSideBar' ?: astroHTML.JSX.HTMLAttributes
	'c:attrRightSideBar'?: astroHTML.JSX.HTMLAttributes
}

type AppUpdateOptions = {
	children    ?: (Node | string)[] | boolean
	appBar      ?: (Node | string)[] | boolean
	bottomBar   ?: (Node | string)[] | boolean
	leftSideBar ?: (Node | string)[] | boolean
	rightSideBar?: (Node | string)[] | boolean
	refs?: {
		app         ?(el: HTMLElement   ): unknown
		appBar      ?(el: HTMLDivElement): unknown
		container   ?(el: HTMLDivElement): unknown
		leftSideBar ?(el: HTMLDivElement): unknown
		body        ?(el: HTMLDivElement): unknown
		rightSideBar?(el: HTMLDivElement): unknown
		bottomBar   ?(el: HTMLDivElement): unknown
	}
}

enum AppClasses {
	app          = 'c-app',
	appBar       = 'c-app-appbar',
	container    = 'c-app-container',
	leftSideBar  = 'c-app-left-sidebar',
	rightSideBar = 'c-app-right-sidebar',
	bottomBar    = 'c-app-bottombar',
	body         = 'c-app-body'
}

function createApp<T extends HTMLElement>(
	options?: AppUpdateOptions & {tagName?: keyof HTMLElementTagNameMap}
): T {
	const app = document.createElement(options?.tagName ?? 'div')
	return updateApp(app, options) as T
}

function updateApp<T extends HTMLElement>(app: T, options?: AppUpdateOptions): T {
	const refs = options?.refs
	app.classList.add(AppClasses.app)

	// appbar
	let appBar = app.querySelector(`.${AppClasses.appBar}`) as HTMLDivElement | null
	if (options?.appBar === false) {
		appBar?.replaceChildren()
	}
	else if (options?.appBar && options.appBar !== true) {
		if (!appBar) {
			appBar = document.createElement('div')
			appBar.classList.add(AppClasses.appBar)
		}

		appBar.replaceChildren(...options.appBar)
	}

	// container
	let container = app.querySelector(`.${AppClasses.container}`) as HTMLDivElement | null
	if (!container) {
		container = document.createElement('div')
		container.classList.add(AppClasses.container)
	}

	// container -> leftsidebar
	let leftSideBar = app.querySelector(`.${AppClasses.leftSideBar}`) as HTMLDivElement | null
	if (options?.leftSideBar === false) {
		leftSideBar?.replaceChildren()
	}
	else if (options?.leftSideBar && options?.leftSideBar !== true) {
		if (!leftSideBar) {
			leftSideBar = document.createElement('div')
			leftSideBar.classList.add(AppClasses.leftSideBar)
		}

		leftSideBar.replaceChildren(...options.leftSideBar)
	}

	// container -> body
	let body = app.querySelector(`.${AppClasses.body}`) as HTMLDivElement | null
	if (!body) {
		body = document.createElement('div')
		body.classList.add(AppClasses.body)
	}

	if (options?.children === false) {
		body.replaceChildren()
	}
	else if (options?.children && options.children !== true) {
		body.replaceChildren(...options.children)
	}

	// container -> rightsidebar
	let rightSideBar = app.querySelector(`.${AppClasses.rightSideBar}`) as HTMLDivElement | null
	if (options?.rightSideBar === false) {
		rightSideBar?.replaceChildren()
	}
	else if (options?.rightSideBar && options.rightSideBar !== true) {
		if (!rightSideBar) {
			rightSideBar = document.createElement('div')
			rightSideBar.classList.add(AppClasses.rightSideBar)
		}

		rightSideBar.replaceChildren(...options.rightSideBar)
	}

	container.replaceChildren(...[leftSideBar, body, rightSideBar].filter(
		v => typeof v === 'string' || v instanceof Node
	))

	// bottombar
	let bottomBar = app.querySelector(`.${AppClasses.bottomBar}`) as HTMLDivElement | null
	if (options?.bottomBar === false) {
		bottomBar?.replaceChildren()
	}
	else if (options?.bottomBar && options.bottomBar !== true) {
		if (!bottomBar) {
			bottomBar = document.createElement('div')
			bottomBar.classList.add(AppClasses.bottomBar)
		}

		bottomBar.replaceChildren(...options.bottomBar)
	}

	app.replaceChildren(...[appBar, container, bottomBar].filter(
		v => typeof v === 'string' || v instanceof Node
	))
	refs?.app?.(app)
	refs?.container?.(container)
	refs?.body?.(body)
	if (appBar) refs?.appBar?.(appBar)
	if (leftSideBar) refs?.leftSideBar?.(leftSideBar)
	if (rightSideBar) refs?.rightSideBar?.(rightSideBar)
	if (bottomBar) refs?.bottomBar?.(bottomBar)
	return app
}

export {
	type AppProps,
	type AppUpdateOptions,
	AppClasses,
	createApp,
	updateApp
}