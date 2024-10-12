import { createContext, createEffect, createSignal, mergeProps, onCleanup, onMount, Show, splitProps, useContext, type Accessor, type JSX, type ParentComponent } from "solid-js"

import { _children, _class, _headerAttr, _header, _variant, _bodyAttr, _tonal, _open, _expandIconTooltip, _trailing, _useExpandIcon, _isOpen, _onToggle, _currentTarget, _style, _px, _disconnect, _height, _observe, _openByDefault, _click, _then, _onClick, _ref } from "@/constants/string"
import { toggleAttribute } from "@/utils/attributes"
import { isString } from "@/utils/typecheck"
import { getBoundingClientRect } from "@/utils/element"
import { clearTimeDelayed, setTimeDelayed, timeout } from "@/utils/timeout"
import { callEventHandler, preventDefault } from "@/utils/event"

import TextTooltip from "@/components/Tooltip"
import { RawIconButton } from "@/components/Button"
import { List, RawList, type ListProps, type RawListProps } from "@/components/List"
import './index.scss'

enum ExpanderVariant {
	outlined = 'outlined',
	tonal = 'tonal',
	filled = 'filled',
	transparent = 'transparent'
}

type ExpanderContextProps = {
	isOpen: Accessor<boolean>
	variant: Accessor<ExpanderVariant>
} | undefined

const ExpanderContext = createContext<ExpanderContextProps>()

type ExpanderHeaderProps = ListProps & {
	useExpandIcon?: boolean
	expandIconTooltip?: string
}

const ExpanderHeader: ParentComponent<ExpanderHeaderProps> = ($props) => {
	const [props, other] = splitProps(
		mergeProps({ useExpandIcon: true }, $props),
		[_useExpandIcon, _trailing, _expandIconTooltip]
	)
	const context = useContext(ExpanderContext)

	return (<List
		data-open={toggleAttribute(context?.[_isOpen]())}
		data-variant={toggleAttribute(context?.[_variant](), context != null)}
		trailing={<>
			{props[_trailing]}
			<Show when={props[_useExpandIcon]}>
				<TextTooltip text={props[_expandIconTooltip] ?? (context?.[_isOpen]()
					? 'Show less'
					: 'Show more')}>
					<RawIconButton
						component="div"
						code={0xE3FC}
						class="expander-icon"
						data-open={toggleAttribute(context?.[_isOpen]())}
					/>
				</TextTooltip>
			</Show>
		</>}
		{...other}
	/>)
}

type RawExpanderHeaderProps = RawListProps & {
	useExpandIcon?: boolean
	expandIconTooltip?: string
}

const RawExpanderHeader: ParentComponent<RawExpanderHeaderProps> = ($props) => {
	const [props, other] = splitProps($props, [_useExpandIcon, _trailing, _expandIconTooltip])
	const context = useContext(ExpanderContext)

	return (<RawList
		data-open={toggleAttribute(context?.[_isOpen]())}
		data-variant={toggleAttribute(context?.[_variant](), context != null)}
		trailing={<>
			{props[_trailing]}
			<Show when={props[_useExpandIcon]}>
				<TextTooltip text={props[_expandIconTooltip] ?? (context?.[_isOpen]()
					? 'Show less'
					: 'Show more')}>
					<RawIconButton
						component="div"
						code={0xE3FC}
						class="expander-icon"
						data-open={toggleAttribute(context?.[_isOpen]())}
					/>
				</TextTooltip>
			</Show>
		</>}
		{...other}
	/>)
}

type ExpanderProps = Omit<JSX.DetailsHtmlAttributes<HTMLDetailsElement>, 'ref'> & {
	header: JSX.Element
	variant?: ExpanderVariant
	bodyAttr?: Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children'>
	headerAttr?: Omit<JSX.HTMLAttributes<HTMLElement>, 'children'>
	ref?(el: HTMLDetailsElement): unknown
}

