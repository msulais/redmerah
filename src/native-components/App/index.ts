type AppProps = astroHTML.JSX.HTMLAttributes & {
	AppTagName         ?: string
	AppAppBarAttr      ?: astroHTML.JSX.HTMLAttributes
	AppBottomBarAttr   ?: astroHTML.JSX.HTMLAttributes
	AppBodyAttr        ?: astroHTML.JSX.HTMLAttributes
	AppContainerAttr   ?: astroHTML.JSX.HTMLAttributes
	AppLeftSideBarAttr ?: astroHTML.JSX.HTMLAttributes
	AppRightSideBarAttr?: astroHTML.JSX.HTMLAttributes
}

type AppUpdateOptions = {
	AppChildren    ?: (Node | string)[] | boolean
	AppAppBar      ?: (Node | string)[] | boolean
	AppBottomBar   ?: (Node | string)[] | boolean
	AppLeftSideBar ?: (Node | string)[] | boolean
	AppRightSideBar?: (Node | string)[] | boolean
	AppRefs?: {
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
	appBar       = app + '-appbar',
	container    = app + '-container',
	leftSideBar  = app + '-left-sidebar',
	rightSideBar = app + '-right-sidebar',
	bottomBar    = app + '-bottombar',
	body         = app + '-body'
}

function createApp<T extends HTMLElement>(
	options?: AppUpdateOptions & {AppTagName?: keyof HTMLElementTagNameMap}
): T {
	const app = document.createElement(options?.AppTagName ?? 'div')
	return updateApp(app, options) as T
}

function updateApp<T extends HTMLElement>(app: T, options?: AppUpdateOptions): T {
	const refs = options?.AppRefs
	app.classList.add(AppClasses.app)

	// appbar
	let appBar = app.querySelector(`.${AppClasses.appBar}`) as HTMLDivElement | null
	if (options?.AppAppBar === false) {
		appBar?.replaceChildren()
	}
	else if (options?.AppAppBar !== undefined && options.AppAppBar !== true) {
		if (!appBar) {
			appBar = document.createElement('div')
			appBar.classList.add(AppClasses.appBar)
		}

		appBar.replaceChildren(...options.AppAppBar)
	}

	// container
	let container = app.querySelector(`.${AppClasses.container}`) as HTMLDivElement | null
	if (!container) {
		container = document.createElement('div')
		container.classList.add(AppClasses.container)
	}

	// container -> leftsidebar
	let leftSideBar = app.querySelector(`.${AppClasses.leftSideBar}`) as HTMLDivElement | null
	if (options?.AppLeftSideBar === false) {
		leftSideBar?.replaceChildren()
	}
	else if (options?.AppLeftSideBar !== undefined && options?.AppLeftSideBar !== true) {
		if (!leftSideBar) {
			leftSideBar = document.createElement('div')
			leftSideBar.classList.add(AppClasses.leftSideBar)
		}

		leftSideBar.replaceChildren(...options.AppLeftSideBar)
	}

	// container -> body
	let body = app.querySelector(`.${AppClasses.body}`) as HTMLDivElement | null
	if (!body) {
		body = document.createElement('div')
		body.classList.add(AppClasses.body)
	}

	if (options?.AppChildren === false) {
		body.replaceChildren()
	}
	else if (options?.AppChildren !== undefined && options.AppChildren !== true) {
		body.replaceChildren(...options.AppChildren)
	}

	// container -> rightsidebar
	let rightSideBar = app.querySelector(`.${AppClasses.rightSideBar}`) as HTMLDivElement | null
	if (options?.AppRightSideBar === false) {
		rightSideBar?.replaceChildren()
	}
	else if (options?.AppRightSideBar !== undefined && options.AppRightSideBar !== true) {
		if (!rightSideBar) {
			rightSideBar = document.createElement('div')
			rightSideBar.classList.add(AppClasses.rightSideBar)
		}

		rightSideBar.replaceChildren(...options.AppRightSideBar)
	}

	container.replaceChildren(...[leftSideBar, body, rightSideBar].filter(
		v => typeof v === 'string' || v instanceof Node
	))

	// bottombar
	let bottomBar = app.querySelector(`.${AppClasses.bottomBar}`) as HTMLDivElement | null
	if (options?.AppBottomBar === false) {
		bottomBar?.replaceChildren()
	}
	else if (options?.AppBottomBar !== undefined && options.AppBottomBar !== true) {
		if (!bottomBar) {
			bottomBar = document.createElement('div')
			bottomBar.classList.add(AppClasses.bottomBar)
		}

		bottomBar.replaceChildren(...options.AppBottomBar)
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