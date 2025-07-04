import { KEY_ESCAPE } from "@/constants/keyboard-value"

type DialogProps = astroHTML.JSX.DialogHTMLAttributes & {
	DialogImportant    ?: boolean
	DialogContainerAttr?: astroHTML.JSX.HTMLAttributes
	DialogHeaderAttr   ?: astroHTML.JSX.HTMLAttributes
	DialogContentAttr  ?: astroHTML.JSX.HTMLAttributes
	DialogFooterAttr   ?: astroHTML.JSX.HTMLAttributes
}

type DialogElement = HTMLDialogElement

type DialogUpdateOptions = {
	DialogImportant?: boolean
	DialogHeader   ?: (string | Node)[] | boolean
	DialogChildren ?: (string | Node)[] | boolean
	DialogFooter   ?: (string | Node)[] | boolean
	DialogRefs     ?: {
		dialog   ?(ref: DialogElement ): unknown
		container?(ref: HTMLDivElement): unknown
		header   ?(ref: HTMLDivElement): unknown
		content  ?(ref: HTMLDivElement): unknown
		footer   ?(ref: HTMLDivElement): unknown
	}
}

type _DialogAttributeChangeEventDetail = {
	attributeName: string
}

type DialogToggleOpenEventDetail = {
	isOpen: boolean
}

enum DialogClasses {
	dialog    = 'c-dialog',
	container = dialog + '-container',
	header    = dialog + '-header',
	content   = dialog + '-content',
	footer    = dialog + '-footer',
}

enum DialogAttributes {
	important = 'data-c-dialog-important',
	focus     = 'data-c-dialog-focus'
}

enum DialogEvents {
	/** `!bubbles | !cancelable | detail: _DialogAttributeChangeEventDetail` */
	attributeChange = 'dialog:attribute-change',

	/** `!bubbles | !cancelable | detail: DialogToggleOpenEventDetail` */
	toggleOpen      = 'dialog:toggle-open',
}

const LISTENED_ATTRIBUTES: string[] = ['open']
const REGISTERED_DIALOG: Set<DialogElement> = new Set<DialogElement>()

// MutationObserver only exist in client side
let MUTATION_OBSERVER: MutationObserver | null = null

function _initMutationObserver(): void {
	if (MUTATION_OBSERVER) return

	MUTATION_OBSERVER = new MutationObserver((entries) => {
		for (const entry of entries) {
			const attr = entry.attributeName
			if (!attr) continue

			entry.target.dispatchEvent(
				new CustomEvent<_DialogAttributeChangeEventDetail>(
					DialogEvents.attributeChange,
					{detail: {attributeName: attr}}
				)
			)
		}
	})
}

function _initDialogRef(dialogRef: DialogElement): void {
	const attributes = {
		get important(): boolean {
			return dialogRef.hasAttribute(DialogAttributes.important)
		}
	}
	let timeoutFocusId: number | NodeJS.Timeout | null = null

	function focusDialog(): void {
		if (timeoutFocusId !== null) clearTimeout(timeoutFocusId)

		dialogRef.toggleAttribute(DialogAttributes.focus, true)
		timeoutFocusId = setTimeout(() => {
			dialogRef.toggleAttribute(DialogAttributes.focus, false)
			timeoutFocusId = null
		}, 1000)
	}

	function dialogRefOnKeyDown(ev: KeyboardEvent): void {
		if (ev.key === KEY_ESCAPE
			&& !ev.altKey
			&& !ev.ctrlKey
			&& !ev.metaKey
			&& !ev.shiftKey
			&& attributes.important
		) {
			focusDialog()
			ev.preventDefault()
		}
	}

	function dialogRefOnCancel(ev: Event): void {
		if (!attributes.important) return

		ev.preventDefault()
	}

	function initEvents(): void {
		dialogRef.addEventListener(DialogEvents.attributeChange as any, (ev: CustomEvent<_DialogAttributeChangeEventDetail>) => {
			const attr = ev.detail.attributeName
			switch (attr) {
			case 'open':
				const isOpen = dialogRef.open
				dialogRef.dispatchEvent(new CustomEvent<DialogToggleOpenEventDetail>(
					DialogEvents.toggleOpen, {detail: {isOpen}}
				))

				if (isOpen) {
					dialogRef.addEventListener('cancel', dialogRefOnCancel)
					dialogRef.addEventListener('keydown', dialogRefOnKeyDown)
				}
				else {
					setTimeout(() => {
						dialogRef.removeEventListener('cancel', dialogRefOnCancel)
						dialogRef.removeEventListener('keydown', dialogRefOnKeyDown)
					})
				}
			}
		})
	}

	initEvents()
}

