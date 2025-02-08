import { createContext, createEffect, createSignal, mergeProps, Show, splitProps, useContext, type Accessor, type JSX, type ParentComponent } from "solid-js"
import { mergeRefs } from "@solid-primitives/refs"

import { attrSetIfExist, attrClassList } from "@/utils/attributes"
import { elementAnimate, elementRect, elementStyle } from "@/utils/element"
import { eventCall, eventPreventDefault } from "@/utils/event"
import { promiseDone } from "@/utils/object"
import { ICON_CHEVRON_DOWN } from "@/constants/icons"
import { rectHeight } from "@/utils/rect"
import { AnimationEffectTiming } from "@/enums/animation"
import { arrayJoin } from "@/utils/array"

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
	'c:useExpandIcon'?: boolean
	'c:tooltipExpand'?: string
}

const ExpanderHeader: ParentComponent<ExpanderHeaderProps> = ($props) => {
	const $$props = mergeProps({ 'c:useExpandIcon': true }, $props)
	const [props, other] = splitProps($$props, [
		'c:useExpandIcon', 'c:trailing', 'c:tooltipExpand'
	])
	const context = useContext(ExpanderContext)

	return (<List
		data-c-open={attrSetIfExist(context?.isOpen())}
		data-c-variant={attrSetIfExist(context?.variant(), context != null)}
		c:trailing={<>
			{props['c:trailing']}
			<Show when={props['c:useExpandIcon']}>
				<RawIconButton
					data-tooltip={props['c:tooltipExpand'] ?? (context?.isOpen()
						? 'Show less'
						: 'Show more'
					)}
					component="div"
					c:code={ICON_CHEVRON_DOWN}
					class="c-expander-icon"
					data-c-open={attrSetIfExist(context?.isOpen())}
				/>
			</Show>
		</>}
		{...other}
	/>)
}

type RawExpanderHeaderProps = RawListProps & {
	'c:useExpandIcon'?: boolean
	'c:tooltipExpand'?: string
}

const RawExpanderHeader: ParentComponent<RawExpanderHeaderProps> = ($props) => {
	const $$props = mergeProps({ 'c:useExpandIcon': true }, $props)
	const [props, other] = splitProps($$props, [
		'c:useExpandIcon', 'c:trailing', 'c:tooltipExpand'
	])
	const context = useContext(ExpanderContext)

	return (<RawList
		data-c-open={attrSetIfExist(context?.isOpen())}
		data-c-variant={attrSetIfExist(context?.variant(), context != null)}
		c:trailing={<>
			{props['c:trailing']}
			<Show when={props['c:useExpandIcon']}>
				<RawIconButton
					data-tooltip={props['c:tooltipExpand'] ?? (context?.isOpen()
						? 'Show less'
						: 'Show more'
					)}
					component="div"
					c:code={ICON_CHEVRON_DOWN}
					class="c-expander-icon"
					data-c-open={attrSetIfExist(context?.isOpen())}
				/>
			</Show>
		</>}
		{...other}
	/>)
}

type ExpanderProps = JSX.DetailsHtmlAttributes<HTMLDetailsElement> & {
	'c:header': JSX.Element
	'c:variant'?: ExpanderVariant
	'c:attrBody'?: Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children'>
	'c:attrHeader'?: Omit<JSX.HTMLAttributes<HTMLElement>, 'children'>
}

const Expander: ParentComponent<ExpanderProps> = ($props) => {
	const $$props = mergeProps({'c:variant': ExpanderVariant.tonal}, $props)
	const [props, other] = splitProps($$props, [
		'children', 'class', 'c:attrHeader',
		'c:attrBody', 'c:header', 'c:variant',
		'open'
	])
	const [headerProps, otherHeaderProps] = splitProps(
		props['c:attrHeader']! ?? {},
		['class', 'onClick']
	)
	const [bodyProps, otherBodyProps] = splitProps(
		props['c:attrBody']! ?? {},
		['class', 'ref']
	)
	const [isOpen, setIsOpen] = createSignal<boolean>(false)
	let contentRef: HTMLDivElement
	let isAnimationDone = true

	createEffect(() => {
		const open = props.open
		setIsOpen(o => open ?? o)
	})

	return (<details
		class={attrClassList('c-expander', props.class)}
		data-c-variant={props['c:variant']}
		open={isOpen()}
		{...other}>
		<ExpanderContext.Provider
			value={{
				isOpen: isOpen,
				variant: () => props['c:variant']
			}}>
			<summary
				class={attrClassList('c-expander-header', headerProps.class)}
				onClick={(ev) => {
					eventCall(ev, headerProps.onClick)
					eventPreventDefault(ev)
					if (!isAnimationDone) return

					const options: KeyframeAnimationOptions = {
						duration: 300,
						easing: AnimationEffectTiming.spring
					}
					const rect = elementRect(contentRef)
					const paddingTop = elementStyle(contentRef, 'padding-top')
					const paddingBottom = elementStyle(contentRef, 'padding-bottom')
					const paddingRight = elementStyle(contentRef, 'padding-right')
					const paddingLeft = elementStyle(contentRef, 'padding-left')
					const padding = arrayJoin(
						[paddingTop, paddingRight, paddingBottom, paddingLeft], ' '
					)
					const padding2 = arrayJoin(
						['0px', paddingRight, '0px', paddingLeft], ' '
					)
					isAnimationDone = false
					if (isOpen()) return promiseDone(
						elementAnimate(contentRef, {
							opacity: [1, 0],
							height: [rectHeight(rect) + 'px', '0px'],
							padding: [padding, padding2]
						}, options).finished,
						() => {
							isAnimationDone = true
							setIsOpen(false)
						}
					)

					setIsOpen(true)
					promiseDone(
						elementAnimate(contentRef, {
							opacity: [0, 1],
							height: ['0px', rectHeight(rect) + 'px'],
							padding: [padding2, padding]
						}, options).finished,
						() => isAnimationDone = true
					)
				}}
				{...otherHeaderProps}>
				{props['c:header']}
			</summary>
			<div
				class={attrClassList('c-expander-body', bodyProps.class)}
				data-c-variant={props['c:variant']}
				data-c-open={attrSetIfExist(isOpen())}
				ref={mergeRefs(bodyProps.ref, r => contentRef = r)}
				{...otherBodyProps}>
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