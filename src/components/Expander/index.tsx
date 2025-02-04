import { createContext, createEffect, createSignal, mergeProps, Show, splitProps, useContext, type Accessor, type JSX, type ParentComponent } from "solid-js"
import { mergeRefs } from "@solid-primitives/refs"

import { attr_set_if_exist, classlist } from "@/utils/attributes"
import { element_animate, element_rect, element_style } from "@/utils/element"
import { event_call, event_prevent_default } from "@/utils/event"
import { promise_done } from "@/utils/object"
import { ICON_CHEVRON_DOWN } from "@/constants/icons"
import { rect_height } from "@/utils/rect"
import { AnimationEffectTiming } from "@/enums/animation"
import { array_join } from "@/utils/array"

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
	c_use_expand_icon?: boolean
	c_tooltip_expand?: string
}

const ExpanderHeader: ParentComponent<ExpanderHeaderProps> = ($props) => {
	const [props, other] = splitProps(
		mergeProps({ c_use_expand_icon: true }, $props),
		['c_use_expand_icon', 'c_trailing', 'c_tooltip_expand']
	)
	const context = useContext(ExpanderContext)

	return (<List
		data-c-open={attr_set_if_exist(context?.is_open())}
		data-c-variant={attr_set_if_exist(context?.variant(), context != null)}
		c_trailing={<>
			{props.c_trailing}
			<Show when={props.c_use_expand_icon}>
				<RawIconButton
					data-tooltip={props.c_tooltip_expand ?? (context?.is_open()
						? 'Show less'
						: 'Show more'
					)}
					component="div"
					c_code={ICON_CHEVRON_DOWN}
					class="c-expander-icon"
					data-c-open={attr_set_if_exist(context?.is_open())}
				/>
			</Show>
		</>}
		{...other}
	/>)
}

type RawExpanderHeaderProps = RawListProps & {
	c_use_expand_icon?: boolean
	c_tooltip_expand?: string
}

const RawExpanderHeader: ParentComponent<RawExpanderHeaderProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'c_use_expand_icon', 'c_trailing', 'c_tooltip_expand'
	])
	const context = useContext(ExpanderContext)

	return (<RawList
		data-c-open={attr_set_if_exist(context?.is_open())}
		data-c-variant={attr_set_if_exist(context?.variant(), context != null)}
		c_trailing={<>
			{props.c_trailing}
			<Show when={props.c_use_expand_icon}>
				<RawIconButton
					data-tooltip={props.c_tooltip_expand ?? (context?.is_open()
						? 'Show less'
						: 'Show more'
					)}
					component="div"
					c_code={ICON_CHEVRON_DOWN}
					class="c-expander-icon"
					data-c-open={attr_set_if_exist(context?.is_open())}
				/>
			</Show>
		</>}
		{...other}
	/>)
}

type ExpanderProps = JSX.DetailsHtmlAttributes<HTMLDetailsElement> & {
	c_header: JSX.Element
	c_variant?: ExpanderVariant
	c_attr_body?: Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children'>
	c_attr_header?: Omit<JSX.HTMLAttributes<HTMLElement>, 'children'>
}

const Expander: ParentComponent<ExpanderProps> = ($props) => {
	const [props, other] = splitProps(
		mergeProps({c_variant: ExpanderVariant.tonal}, $props),
		[
			'children', 'class', 'c_attr_header',
			'c_attr_body', 'c_header', 'c_variant',
			'open'
		]
	)
	const [header_props, header_props_other] = splitProps(
		props.c_attr_header! ?? {},
		['class', 'onClick']
	)
	const [body_props, body_props_other] = splitProps(
		props.c_attr_body! ?? {},
		['class', 'ref']
	)
	const [is_open, set_is_open] = createSignal<boolean>(false)
	let div_content_ref: HTMLDivElement
	let animation_done = true

	createEffect(() => {
		const open = props.open
		set_is_open(o => open ?? o)
	})

	return (<details
		class={classlist('c-expander', props.class)}
		data-c-variant={props.c_variant}
		open={is_open()}
		{...other}>
		<ExpanderContext.Provider
			value={{
				is_open: is_open,
				variant: () => props.c_variant
			}}>
			<summary
				class={classlist('c-expander-header', header_props.class)}
				onClick={(ev) => {
					event_call(ev, header_props.onClick)
					event_prevent_default(ev)
					if (!animation_done) return

					const options: KeyframeAnimationOptions = {
						duration: 300,
						easing: AnimationEffectTiming.spring
					}
					const rect = element_rect(div_content_ref)
					const padding_top = element_style(div_content_ref, 'padding-top')
					const padding_bottom = element_style(div_content_ref, 'padding-bottom')
					const padding_right = element_style(div_content_ref, 'padding-right')
					const padding_left = element_style(div_content_ref, 'padding-left')
					const padding = array_join(
						[padding_top, padding_right, padding_bottom, padding_left], ' '
					)
					const padding2 = array_join(
						['0px', padding_right, '0px', padding_left], ' '
					)
					animation_done = false
					if (is_open()) return promise_done(
						element_animate(div_content_ref, {
							opacity: [1, 0],
							height: [rect_height(rect) + 'px', '0px'],
							padding: [padding, padding2]
						}, options).finished,
						() => {
							animation_done = true
							set_is_open(false)
						}
					)

					set_is_open(true)
					promise_done(
						element_animate(div_content_ref, {
							opacity: [0, 1],
							height: ['0px', rect_height(rect) + 'px'],
							padding: [padding2, padding]
						}, options).finished,
						() => animation_done = true
					)
				}}
				{...header_props_other}>
				{props.c_header}
			</summary>
			<div
				class={classlist('c-expander-body', body_props.class)}
				data-c-variant={props.c_variant}
				data-c-open={attr_set_if_exist(is_open())}
				ref={mergeRefs(body_props.ref, r => div_content_ref = r)}
				{...body_props_other}>
				{props.children}
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