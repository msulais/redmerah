import { KEY_ARROW_UP, KEY_ARROW_DOWN, KEY_ARROW_LEFT, KEY_ARROW_RIGHT } from "@/constants/key-code"
import { createUniqueId } from "solid-js"
import { isTargetValidElement } from "./element"

enum ElementCustomAttributes {
	tabIndex = 'data-tabindex'
}

const ELEMENTS_DATA: Record<
	string,
	{isTabIndexRemoved: boolean, timeRemovedId: number | NodeJS.Timeout | null}
> = {}

export function keyboardOnFocusIn(
	ev: Event & {currentTarget: HTMLDivElement},
	elements: HTMLElement[]
): void {
	const active = document.activeElement!
	const self = ev.currentTarget
	let id = self.id
	if (!isTargetValidElement(
		self,
		active,
	)) return

	if (id === '') {
		id = createUniqueId()
		self.id = id
	}

	if (ELEMENTS_DATA[id] && !ELEMENTS_DATA[id].isTabIndexRemoved) return
	if (!elements.some(e => e === active)) return

	for (const b of elements) {
		if (b.hasAttribute('tabindex')) {
			b.setAttribute(ElementCustomAttributes.tabIndex, b.tabIndex + '')
		}
		if (active === b) {
			b.tabIndex = 0
			continue
		}

		b.tabIndex = -1
	}

	const data = ELEMENTS_DATA[id]
	if (data) {
		data.isTabIndexRemoved = false
		return
	}

	ELEMENTS_DATA[id] = {
		timeRemovedId: null,
		isTabIndexRemoved: false
	}
}

export function keyboardOnFocusOut(
	ev: Event & {currentTarget: HTMLDivElement},
	elements: HTMLElement[]
): void {
	const self = ev.currentTarget
	let id = self.id
	if (id === '') {
		id = createUniqueId()
		self.id = id
	}

	const data = ELEMENTS_DATA[id]
	if (!data) return

	const timeRemovedId = data.timeRemovedId
	if (typeof timeRemovedId === 'number') {
		clearTimeout(timeRemovedId)
	}

	data.timeRemovedId = setTimeout(() => {
		data.timeRemovedId = null
		const active = document.activeElement
		if (active
			&& self.contains(active)
			&& elements.some(e => e === active)
		) return

		for (const el of elements) {
			if (el.hasAttribute(ElementCustomAttributes.tabIndex)) {
				const tabIndex = el.getAttribute(ElementCustomAttributes.tabIndex)
				el.removeAttribute(ElementCustomAttributes.tabIndex)
				if (tabIndex) {
					el.setAttribute('tabindex',  tabIndex)
					continue
				}
			}
			el.removeAttribute('tabindex')
		}

		delete ELEMENTS_DATA[id]
	}, 200)
}

