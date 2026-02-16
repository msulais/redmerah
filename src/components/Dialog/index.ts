import { KeyboardValue } from "@/enums/keyboard"
import { $add_event, $children, $classlist, $create, $is_array, $is_bool, $is_false, $query, $rm_event, $toggle_attr } from "../utils"

export namespace CDialog {
	export type CElement = HTMLDialogElement
	export type UpdateOptions = {
		Dialog?: {
			important?: boolean
			header   ?: (string | Node)[] | boolean
			children ?: (string | Node)[] | boolean
			footer   ?: (string | Node)[] | boolean
			refs     ?: {
				dialog   ?(ref: CElement ): unknown
				container?(ref: HTMLDivElement): unknown
				header   ?(ref: HTMLDivElement): unknown
				content  ?(ref: HTMLDivElement): unknown
				footer   ?(ref: HTMLDivElement): unknown
			}
		}
	}

	type EventDetails = {
		attributeChange: {
			attributeName: string
		}
		toggleOpen: {
			isOpen: boolean
		}
	}

	export enum Classes {
		Dialog    = 'c-dialog',
		Container = Dialog + '-container',
		Header    = Dialog + '-header',
		Content   = Dialog + '-content',
		Footer    = Dialog + '-footer',
	}

	export enum Attributes {
		Important = 'data-c-dialog-important',
		Focus     = 'data-c-dialog-focus'
	}

	export enum Events {
		/** `!bubbles | !cancelable | detail` */
		AttributeChange = 'dialog:attribute-change',

		/** `!bubbles | !cancelable | detail` */
		ToggleOpen      = 'dialog:toggle-open',
	}

	const LISTENED_ATTRIBUTES: string[] = ['open']
	const REGISTERED_DIALOG: Set<CElement> = new Set<CElement>()
	const MUTATION_OBSERVER = typeof MutationObserver !== 'undefined'?
		new MutationObserver((entries) => {for (const entry of entries) {
			const attr = entry.attributeName
			if (!attr) continue

			entry.target.dispatchEvent(
				new CustomEvent<EventDetails['attributeChange']>(
					Events.AttributeChange,
					{detail: {attributeName: attr}}
				)
			)
		}}) : undefined

	function initDialog(ref_dialog: CElement): void {
		const attributes = {
			get important(): boolean {
				return ref_dialog.hasAttribute(Attributes.Important)
			}
		}
		let time_focus: number | NodeJS.Timeout | null = null

		function focusDialog(): void {
			if (time_focus !== null) clearTimeout(time_focus)

			$toggle_attr(ref_dialog, Attributes.Focus, true)
			time_focus = setTimeout(() => {
				$toggle_attr(ref_dialog, Attributes.Focus, false)
				time_focus = null
			}, 1000)
		}

		function ref_dialog_onKeyDown(ev: KeyboardEvent): void {
			if (ev.key === KeyboardValue.Escape
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

		function ref_dialog_onCancel(ev: Event): void {
			if (!attributes.important) return

			ev.preventDefault()
		}

		function initEvents(): void {
			$add_event<
				CustomEvent<EventDetails['attributeChange']>
			>(ref_dialog, Events.AttributeChange, ev => {
				const attr = ev.detail.attributeName
				switch (attr) {
				case 'open':
					const isOpen = ref_dialog.open
					ref_dialog.dispatchEvent(new CustomEvent<EventDetails['toggleOpen']>(
						Events.ToggleOpen, {detail: {isOpen}}
					))

					if (isOpen) {
						$add_event(ref_dialog, 'cancel', ref_dialog_onCancel)
						$add_event(ref_dialog, 'keydown', ref_dialog_onKeyDown)
					}
					else {
						setTimeout(() => {
							$rm_event(ref_dialog, 'cancel', ref_dialog_onCancel)
							$rm_event(ref_dialog, 'keydown', ref_dialog_onKeyDown)
						})
					}
				}
			})
		}

		initEvents()
	}

	export function create(options?: UpdateOptions): CElement {
		const ref_dialog = update($create('dialog'), options)
		register(ref_dialog)
		return ref_dialog
	}

	export function update(ref_dialog: CElement, options?: UpdateOptions): CElement {
		const opt = options?.Dialog
		const refs = opt?.refs
		$classlist(ref_dialog, Classes.Dialog)

		const opt_important = opt?.important
		if ($is_bool(opt_important)) {
			$toggle_attr(ref_dialog, Attributes.Important, opt_important)
		}

		// container
		let ref_container = $query<HTMLDivElement>(`.${Classes.Container}`, ref_dialog)
		if (!ref_container) {
			ref_container = $create('div')
			$classlist(ref_container, Classes.Container)
		}

		// header
		const opt_header = opt?.header
		let ref_header = $query<HTMLDivElement>(`.${Classes.Header}`, ref_container)
		if (!ref_header) {
			ref_header = $create('div')
			$classlist(ref_header, Classes.Header)
		}
		if ($is_false(opt_header)) {
			$children(ref_header)
		}
		else if ($is_array(opt_header)) {
			$children(ref_header, ...opt_header)
		}

		// content
		const opt_content = opt?.children
		let ref_content = $query<HTMLDivElement>(`.${Classes.Content}`, ref_container)
		if (!ref_content) {
			ref_content = $create('div')
			$classlist(ref_content, Classes.Header)
		}
		if ($is_false(opt_content)) {
			$children(ref_content)
		}
		else if ($is_array(opt_content)) {
			$children(ref_content, ...opt_content)
		}

		// footer
		const opt_footer = opt?.footer
		let ref_footer = $query<HTMLDivElement>(`.${Classes.Footer}`, ref_container)
		if (!ref_footer) {
			ref_footer = $create('div')
			$classlist(ref_footer, Classes.Header)
		}
		if ($is_false(opt_footer)) {
			$children(ref_footer)
		}
		else if ($is_array(opt_footer)) {
			$children(ref_footer, ...opt_footer)
		}

		$children(ref_container, ref_header, ref_content, ref_footer)
		$children(ref_dialog, ref_container)
		refs?.container?.(ref_container)
		refs?.content?.(ref_content)
		refs?.dialog?.(ref_dialog)
		refs?.footer?.(ref_footer)
		refs?.header?.(ref_header)
		return ref_dialog
	}

	export function register(...refs_dialog: CElement[]): void {
		if (refs_dialog.length === 0) {
			refs_dialog = [...document.querySelectorAll<CElement>('.' + Classes.Dialog)]
		}

		for (const ref of refs_dialog){
			if (REGISTERED_DIALOG.has(ref)) {
				continue
			}

			REGISTERED_DIALOG.add(ref)
			MUTATION_OBSERVER?.observe(ref, {attributeFilter: LISTENED_ATTRIBUTES})
			initDialog(ref)
		}
	}

	export function unregister(...refs_dialog: CElement[]): void {
		MUTATION_OBSERVER?.disconnect()
		for (const ref of refs_dialog) {
			REGISTERED_DIALOG.delete(ref)
		}
		for (const ref of REGISTERED_DIALOG) {
			MUTATION_OBSERVER?.observe(ref, {attributeFilter: LISTENED_ATTRIBUTES})
		}
	}
}

export type DialogProps = astroHTML.JSX.DialogHTMLAttributes & {
	DialogImportant    ?: boolean
	DialogContainerAttr?: astroHTML.JSX.HTMLAttributes
	DialogHeaderAttr   ?: astroHTML.JSX.HTMLAttributes
	DialogContentAttr  ?: astroHTML.JSX.HTMLAttributes
	DialogFooterAttr   ?: astroHTML.JSX.HTMLAttributes
}