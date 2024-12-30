import { createContext, createEffect, createSignal, mergeProps, onCleanup, onMount, Show, splitProps, useContext, type Accessor, type JSX, type ParentComponent } from "solid-js"
import { mergeRefs } from "@solid-primitives/refs"

import { attr_set_if_exist, classlist } from "@/utils/attributes"
import { is_string } from "@/utils/typecheck"
import { element_click, element_rect } from "@/utils/element"
import { timeout_clear, timeout_set, wait } from "@/utils/timeout"
import { event_call, event_current_target, event_prevent_default } from "@/utils/event"
import { rect_height } from "@/utils/rect"
import { promise_done } from "@/utils/object"

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
	is_open: Accessor<boolean>
	variant: Accessor<ExpanderVariant>
} | undefined

const ExpanderContext = createContext<ExpanderContextProps>()

type ExpanderHeaderProps = ListProps & {
	use_expand_icon?: boolean
	tooltip_expand?: string
}

const ExpanderHeader: ParentComponent<ExpanderHeaderProps> = ($props) => {
	const [props, other] = splitProps(
		mergeProps({ use_expand_icon: true }, $props),
		['use_expand_icon', 'trailing', 'tooltip_expand']
	)
	const context = useContext(ExpanderContext)

	return (<List
		data-c-open={attr_set_if_exist(context?.is_open())}
		data-c-variant={attr_set_if_exist(context?.variant(), context != null)}
		trailing={<TextTooltip>
			{props.trailing}
			<Show when={props.use_expand_icon}>
				<RawIconButton
					data-tooltip={props.tooltip_expand ?? (context?.is_open()
						? 'Show less'
						: 'Show more'
					)}
					component="div"
					code={0xE3FC}
					class="c-expander-icon"
					data-c-open={attr_set_if_exist(context?.is_open())}
				/>
			</Show>
		</TextTooltip>}
		{...other}
	/>)
}

type RawExpanderHeaderProps = RawListProps & {
	use_expand_icon?: boolean
	tooltip_expand?: string
}

const RawExpanderHeader: ParentComponent<RawExpanderHeaderProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'use_expand_icon', 'trailing', 'tooltip_expand'
	])
	const context = useContext(ExpanderContext)

	return (<RawList
		data-c-open={attr_set_if_exist(context?.is_open())}
		data-c-variant={attr_set_if_exist(context?.variant(), context != null)}
		trailing={<TextTooltip>
			{props.trailing}
			<Show when={props.use_expand_icon}>
				<RawIconButton
					data-tooltip={props.tooltip_expand ?? (context?.is_open()
						? 'Show less'
						: 'Show more'
					)}
					component="div"
					code={0xE3FC}
					class="c-expander-icon"
					data-c-open={attr_set_if_exist(context?.is_open())}
				/>
			</Show>
		</TextTooltip>}
		{...other}
	/>)
}

type ExpanderProps = JSX.DetailsHtmlAttributes<HTMLDetailsElement> & {
	header: JSX.Element
	variant?: ExpanderVariant
	attr_body?: Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children'>
	attr_header?: Omit<JSX.HTMLAttributes<HTMLElement>, 'children'>
}

const Expander: ParentComponent<ExpanderProps> = ($props) => {
	const BORDER_BOTTOM_WIDTH = 1
	const [props, other] = splitProps(
		mergeProps({variant: ExpanderVariant.tonal}, $props),
		[
			'children', 'class', 'attr_header',
			'attr_body', 'header', 'variant',
			'open', 'onToggle', 'ref'
		]
	)
	const [header_props, header_props_other] = splitProps(
		props.attr_header! ?? {},
		['class', 'onClick']
	)
	const [body_props, body_props_other] = splitProps(
		props.attr_body! ?? {},
		['class', 'style']
	)
	const [is_open, set_is_open] = createSignal<boolean>(false)
	const [content_height, set_content_height] = createSignal<number>(0)

	// We expect no animation when the default state of <details> opened by default
	const [is_mounted, set_is_mounted] = createSignal<boolean>(false)
	let div_content_ref: HTMLDivElement
	let expander_ref: HTMLDetailsElement

	onMount(() => {
		let t: number | null = null
		const update = () => {
			if (!div_content_ref) return
			if (t != null) timeout_clear(t)
			t = timeout_set(() => {
				const height = rect_height(element_rect(div_content_ref)) + BORDER_BOTTOM_WIDTH
				if (content_height() != height) set_content_height(height)
				t = null
			}, 50)
		}
		const resizeObserver = new ResizeObserver(update)
		const mutationObserver = new MutationObserver(update)

		set_content_height(rect_height(element_rect(div_content_ref)) + BORDER_BOTTOM_WIDTH)
		set_is_mounted(true)
		resizeObserver.observe(expander_ref!, { box: "border-box" })
		mutationObserver.observe(expander_ref!, { subtree: true, childList: true })

		onCleanup(() => {
			resizeObserver.disconnect()
			mutationObserver.disconnect()
		})
	})

	createEffect(() => {
		const open = props.open
		set_is_open(o => open ?? o)
	})

	return (<details
		ref={mergeRefs(props.ref, r => expander_ref = r)}
		class={classlist('c-expander', props.class)}
		data-c-variant={props.variant}
		onToggle={ev => {
			set_is_open(event_current_target(ev).open)
			event_call(ev, props.onToggle)
		}}
		open={props.open}
		{...other}>
		<ExpanderContext.Provider
			value={{
				is_open: is_open,
				variant: () => props.variant
			}}>
			<summary
				class={classlist('c-expander-header', header_props.class)}
				onClick={(ev) => {
					if (event_call(ev, header_props.onClick)) return
					if (!is_open()) return;

					const el = event_current_target(ev)
					event_prevent_default(ev)
					set_is_open(false)
					promise_done(wait(300), () => element_click(el))
				}}
				{...header_props_other}>
				{props.header}
			</summary>
			<div
				class={classlist('c-expander-body', body_props.class)}
				data-c-variant={props.variant}
				data-c-open={attr_set_if_exist(is_open())}
				style={is_string(body_props.style)
					? body_props.style
					: {
						height: is_mounted()
							? (is_open() ? content_height() : 0) + 'px'
							: undefined,
						...body_props.style as JSX.CSSProperties
					}
				}
				{...body_props_other}>
				<div ref={r => div_content_ref = r}>
					{props.children}
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