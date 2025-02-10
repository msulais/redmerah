import { KEY_ARROW_UP, KEY_ARROW_DOWN, KEY_ARROW_LEFT, KEY_ARROW_RIGHT } from "@/constants/key_code"
import { attrGet, attrHas, attrRemove, attrSet } from "./attributes"
import { documentActive } from "./document"
import { elementContains, elementFocus, elementId, elementIdSet, elementTabIndex, elementTabIndexSet, elementValidTarget } from "./element"
import { eventCurrentTarget } from "./event"
import { timeTimerClear, timeTimerSet } from "./time"
import { arrayFindIndex, arrayLength, arraySome } from "./array"
import { createUniqueId } from "solid-js"
import { typeIsNumber } from "./typecheck"

enum ElementCustomAttributes {
	tabIndex = 'data-tabindex'
}

const ELEMENTS_DATA: Record<
	string,
	{isTabIndexRemoved: boolean, timeRemovedId: number | null}
> = {}

export function keyboardOnFocusIn(
	ev: FocusEvent & {currentTarget: HTMLDivElement},
	elements: HTMLElement[]
): void {
	const active = documentActive()!
	const self = eventCurrentTarget(ev)
	let id = elementId(self)
	if (!elementValidTarget(
		self,
		active,
	)) return

	if (id === '') {
		id = createUniqueId()
		elementIdSet(self, id)
	}

	if (ELEMENTS_DATA[id] && !ELEMENTS_DATA[id].isTabIndexRemoved) return
	if (!arraySome(elements, e => e === active)) return

	for (const b of elements) {
		if (attrHas(b, 'tabindex')) {
			attrSet(b, ElementCustomAttributes.tabIndex, elementTabIndex(b) + '')
		}
		if (active === b) {
			elementTabIndexSet(b, 0)
			continue
		}

		elementTabIndexSet(b, -1)
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
	ev: FocusEvent & {currentTarget: HTMLDivElement},
	elements: HTMLElement[]
): void {
	const self = eventCurrentTarget(ev)
	let id = elementId(self)
	if (id === '') {
		id = createUniqueId()
		elementIdSet(self, id)
	}

	const data = ELEMENTS_DATA[id]
	if (!data) return

	const timeRemovedId = data.timeRemovedId
	if (typeIsNumber(timeRemovedId)) {
		timeTimerClear(timeRemovedId!)
	}

	data.timeRemovedId = timeTimerSet(() => {
		data.timeRemovedId = null
		const active = documentActive()
		if (active && elementContains(self, active)) return

		for (const el of elements) {
			if (attrHas(el, ElementCustomAttributes.tabIndex)) {
				const tabIndex = attrGet(el, ElementCustomAttributes.tabIndex)
				attrRemove(el, ElementCustomAttributes.tabIndex)
				if (tabIndex) {
					attrSet(el, 'tabindex',  tabIndex)
					continue
				}
			}
			attrRemove(el, 'tabindex')
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
	const active = documentActive()
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
	const isChildOfParent = elementContains(eventCurrentTarget(ev), active)
	const index = arrayFindIndex(elements, e => e === active)
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
	) return

	let direction: 'next' | 'prev' = 'next'
	if (validUp) direction = up
	else if (validDown) direction = down
	else if (validLeft) direction = left
	else if (validRight) direction = right

	const elementsLength = arrayLength(elements)
	let i = direction === 'next'? index + 1 : index - 1
	while (i !== index) {
		const target = elements[i]
		if (target) {
			elementFocus(target)
			if (documentActive() === target) {
				elementTabIndexSet(target, 0)
				elementTabIndexSet(active, -1)
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
	const active = documentActive()
	if (!active) return

	const keyCode = ev.code
	const invalidKeys = (
		keyCode != KEY_ARROW_UP
		&& keyCode != KEY_ARROW_DOWN
		&& keyCode != KEY_ARROW_RIGHT
		&& keyCode != KEY_ARROW_LEFT
	)
	const isChildOfParent = elementContains(eventCurrentTarget(ev), active)
	const index = arrayFindIndex(elements, e => e === active)
	if (
		invalidKeys
		|| !isChildOfParent
		|| index < 0
	) return

	let i = index
	switch (keyCode) {
	case KEY_ARROW_UP   : i = index - columnCount; break
	case KEY_ARROW_RIGHT: i = index + 1; break
	case KEY_ARROW_DOWN : i = index + columnCount; break
	case KEY_ARROW_LEFT : i = index - 1; break
	}

	const elementsLength = arrayLength(elements)
	let cache = 0
	while (i !== index) {
		++cache

		// should never touch 100. if it does, then shit must be happens with `i`
		if (cache > 100) break

		const target = elements[i]
		if (target) {
			elementFocus(target)
			if (documentActive() === target) {
				elementTabIndexSet(target, 0)
				elementTabIndexSet(active, -1)
				break
			}
		}

		switch (keyCode) {
		case KEY_ARROW_UP:
			i = i - columnCount
			if (i < 0) i = elementsLength + i + columnCount

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