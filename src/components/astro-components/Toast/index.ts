import { isValidEnumValue } from "@/utils/object"
import { CList as GCList, type ListProps } from "../List"
import { safeNumber } from "@/utils/number"
import { $add_event, $children, $classlist, $create, $get_attr, $has_attr, $is_bool, $is_number, $parse_int, $query, $query_all, $set_attr, $toggle_attr } from "../utils"

export namespace CToast {
	export type CElement = HTMLDivElement
	export type UpdateOptions = {
		Toast?: {
			position  ?: Position
			autoclose ?: boolean
			closeDelay?: number
			title     ?: (string | Node)[] | boolean
			subTitle  ?: (string | Node)[] | boolean
			leading   ?: (string | Node)[] | boolean
			trailing  ?: (string | Node)[] | boolean
			refs      ?: {
				toast  ?(ref: CElement): unknown
				content?(ref: GCList.CElement): unknown
			}
		}
	}

	export enum Attributes {
		Position   = 'data-c-toast-position',
		CloseDelay = 'data-c-toast-close-delay',
		Autoclose  = 'data-c-toast-autoclose'
	}

	export enum Position {
		TopLeft      = 'top-left',
		TopCenter    = 'top-center',
		TopRight     = 'top-right',
		BottomLeft   = 'bottom-left',
		BottomCenter = 'bottom-center',
		BottomRight  = 'bottom-right',
	}

	export enum Classes {
		Toast   = 'c-toast',
		Content = Toast + '-content'
	}

	const REGISTERED_TOAST: Set<CElement> = new Set<CElement>()

	function initToast(ref_toast: CElement): void {
		const attributes = {
			get autofocus(): boolean {
				return $has_attr(ref_toast, Attributes.Autoclose)
			},
			get closeDelay(): number {
				const num = $get_attr(ref_toast, Attributes.CloseDelay) ?? '5000'
				return safeNumber($parse_int(num), 5000)
			}
		}
		let time_close: number | null | NodeJS.Timeout = null

		function close(): void {
			if (!attributes.autofocus) {return}
			if (time_close !== null) {
				clearTimeout(time_close)
			}

			time_close = setTimeout(() => ref_toast.hidePopover(), attributes.closeDelay)
		}

		function initEvents(): void {
			$add_event<ToggleEvent>(ref_toast, 'toggle', (ev) => {
				const isOpen = ev.newState === 'open'
				if (!isOpen) {return}

				close()
			})
		}

		initEvents()
	}

	export function open(ref_toast: CElement): void {
		return ref_toast.showPopover()
	}

	export function close(ref_toast: CElement): void {
		return ref_toast.hidePopover()
	}

	export function toggle(ref_toast: CElement): boolean {
		return ref_toast.togglePopover()
	}

	export function create(options?: UpdateOptions): CElement {
		const ref_toast = update($create('div'), options)
		register(ref_toast)
		return ref_toast
	}

	export function update(ref_toast: CElement, options?: UpdateOptions): CElement {
		const opt = options?.Toast
		$classlist(ref_toast, Classes.Toast)
		ref_toast.popover = 'auto'

		// CSS need this attribute
		if (!$has_attr(ref_toast, Attributes.Position)) {
			$set_attr(ref_toast, Attributes.Position, Position.TopCenter)
		}

		const opt_closeDelay = opt?.closeDelay
		if ($is_number(opt_closeDelay)) {
			$set_attr(ref_toast, Attributes.CloseDelay, opt_closeDelay + '')
		}

		const opt_autoclose = opt?.autoclose
		if ($is_bool(opt_autoclose)) {
			$toggle_attr(ref_toast, Attributes.Autoclose, opt_autoclose)
		}

		const opt_position = opt?.position
		if (opt_position && isValidEnumValue(opt_position, Position)) {
			$set_attr(ref_toast, Attributes.Position, opt_position)
		}

		// content
		let ref_content = $query<GCList.CElement>(`.${Classes.Content}`, ref_toast)
		if (!ref_content) {
			ref_content = GCList.create<GCList.CElement>()
			$classlist(ref_content, Classes.Content)
		}

		GCList.update(ref_content, {List: {
			children: opt?.title,
			leading: opt?.leading,
			subtitle: opt?.subTitle,
			trailing: opt?.trailing
		}})

		const refs = opt?.refs
		$children(ref_toast, ref_content)
		refs?.content?.(ref_content)
		refs?.toast?.(ref_toast)
		return ref_toast
	}

	export function register(...refs_toast: CElement[]): void {
		if (refs_toast.length === 0) {
			refs_toast = [...$query_all<CElement>('.' + Classes.Toast)]
		}

		for (const ref of refs_toast){
			if (REGISTERED_TOAST.has(ref)) {
				continue
			}

			REGISTERED_TOAST.add(ref)
			initToast(ref)
		}
	}

	export function unregister(...ref_toast: CElement[]): void {
		for (const ref of ref_toast) {
			REGISTERED_TOAST.delete(ref)
		}
	}
}

export type ToastProps = astroHTML.JSX.HTMLAttributes & {
	ToastContentAttr?: ListProps
	ToastPosition   ?: Position
	ToastAutoclose  ?: boolean
	ToastCloseDelay ?: number
}