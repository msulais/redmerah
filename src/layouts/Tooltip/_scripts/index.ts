import { isValidEnumValue } from "@/utils/object"
import { TooltipAttributes, TooltipPosition } from "./enums"
import { AnimationEasing } from "@/enums/animation"
import { CSSClasses } from "../_styles/classes"
import { isAnimationAllowed } from "@/utils/animation"

let _isOpen = false
let _isTouchScreen = false
let _time_open: ReturnType<typeof setTimeout> | undefined
let _time_close: ReturnType<typeof setTimeout> | undefined
let _ref_anchor: HTMLElement | null = null
let _ref_tooltip = document.querySelector<HTMLDivElement>(`.${CSSClasses.tooltip}`)

function _showTooltip(
	text: string,
	position: TooltipPosition = TooltipPosition.Top
) {
	if (!_ref_tooltip || !_ref_anchor || text.length <= 0) {
		return
	}

	_ref_tooltip.textContent = text
	_ref_tooltip?.showPopover()
	_isOpen = true

	const rect_anchor = _ref_anchor.getBoundingClientRect()
	const rect_tooltip = _ref_tooltip.getBoundingClientRect()
	const viewportHeight = window.innerHeight
	const viewportWidth = document.body.clientWidth
	const gap = 10, margin = 10
	const duration = (_ref_anchor.hasAttribute(TooltipAttributes.Duration)
		? Math.max(Number.parseInt(_ref_anchor.getAttribute(TooltipAttributes.Duration) ?? '100'), 0)
		: 100
	)
	let transition: PropertyIndexedKeyframes = (_ref_anchor.hasAttribute(TooltipAttributes.Transition)
		? JSON.parse(_ref_anchor.getAttribute(TooltipAttributes.Transition) ?? '{}')
		: {}
	)
	if (typeof transition !== 'object') {
		transition = {}
	}

	let x = 0
	let y = 0

	// @ts-ignore
	POSITION_X: {
		const width_anchor = rect_anchor.width
		const width_tooltip = rect_tooltip.width
		switch (position) {
		case TooltipPosition.Top:
		case TooltipPosition.Bottom:
			x = rect_anchor.x + (width_anchor / 2) - (width_tooltip / 2)
			break
		case TooltipPosition.Right:
			x = rect_anchor.x + width_anchor + gap
			if (x + width_tooltip > viewportWidth - margin) {
				x = rect_anchor.x - width_tooltip - gap
			}
			break
		case TooltipPosition.Left:
			x = rect_anchor.x - width_tooltip - gap
			if (x < margin) {
				x = rect_anchor.x + width_anchor + gap
			}
			break
		}

		if (x < margin) {
			x = margin
		}
		else if (x + width_tooltip > viewportWidth - margin) {
			x = viewportWidth - width_tooltip - margin
		}
	}

	// @ts-ignore
	POSITION_Y: {
		const height_anchor = rect_anchor.height
		const height_tooltip = rect_tooltip.height
		switch (position) {
		case TooltipPosition.Right:
		case TooltipPosition.Left:
			y = rect_anchor.y + (height_anchor / 2) - (height_tooltip / 2)
			break
		case TooltipPosition.Bottom:
			y = rect_anchor.y + height_anchor + gap
			if (y + height_tooltip > viewportHeight - margin) {
				y = rect_anchor.y - height_tooltip - gap
			}
			break
		case TooltipPosition.Top:
			y = rect_anchor.y - height_tooltip - gap
			if (y < margin) {
				y = rect_anchor.y + height_anchor + gap
			}
			break
		}

		if (y < margin) {
			y = margin
		}
		else if (y + height_tooltip > viewportHeight - margin) {
			y = viewportHeight - height_tooltip - margin
		}
	}

	_ref_tooltip.style.setProperty('left', x + 'px')
	_ref_tooltip.style.setProperty('top', y + 'px')
	_ref_tooltip.style.setProperty('opacity', '1')
	_ref_tooltip?.animate({
		opacity: [0, 1],
		scale: [0.9, 1],
		...transition
	}, {duration: isAnimationAllowed()? duration : 0, easing: AnimationEasing.Spring})
}

function _hideTooltip() {
	if (!_isOpen) {
		return
	}

	clearTimeout(_time_close)
	_time_close = setTimeout(() => {
		_ref_tooltip?.style.removeProperty('opacity')
		_ref_tooltip?.hidePopover()
		_isOpen = false
	}, _isTouchScreen? 1500 : 0)
}

function _initTouchScreenListener() {
	const media = window.matchMedia('(hover: none)')
	_isTouchScreen = media.matches
	media.addEventListener('change', (ev) => _isTouchScreen = ev.matches)
}

function _initEvents(): void {
	document.addEventListener("pointerover", e => {
		const ref_target = (e.target as HTMLElement).closest(`[${TooltipAttributes.Tooltip}]`)
		if (!ref_target) {
			clearTimeout(_time_open)
			_hideTooltip()
			_ref_anchor = null
			return
		}

		if (ref_target === _ref_anchor) {
			return
		}


		_ref_anchor = ref_target as HTMLElement
		const delay = (_ref_anchor.hasAttribute(TooltipAttributes.Delay)
			? Math.max(Number.parseInt(_ref_anchor.getAttribute(TooltipAttributes.Delay) ?? '500'), 0)
			: 500
		)
		clearTimeout(_time_open)
		_time_open = setTimeout(() => {
			if (!_ref_anchor) {
				return
			}

			const text = _ref_anchor.getAttribute(TooltipAttributes.Tooltip)
			if (!text) {
				return
			}

			const position = _ref_anchor.getAttribute(TooltipAttributes.Position)
			_showTooltip(
				text,
				position && isValidEnumValue(position, TooltipPosition)
					? (position as TooltipPosition)
					: undefined
			)
		}, delay)
	})

	document.addEventListener("pointerout", e => {
		if (_ref_anchor && _ref_anchor.contains(e.relatedTarget as Node)) {
			return
		}

		clearTimeout(_time_open)
		_hideTooltip()
		_ref_anchor = null
	})
}

function main(): void {
	_initEvents()
	_initTouchScreenListener()
}

main()