function createDialogRef(options?: DialogUpdateOptions): DialogElement {
	const dialogRef = updateDialogRef(document.createElement('dialog'), options)
	registerDialogRef(dialogRef)
	return dialogRef
}

function updateDialogRef(dialogRef: DialogElement, options?: DialogUpdateOptions): DialogElement {
	const refs = options?.DialogRefs
	dialogRef.classList.add(DialogClasses.dialog)

	const importantOption = options?.DialogImportant
	if (importantOption !== undefined) {
		dialogRef.toggleAttribute(DialogAttributes.important, importantOption)
	}

	// container
	let containerRef = dialogRef.querySelector<HTMLDivElement>(`.${DialogClasses.container}`)
	if (!containerRef) {
		containerRef = document.createElement('div')
		containerRef.classList.add(DialogClasses.container)
	}

	// header
	const headerOption = options?.DialogHeader
	let headerRef = containerRef.querySelector<HTMLDivElement>(`.${DialogClasses.header}`)
	if (!headerRef) {
		headerRef = document.createElement('div')
		headerRef.classList.add(DialogClasses.header)
	}
	if (headerOption === false) {
		headerRef.replaceChildren()
	}
	else if (headerOption !== undefined && headerOption !== true) {
		headerRef.replaceChildren(...headerOption)
	}

	// content
	const contentOption = options?.DialogChildren
	let contentRef = containerRef.querySelector<HTMLDivElement>(`.${DialogClasses.content}`)
	if (!contentRef) {
		contentRef = document.createElement('div')
		contentRef.classList.add(DialogClasses.header)
	}
	if (contentOption === false) {
		contentRef.replaceChildren()
	}
	else if (contentOption !== undefined && contentOption !== true) {
		contentRef.replaceChildren(...contentOption)
	}

	// footer
	const footerOption = options?.DialogFooter
	let footerRef = containerRef.querySelector<HTMLDivElement>(`.${DialogClasses.footer}`)
	if (!footerRef) {
		footerRef = document.createElement('div')
		footerRef.classList.add(DialogClasses.header)
	}
	if (footerOption === false) {
		footerRef.replaceChildren()
	}
	else if (footerOption !== undefined && footerOption !== true) {
		footerRef.replaceChildren(...footerOption)
	}

	containerRef.replaceChildren(headerRef, contentRef, footerRef)
	dialogRef.replaceChildren(containerRef)
	refs?.container?.(containerRef)
	refs?.content?.(contentRef)
	refs?.dialog?.(dialogRef)
	refs?.footer?.(footerRef)
	refs?.header?.(headerRef)
	return dialogRef
}

function registerDialogRef(...dialogRefs: DialogElement[]): void {
	_initMutationObserver()
	if (dialogRefs.length === 0) {
		dialogRefs = [...document.querySelectorAll<DialogElement>('.' + DialogClasses.dialog)]
	}

	for (const dialogRef of dialogRefs){
		if (REGISTERED_DIALOG.has(dialogRef)) {
			continue
		}

		REGISTERED_DIALOG.add(dialogRef)
		MUTATION_OBSERVER?.observe(dialogRef, {attributeFilter: LISTENED_ATTRIBUTES})
		_initDialogRef(dialogRef)
	}
}

function unregisterDialogRef(...dialogRefs: DialogElement[]): void {
	MUTATION_OBSERVER?.disconnect()
	for (const dialogRef of dialogRefs) {
		REGISTERED_DIALOG.delete(dialogRef)
	}
	for (const dialogRef of REGISTERED_DIALOG) {
		MUTATION_OBSERVER?.observe(dialogRef, {attributeFilter: LISTENED_ATTRIBUTES})
	}
}

export {
	type DialogProps,
	type DialogToggleOpenEventDetail,
	type DialogUpdateOptions,
	type DialogElement,
	DialogClasses,
	DialogAttributes,
	DialogEvents,
	registerDialogRef,
	unregisterDialogRef,
	createDialogRef,
	updateDialogRef
}