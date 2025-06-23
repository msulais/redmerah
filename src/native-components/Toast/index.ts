import { isValidEnumValue } from "@/utils/object"
import { createListRef, updateListRef, type ListElement, type ListProps } from "../List"
import { safeNumber } from "@/utils/number"

type ToastProps = astroHTML.JSX.HTMLAttributes & {
	ToastContentAttr?: ListProps
	ToastPosition   ?: ToastPosition
	ToastAutoclose  ?: boolean
	ToastCloseDelay ?: number
}

type ToastUpdateOptions = {
	ToastPosition  ?: ToastPosition
	ToastAutoclose ?: boolean
	ToastCloseDelay?: number
	ToastTitle     ?: (string | Node)[] | boolean
	ToastSubTitle  ?: (string | Node)[] | boolean
	ToastLeading   ?: (string | Node)[] | boolean
	ToastTrailing  ?: (string | Node)[] | boolean
	ToastRefs      ?: {
		toast  ?(ref: ToastElement            ): unknown
		content?(ref: ListElement<HTMLElement>): unknown
	}
}

type ToastElement = HTMLDivElement

enum ToastAttributes {
	position   = 'data-c-toast-position',
	closeDelay = 'data-c-toast-close-delay',
	autoclose  = 'data-c-toast-autoclose'
}

enum ToastPosition {
	topLeft      = 'top-left',
	topCenter    = 'top-center',
	topRight     = 'top-right',
	bottomLeft   = 'bottom-left',
	bottomCenter = 'bottom-center',
	bottomRight  = 'bottom-right',
}

enum ToastClasses {
	toast   = 'c-toast',
	content = toast + '-content'
}

const REGISTERED_TOAST: Set<ToastElement> = new Set<ToastElement>()

function _initToastRef(toastRef: ToastElement): void {
	const attributes = {
		get autofocus(): boolean {
			return toastRef.hasAttribute(ToastAttributes.autoclose)
		},
		get closeDelay(): number {
			const num = toastRef.getAttribute(ToastAttributes.closeDelay) ?? '5000'
			return safeNumber(Number.parseInt(num), 5000)
		}
	}
	let timeCloseId: number | null | NodeJS.Timeout = null

	function close(): void {
		if (!attributes.autofocus) {return}
		if (timeCloseId !== null) {
			clearTimeout(timeCloseId)
		}

		timeCloseId = setTimeout(() => toastRef.hidePopover(), attributes.closeDelay)
	}

	function initEvents(): void {
		toastRef.addEventListener('toggle', (ev) => {
			const isOpen = (ev as ToggleEvent).newState === 'open'
			if (!isOpen) {return}

			close()
		})
	}

	initEvents()
}

function openToastRef(toastRef: ToastElement): void {
	return toastRef.showPopover()
}

function closeToastRef(toastRef: ToastElement): void {
	return toastRef.hidePopover()
}

function toggleToastRef(toastRef: ToastElement): boolean {
	return toastRef.togglePopover()
}

function createToastRef(options?: ToastUpdateOptions): ToastElement {
	const toastRef = document.createElement('div')
	return updateToastRef(toastRef, options)
}

function updateToastRef(toastRef: ToastElement, options?: ToastUpdateOptions): ToastElement {
	toastRef.classList.add(ToastClasses.toast)
	toastRef.popover = 'auto'

	// CSS need this attribute
	if (!toastRef.hasAttribute(ToastAttributes.position)) {
		toastRef.setAttribute(ToastAttributes.position, ToastPosition.topCenter)
	}

	const closeDelayOption = options?.ToastCloseDelay
	if (closeDelayOption !== undefined) {
		toastRef.setAttribute(ToastAttributes.closeDelay, closeDelayOption + '')
	}

	const autocloseOption = options?.ToastAutoclose
	if (autocloseOption !== undefined) {
		toastRef.toggleAttribute(ToastAttributes.autoclose, autocloseOption)
	}

	const positionOption = options?.ToastPosition
	if (positionOption && isValidEnumValue(positionOption, ToastPosition)) {
		toastRef.setAttribute(ToastAttributes.position, positionOption)
	}

	// content
	let contentRef = toastRef.querySelector<ListElement<HTMLElement>>(`.${ToastClasses.content}`)
	if (!contentRef) {
		contentRef = createListRef()
		contentRef.classList.add(ToastClasses.content)
	}

	updateListRef(contentRef, {
		ListChildren: options?.ToastTitle,
		ListLeading: options?.ToastLeading,
		ListSubtitle: options?.ToastSubTitle,
		ListTrailing: options?.ToastTrailing
	})

	const refs = options?.ToastRefs
	toastRef.replaceChildren(contentRef)
	refs?.content?.(contentRef)
	refs?.toast?.(toastRef)
	return toastRef
}

function registerToastRef(...toastRefs: ToastElement[]): void {
	if (toastRefs.length === 0) {
		toastRefs = [...document.querySelectorAll<ToastElement>('.' + ToastClasses.toast)]
	}

	for (const ref of toastRefs){
		if (REGISTERED_TOAST.has(ref)) {
			continue
		}

		REGISTERED_TOAST.add(ref)
		_initToastRef(ref)
	}
}

function unregisterToastRef(...toastRefs: ToastElement[]): void {
	for (const popoverRef of toastRefs) {
		REGISTERED_TOAST.delete(popoverRef)
	}
}

export {
	type ToastProps,
	type ToastElement,
	type ToastUpdateOptions,
	ToastClasses,
	ToastPosition,
	ToastAttributes,
	createToastRef,
	updateToastRef,
	openToastRef,
	closeToastRef,
	toggleToastRef,
	registerToastRef,
	unregisterToastRef
}