const Expander: ParentComponent<ExpanderProps> = ($props) => {
	const BORDER_BOTTOM_WIDTH = 1
	const [props, other] = splitProps(
		mergeProps({variant: ExpanderVariant[_tonal]}, $props),
		[
			_children, _class, _headerAttr,
			_bodyAttr, _header, _variant,
			_open, _onToggle, _ref
		]
	)
	const [headerProps, headerPropsOther] = splitProps(props[_headerAttr]! ?? {}, [_class, _onClick])
	const [bodyProps, bodyPropsOther] = splitProps(props[_bodyAttr]! ?? {}, [_class, _style])
	const [isOpen, setIsOpen] = createSignal<boolean>(false)
	const [contentHeight, setContentHeight] = createSignal<number>(0)

	// We expect no animation when the default state of <details> opened by default
	const [isMounted, setIsMounted] = createSignal<boolean>(false)
	let div_content_ref: HTMLDivElement
	let expander_ref: HTMLDetailsElement

	onMount(() => {
		let t: number | null = null
		const update = () => {
			if (!div_content_ref) return
			if (t != null) clearTimeDelayed(t)
			t = setTimeDelayed(() => {
				const height = getBoundingClientRect(div_content_ref)[_height] + BORDER_BOTTOM_WIDTH
				if (contentHeight() != height) setContentHeight(height)
				t = null
			}, 50)
		}
		const resizeObserver = new ResizeObserver(update)
		const mutationObserver = new MutationObserver(update)

		setContentHeight(getBoundingClientRect(div_content_ref)[_height] + BORDER_BOTTOM_WIDTH)
		setIsMounted(true)
		resizeObserver[_observe](expander_ref!, { box: "border-box" })
		mutationObserver[_observe](expander_ref!, { subtree: true, childList: true })

		onCleanup(() => {
			resizeObserver[_disconnect]()
			mutationObserver[_disconnect]()
		})
	})

	createEffect(() => {
		const open = props[_open]
		setIsOpen(o => open ?? o)
	})

	return (<details
		ref={r => {
			expander_ref = r
			if (props[_ref]) props[_ref](r)
		}}
		class={`expander${props[_class]? ` ${props[_class]}` : ''}`}
		data-variant={props[_variant]}
		onToggle={ev => {
			setIsOpen(ev[_currentTarget][_open])
			callEventHandler(ev, props[_onToggle])
		}}
		open={props[_open]}
		{...other}>
		<ExpanderContext.Provider
			value={{
				isOpen,
				variant: () => props[_variant]
			}}>
			<summary
				class={`expander-header${headerProps[_class]? ` ${headerProps[_class]}` : ''}`}
				onClick={(ev) => {
					callEventHandler(ev, headerProps[_onClick])
					if (!isOpen()) return;

					const el = ev[_currentTarget]
					preventDefault(ev)
					setIsOpen(false)
					timeout(300)[_then](() => el[_click]())
				}}
				{...headerPropsOther}>
				{props[_header]}
			</summary>
			<div
				class={`expander-body${bodyProps[_class] ? ` ${bodyProps[_class]}` : ''}`}
				data-variant={props[_variant]}
				data-open={toggleAttribute(isOpen())}
				style={isString(bodyProps[_style])
					? bodyProps[_style]
					: {
						height: isMounted()
							? (isOpen() ? contentHeight() : 0) + _px
							: undefined,
						...bodyProps[_style] as JSX.CSSProperties
					}
				}
				{...bodyPropsOther}>
				<div ref={r => div_content_ref = r}>
					{props[_children]}
				</div>
			</div>
		</ExpanderContext.Provider>
	</details>)
}

export {
	ExpanderVariant,
	Expander,
	ExpanderHeader,
	RawExpanderHeader,
	ExpanderContext
}
export type {
	ExpanderProps,
	ExpanderHeaderProps,
	RawExpanderHeaderProps,
	ExpanderContextProps
}
export default Expander