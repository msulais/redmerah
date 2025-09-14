type AppProps = astroHTML.JSX.HTMLAttributes & {
	AppTagName         ?: string
	AppAppBarAttr      ?: astroHTML.JSX.HTMLAttributes
	AppBottomBarAttr   ?: astroHTML.JSX.HTMLAttributes
	AppBodyAttr        ?: astroHTML.JSX.HTMLAttributes
	AppContainerAttr   ?: astroHTML.JSX.HTMLAttributes
	AppLeftSideBarAttr ?: astroHTML.JSX.HTMLAttributes
	AppRightSideBarAttr?: astroHTML.JSX.HTMLAttributes
}

type AppElement<T extends HTMLElement> = T

type AppUpdateOptions<T extends AppElement<HTMLElement>> = {
	AppChildren    ?: (Node | string)[] | boolean
	AppAppBar      ?: (Node | string)[] | boolean
	AppBottomBar   ?: (Node | string)[] | boolean
	AppLeftSideBar ?: (Node | string)[] | boolean
	AppRightSideBar?: (Node | string)[] | boolean
	AppRefs?: {
		app         ?(ref: T             ): unknown
		appBar      ?(ref: HTMLDivElement): unknown
		container   ?(ref: HTMLDivElement): unknown
		leftSideBar ?(ref: HTMLDivElement): unknown
		body        ?(ref: HTMLDivElement): unknown
		rightSideBar?(ref: HTMLDivElement): unknown
		bottomBar   ?(ref: HTMLDivElement): unknown
	}
}

enum AppClasses {
	app          = 'c-app2',
	appBar       = app + '-appbar',
	container    = app + '-container',
	leftSideBar  = app + '-left-sidebar',
	rightSideBar = app + '-right-sidebar',
	bottomBar    = app + '-bottombar',
	body         = app + '-body'
}

function createAppRef<T extends AppElement<HTMLElement>>(
	options?: AppUpdateOptions<T> & {AppTagName?: keyof HTMLElementTagNameMap}
): T {
	const appRef = document.createElement(options?.AppTagName ?? 'div')
	return updateAppRef(appRef, options) as T
}

function updateAppRef<T extends AppElement<HTMLElement>>(appRef: T, options?: AppUpdateOptions<T>): T {
	const refs = options?.AppRefs
	appRef.classList.add(AppClasses.app)

	// appbar
	const appBarOption = options?.AppAppBar
	let appBarRef = appRef.querySelector(`.${AppClasses.appBar}`) as HTMLDivElement | null
	if (appBarOption === false) {
		appBarRef?.replaceChildren()
	}
	else if (appBarOption !== undefined && appBarOption !== true) {
		if (!appBarRef) {
			appBarRef = document.createElement('div')
			appBarRef.classList.add(AppClasses.appBar)
		}

		appBarRef.replaceChildren(...appBarOption)
	}

	// container
	let containerRef = appRef.querySelector(`.${AppClasses.container}`) as HTMLDivElement | null
	if (!containerRef) {
		containerRef = document.createElement('div')
		containerRef.classList.add(AppClasses.container)
	}

	// container -> leftsidebar
	const leftSideBarOption = options?.AppLeftSideBar
	let leftSideBarRef = containerRef.querySelector(`.${AppClasses.leftSideBar}`) as HTMLDivElement | null
	if (leftSideBarOption === false) {
		leftSideBarRef?.replaceChildren()
	}
	else if (leftSideBarOption !== undefined && leftSideBarOption !== true) {
		if (!leftSideBarRef) {
			leftSideBarRef = document.createElement('div')
			leftSideBarRef.classList.add(AppClasses.leftSideBar)
		}

		leftSideBarRef.replaceChildren(...leftSideBarOption)
	}

	// container -> body
	let bodyRef = appRef.querySelector(`.${AppClasses.body}`) as HTMLDivElement | null
	if (!bodyRef) {
		bodyRef = document.createElement('div')
		bodyRef.classList.add(AppClasses.body)
	}

	const childrenOption = options?.AppChildren
	if (childrenOption === false) {
		bodyRef.replaceChildren()
	}
	else if (childrenOption !== undefined && childrenOption !== true) {
		bodyRef.replaceChildren(...childrenOption)
	}

	// container -> rightsidebar
	const rightSideBarOption = options?.AppRightSideBar
	let rightSideBarRef = appRef.querySelector(`.${AppClasses.rightSideBar}`) as HTMLDivElement | null
	if (rightSideBarOption === false) {
		rightSideBarRef?.replaceChildren()
	}
	else if (rightSideBarOption !== undefined && rightSideBarOption !== true) {
		if (!rightSideBarRef) {
			rightSideBarRef = document.createElement('div')
			rightSideBarRef.classList.add(AppClasses.rightSideBar)
		}

		rightSideBarRef.replaceChildren(...rightSideBarOption)
	}

	// bottombar
	const bottomBarOption = options?.AppBottomBar
	let bottomBarRef = appRef.querySelector(`.${AppClasses.bottomBar}`) as HTMLDivElement | null
	if (bottomBarOption === false) {
		bottomBarRef?.replaceChildren()
	}
	else if (bottomBarOption !== undefined && bottomBarOption !== true) {
		if (!bottomBarRef) {
			bottomBarRef = document.createElement('div')
			bottomBarRef.classList.add(AppClasses.bottomBar)
		}

		bottomBarRef.replaceChildren(...bottomBarOption)
	}

	containerRef.replaceChildren(...[appBarRef, bodyRef, bottomBarRef].filter(
		v => typeof v === 'string' || v instanceof Node
	))

	appRef.replaceChildren(...[leftSideBarOption, containerRef, rightSideBarRef].filter(
		v => typeof v === 'string' || v instanceof Node
	))
	refs?.app?.(appRef)
	refs?.container?.(containerRef)
	refs?.body?.(bodyRef)
	if (appBarRef) refs?.appBar?.(appBarRef)
	if (leftSideBarRef) refs?.leftSideBar?.(leftSideBarRef)
	if (rightSideBarRef) refs?.rightSideBar?.(rightSideBarRef)
	if (bottomBarRef) refs?.bottomBar?.(bottomBarRef)
	return appRef
}

export {
	type AppProps,
	type AppUpdateOptions,
	type AppElement,
	AppClasses,
	createAppRef,
	updateAppRef
}