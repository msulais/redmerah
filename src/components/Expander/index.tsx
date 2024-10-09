import type { ParentComponent } from "solid-js"
import { Show, children, createEffect, createMemo, createSignal, mergeProps, onCleanup, onMount, splitProps, type JSX } from "solid-js"

import type { ComponentEvent } from "@/types/event"
import { _children, _class, _classList, _disconnect, _expandIconTooltip, _tonal, _header, _headerAttr, _height, _isOpen, _leading, _observe, _onClick, _onToggle, _onToggleOpen, _openByDefault, _px, _ref, _showExpandIcon, _subtitle, _title, _trailing, _variant } from "@/constants/string"
import { getBoundingClientRect } from "@/utils/element"
import { stopPropagation } from "@/utils/event"
import { toggleAttribute } from "@/utils/attributes"
import { clearTimeDelayed, setTimeDelayed } from "@/utils/timeout"
import { isVarHasValue } from "@/utils/data"

import { IconButton } from "@/components/Button"
import { TextTooltip } from "@/components/Tooltip"
import List from "@/components/List"
import './index.scss'

type ExpanderProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'ref' | 'title'> & {
	title?: JSX.Element
	subtitle?: JSX.Element
	leading?: JSX.Element
	trailing?: JSX.Element
	headerAttr?: Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onClick'> & {
		onClick?: (ev: ComponentEvent<MouseEvent, HTMLDivElement>) => unknown
	}

	/**
	 * Force expander to open
	 */
	isOpen?: boolean
	showExpandIcon?: boolean
	expandIconTooltip?: string
	openByDefault?: boolean
	ref?: (el: HTMLDivElement) => unknown
	onToggleOpen?: (isOpen: boolean) => unknown
	variant?: ExpanderVariant
}

export enum ExpanderVariant {
	outlined = 'outlined',
	tonal = 'tonal',
	filled = 'filled',
	transparent = 'transparent'
}

const Expander: ParentComponent<ExpanderProps> = ($props) => {
	const $$props = mergeProps({showExpandIcon: true}, $props)
	const [props, other] = splitProps($$props, [
		_title, _children, _isOpen, _ref,
		_openByDefault, _onToggleOpen, _variant,
		_subtitle, _leading, _trailing,
		_showExpandIcon, _headerAttr, _class,
		_expandIconTooltip
	])
	const trailingComponent = children(() => props[_trailing])
	const childrenComponent = children(() => props[_children])
	const [isLocalOpen, setIsLocalOpen] = createSignal<boolean>(false)
	const [contentHeight, setContentHeight] = createSignal<number>(0)
	const [isMounted, setIsMounted] = createSignal<boolean>(false)
	const open = createMemo<boolean>(() => (props[_isOpen] ?? isLocalOpen()) && isVarHasValue(childrenComponent()))
	let isForceOpen: boolean = false
	let div_content_ref: HTMLDivElement
	let expander_ref: HTMLDivElement

	function toggleOpen(ev: Event): void {
		if (!childrenComponent()) return;
		setContentHeight(getBoundingClientRect(div_content_ref)[_height] + 1)
		setIsLocalOpen(o => !o)
		stopPropagation(ev)

		if (props[_onToggleOpen]) props[_onToggleOpen](open())
	}

	onMount(() => {
		let t: number | null = null
		const resizeObserver = new ResizeObserver(() => {
			if (!div_content_ref) return
			if (t != null) clearTimeDelayed(t)
			t = setTimeDelayed(() => {
				const height = getBoundingClientRect(div_content_ref)[_height] + 1
				if (contentHeight() != height) setContentHeight(height)
				t = null
			}, 50)
		})
		const mutationObserver = new MutationObserver(() => {
			if (!div_content_ref) return
			if (t != null) clearTimeDelayed(t)
			t = setTimeDelayed(() => {
				const height = getBoundingClientRect(div_content_ref)[_height] + 1
				if (contentHeight() != height) setContentHeight(height)
				t = null
			}, 50)
		})

		isForceOpen = props[_isOpen] ?? isForceOpen
		setContentHeight(getBoundingClientRect(div_content_ref)[_height] + 1)
		if (props[_openByDefault]) setIsLocalOpen(true)

		setIsMounted(true)
		resizeObserver[_observe](expander_ref!, { box: "border-box" })
		mutationObserver[_observe](expander_ref!, {subtree: true, childList: true})

		onCleanup(() => {
			resizeObserver[_disconnect]()
			mutationObserver[_disconnect]()
		})
	})

	// listening `props.isOpen` prop
	createEffect(() => {
		const isOpen = props[_isOpen]
		const onToggleOpen = props[_onToggleOpen]

		if (isOpen && isOpen != isForceOpen) {
			isForceOpen = isOpen
			if (onToggleOpen) onToggleOpen(open())
		}
	})

	return (<div
		class={"expander" + (props[_class]? ` ${props[_class]}` : '')}
		ref={r => {
			expander_ref = r
			if (props[_ref]) props[_ref](r)
		}}
		data-open={toggleAttribute(open())}
		{...other}>
		<List
			classList={{'expander-header': true}}
			tabIndex={0}
			data-no-children={toggleAttribute(!childrenComponent())}
			onClick={(ev) => {
				toggleOpen(ev)
				if (props[_headerAttr] && props[_headerAttr][_onClick]) props[_headerAttr][_onClick](ev)
			}}
			leading={props[_leading]}
			data-variant={props[_variant] ?? ExpanderVariant[_tonal]}
			data-open={toggleAttribute(open())}
			subtitle={props[_subtitle]}
			data-trailing={toggleAttribute(trailingComponent() || (props[_showExpandIcon] && childrenComponent()))}
			trailing={<>
				{trailingComponent()}
				<Show when={props[_showExpandIcon] && childrenComponent()}>
					<TextTooltip text={props[_expandIconTooltip] ?? (open()? 'Shrink' : 'Expand')}>
						<IconButton classList={{"expander-header-icon": true}} code={0xE3FC}/>
					</TextTooltip>
				</Show>
			</>}
			{...props[_headerAttr]}>
			{props[_title]}
		</List>
		<div
			data-open={toggleAttribute(open())}
			data-trailing={toggleAttribute(trailingComponent() || (props[_showExpandIcon] && childrenComponent()))}
			data-variant={props[_variant] ?? ExpanderVariant[_tonal]}
			class="expander-content"
			style={{ height: isMounted()
				? (open()? contentHeight() : 0) + _px
				: undefined
			}}>
			<div ref={r => div_content_ref = r}>{childrenComponent()}</div>
		</div>
	</div>)
}

export default Expander