export function keyboardOnKeyDown(
	ev: KeyboardEvent & {currentTarget: HTMLDivElement},
	elements: HTMLElement[],
	options?: {
		up?: 'next' | 'prev'
		down?: 'next' | 'prev'
		left?: 'next' | 'prev'
		right?: 'next' | 'prev'
	}
): void {
	const active = document.activeElement
	if (!options || !active) return

	const keyCode = ev.code
	const up = options.up
	const down = options.down
	const left = options.left
	const right = options.right
	const validUp    = up    && (up    == 'next' || up    == 'prev') && keyCode == KEY_ARROW_UP
	const validDown  = down  && (down  == 'next' || down  == 'prev') && keyCode == KEY_ARROW_DOWN
	const validLeft  = left  && (left  == 'next' || left  == 'prev') && keyCode == KEY_ARROW_LEFT
	const validRight = right && (right == 'next' || right == 'prev') && keyCode == KEY_ARROW_RIGHT
	const allOptionsInvalid = (
		up != 'next' && up != 'prev'
		&& up == down
		&& up == left
		&& up == right
	)
	const invalidKeys = (
		keyCode != KEY_ARROW_UP
		&& keyCode != KEY_ARROW_DOWN
		&& keyCode != KEY_ARROW_RIGHT
		&& keyCode != KEY_ARROW_LEFT
	)
	const isChildOfParent = ev.currentTarget.contains(active)
	const index = elements.findIndex(e => e === active)
	const tagName = active.tagName
	if (
		allOptionsInvalid
		|| invalidKeys
		|| !isChildOfParent
		|| index < 0
		|| (
			!validUp
			&& !validDown
			&& !validLeft
			&& !validRight
		)
		|| (tagName === 'INPUT' && (validLeft || validRight))
		|| (tagName === 'TEXTAREA' && (validLeft || validRight || validUp || validDown))
	) return

	let direction: 'next' | 'prev' = 'next'
	if (validUp) direction = up
	else if (validDown) direction = down
	else if (validLeft) direction = left
	else if (validRight) direction = right

	const elementsLength = elements.length
	let i = direction === 'next'? index + 1 : index - 1
	while (i !== index) {
		const target = elements[i]
		if (target) {
			target.focus()
			if (document.activeElement === target) {
				ev.preventDefault() // disable auto scroll
				target.tabIndex = 0;
				(active as HTMLElement).tabIndex = -1

				const tagName = target.tagName
				if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
					keyboardOnFocusOut(ev, elements) // to remove tabindex
				}
				break
			}
		}

		if (direction === 'next') {
			++i
			if (i > elementsLength - 1) i = 0
		}
		else {
			--i
			if (i < 0) i = elementsLength - 1
		}
	}
}

export function keyboardOnKeyDown2D(
	ev: KeyboardEvent & {currentTarget: HTMLDivElement},
	elements: HTMLElement[],
	columnCount: number
): void {
	const active = document.activeElement
	if (!active) return

	const keyCode = ev.code
	const validUp    = keyCode == KEY_ARROW_UP
	const validDown  = keyCode == KEY_ARROW_DOWN
	const validLeft  = keyCode == KEY_ARROW_LEFT
	const validRight = keyCode == KEY_ARROW_RIGHT
	const invalidKeys = (
		!validUp
		&& !validRight
		&& !validDown
		&& !validLeft
	)
	const isChildOfParent = ev.currentTarget.contains(active)
	const index = elements.findIndex(e => e === active)
	const tagName = active.tagName
	if (
		invalidKeys
		|| !isChildOfParent
		|| index < 0
		|| (tagName === 'INPUT' && (validLeft || validRight))
		|| (tagName === 'TEXTAREA' && (validLeft || validRight || validUp || validDown))
	) return

	let i = index
	switch (keyCode) {
	case KEY_ARROW_UP   : i = index - columnCount; break
	case KEY_ARROW_RIGHT: i = index + 1; break
	case KEY_ARROW_DOWN : i = index + columnCount; break
	case KEY_ARROW_LEFT : i = index - 1; break
	}

	const elementsLength = elements.length
	let cache = 0
	while (i !== index) {
		++cache

		// should never touch 100. if it does, then shit must be happens with `i`
		if (cache > 100) break

		const target = elements[i]
		if (target) {
			target.focus()
			if (document.activeElement === target) {
				ev.preventDefault() // disable auto scroll
				target.tabIndex = 0;
				(active as HTMLElement).tabIndex = -1

				const tagName = target.tagName
				if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
					keyboardOnFocusOut(ev, elements) // to remove tabindex
				}
				break
			}
		}

		switch (keyCode) {
		case KEY_ARROW_UP:
			i = i - columnCount
			if (i < 0) i = (
				(columnCount * Math.floor(elementsLength / columnCount))
				+ (Math.abs(index) % columnCount)
			)

			break
		case KEY_ARROW_RIGHT:
			i += 1
			if (i > elementsLength - 1) i = 0

			break
		case KEY_ARROW_DOWN:
			i = i + columnCount
			if (i > elementsLength - 1) i = i % columnCount

			break
		case KEY_ARROW_LEFT:
			i -= 1
			if (i < 0) i = elementsLength - 1

			break
		}
	}
}