import { type ParentComponent, type JSX, mergeProps, splitProps, type VoidComponent, type ValidComponent, createMemo } from 'solid-js'
import { Dynamic, type DynamicProps } from 'solid-js/web'

import { attrClassList, attrSetIfExist } from '@/utils/attributes'
import { eventCall, eventPreventDefault } from '@/utils/event'

import Icon, { type IconProps } from '@/components/Icon'
import Emoji from '@/components/Emoji'
import './index.scss'

enum ButtonVariant {
	filled,
	outlined,
	tonal,
	transparent
}

enum ButtonIndicatorPosition {
	top = 'top',
	right = 'right',
	bottom = 'bottom',
	left = 'left'
}

type RawButtonProps<T extends ValidComponent = keyof JSX.HTMLElementTags> = DynamicProps<T> & {
	'c:variant'?: ButtonVariant
	'c:focused'?: boolean
	'c:selected'?: boolean
	'c:indicatorPosition'?: ButtonIndicatorPosition
}
const RawButton: ParentComponent<RawButtonProps> = ($props) => {
	const [props, other] = splitProps(mergeProps({
		'c:variant': ButtonVariant.transparent,
	}, $props), [
		'children', 'c:indicatorPosition', 'c:variant',
		'c:focused', 'c:selected', 'classList', 'class',
	])
	const variant = createMemo(() => props['c:variant'])

	return (<Dynamic
		class={attrClassList('c-btn', props.class ?? '')}
		classList={{
			'c-filled-btn': variant() == ButtonVariant.filled,
			'c-tonal-btn': variant() == ButtonVariant.tonal,
			'c-outlined-btn': variant() == ButtonVariant.outlined,
			...props.classList
		}}
		data-c-indicator={props['c:indicatorPosition']}
		data-c-selected={attrSetIfExist(props['c:selected'])}
		data-c-focused={attrSetIfExist(props['c:focused'])}
		{...other}>
		{props.children}
	</Dynamic>)
}

type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
	'c:variant'?: ButtonVariant
	'c:focused'?: boolean
	'c:selected'?: boolean
	'c:indicatorPosition'?: ButtonIndicatorPosition
}
const Button: ParentComponent<ButtonProps> = ($props) => {
	const $$props = mergeProps({
		type: 'button',
		'c:variant': ButtonVariant.transparent,
	}, $props)
	const [props, other] = splitProps($$props, [
		'children', 'c:indicatorPosition', 'c:variant',
		'c:focused', 'c:selected', 'classList', 'type',
		'class',
	])
	const variant = createMemo(() => props['c:variant'])

	return (<button
		class={attrClassList('c-btn', props.class ?? '')}
		classList={{
			'c-filled-btn': variant() == ButtonVariant.filled,
			'c-tonal-btn': variant() == ButtonVariant.tonal,
			'c-outlined-btn': variant() == ButtonVariant.outlined,
			...props.classList
		}}
		type={props.type as ("button" | "submit" | "reset" | undefined)}
		data-c-indicator={props['c:indicatorPosition']}
		data-c-selected={attrSetIfExist(props['c:selected'])}
		data-c-focused={attrSetIfExist(props['c:focused'])}
		{...other}>
		{props.children}
	</button>)
}

type LinkButtonProps = JSX.AnchorHTMLAttributes<HTMLAnchorElement> & {
	'c:variant'?: ButtonVariant
	'c:focused'?: boolean
	'c:disabled'?: boolean
	'c:newTab'?: boolean
	'c:selected'?: boolean
	'c:indicatorPosition'?: ButtonIndicatorPosition
}

const LinkButton: ParentComponent<LinkButtonProps> = ($props) => {
	const $$props = mergeProps({
		'c:variant': ButtonVariant.transparent,
	}, $props)
	const [props, other] = splitProps($$props, [
		'c:newTab', 'children', 'c:indicatorPosition',
		'c:variant', 'c:focused', 'c:selected',
		'classList', 'class', 'c:disabled',
		'onClick', 'target', 'rel'
	])
	const variant = createMemo(() => props['c:variant'])

	return (<a
		class={attrClassList('c-btn', props.class ?? '')}
		onClick={(ev) => {
			eventCall(ev, props.onClick)
			if (props['c:disabled']) {
				eventPreventDefault(ev)
			}
		}}
		classList={{
			'c-filled-btn': variant() == ButtonVariant.filled,
			'c-tonal-btn': variant() == ButtonVariant.tonal,
			'c-outlined-btn': variant() == ButtonVariant.outlined,
			...props.classList
		}}
		data-c-disabled={attrSetIfExist(props['c:disabled'])}
		data-c-indicator={props['c:indicatorPosition']}
		data-c-selected={attrSetIfExist(props['c:selected'])}
		data-c-focused={attrSetIfExist(props['c:focused'])}
		target={props['c:newTab']? "_blank" : props.target}
		rel={props['c:newTab']? "noopener noreferrer" : props.rel}
		{...other}>
		{props.children}
	</a>)
}

type RawSquareButtonProps = RawButtonProps
const RawSquareButton: ParentComponent<RawSquareButtonProps> = ($props) => {
	const [props, other] = splitProps($props, ['classList'])
	return (<RawButton
		classList={{'c-square-btn': true, ...props.classList}}
		{...other}
	/>)
}

type SquareButtonProps = ButtonProps
const SquareButton: ParentComponent<SquareButtonProps> = ($props) => {
	const [props, other] = splitProps($props, ['classList'])
	return (<Button
		classList={{'c-square-btn': true, ...props.classList}}
		{...other}
	/>)
}

type LinkSquareButtonProps = LinkButtonProps
const LinkSquareButton: ParentComponent<LinkSquareButtonProps> = ($props) => {
	const [props, other] = splitProps($props, ['classList'])
	return (<LinkButton
		classList={{'c-square-btn': true, ...props.classList}}
		{...other}
	/>)
}

type RawIconButtonProps = RawSquareButtonProps & {
	'c:code': number
	'c:filled'?: boolean
}
const RawIconButton: VoidComponent<RawIconButtonProps> = ($props) => {
	const [props, other] = splitProps($props, ['classList', 'c:code', 'c:filled'])
	return (<RawSquareButton
		classList={{'c-icon-btn': true, ...props.classList}}
		{...other}>
		<Icon c:code={props['c:code']} c:filled={props['c:filled']}/>
	</RawSquareButton>)
}

type IconButtonProps = SquareButtonProps & {
	'c:code': number
	'c:filled'?: boolean
	'c:attrIcon'?: Omit<IconProps, 'c:code'> & {
		'c:code'?: number
	}
}
const IconButton: VoidComponent<IconButtonProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'classList', 'c:code', 'c:filled',
		'c:attrIcon'
	])
	const [icon_props, icon_props_other] = splitProps(props['c:attrIcon']! ?? {}, [
		'c:code', 'c:filled'
	])
	return (<SquareButton
		classList={{'c-icon-btn': true, ...props.classList}}
		{...other}>
		<Icon
			c:code={icon_props['c:code'] ?? props['c:code']}
			c:filled={icon_props['c:filled'] ?? props['c:filled']}
			{...icon_props_other}
		/>
	</SquareButton>)
}

type LinkIconButtonProps = LinkSquareButtonProps & {
	'c:code': number
	'c:filled'?: boolean
	'c:attrIcon'?: Omit<IconProps, 'c:code'> & {
		'c:code'?: number
	}
}
const LinkIconButton: VoidComponent<LinkIconButtonProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'classList', 'c:code', 'c:filled',
		'c:attrIcon'
	])
	const [icon_props, icon_props_other] = splitProps(props['c:attrIcon']! ?? {}, [
		'c:code', 'c:filled'
	])
	return (<LinkSquareButton
		classList={{'c-icon-btn': true, ...props.classList}}
		{...other}>
		<Icon
			c:code={icon_props['c:code'] ?? props['c:code']}
			c:filled={icon_props['c:filled'] ?? props['c:filled']}
			{...icon_props_other}
		/>
	</LinkSquareButton>)
}

type RawEmojiButtonProps = RawSquareButtonProps & {
	'c:emoji': string
}
const RawEmojiButton: VoidComponent<RawEmojiButtonProps> = ($props) => {
	const [props, other] = splitProps($props, ['classList', 'c:emoji'])
	return (<RawSquareButton
		classList={{'c-emoji-btn': true, ...props.classList}}
		{...other}>
		<Emoji c:emoji={props['c:emoji']}/>
	</RawSquareButton>)
}

type EmojiButtonProps = SquareButtonProps & {
	'c:emoji': string
}
const EmojiButton: VoidComponent<EmojiButtonProps> = ($props) => {
	const [props, other] = splitProps($props, ['classList', 'c:emoji'])
	return (<SquareButton
		classList={{'c-emoji-btn': true, ...props.classList}}
		{...other}>
		<Emoji c:emoji={props['c:emoji']}/>
	</SquareButton>)
}

type LinkEmojiButtonProps = LinkSquareButtonProps & {
	'c:emoji': string
}
const LinkEmojiButton: VoidComponent<LinkEmojiButtonProps> = ($props) => {
	const [props, other] = splitProps($props, ['classList', 'c:emoji'])
	return (<LinkSquareButton
		classList={{'c-emoji-btn': true, ...props.classList}}
		{...other}>
		<Emoji c:emoji={props['c:emoji']}/>
	</LinkSquareButton>)
}

type RawFloatingActionButtonProps = RawButtonProps
const RawFloatingActionButton: ParentComponent<RawFloatingActionButtonProps> = ($props) => {
	const [props, other] = splitProps($props, ['classList'])
	return (<RawButton
		classList={{'c-floating-action-btn': true, ...props.classList}}
		{...other}
	/>)
}

type FloatingActionButtonProps = ButtonProps
const FloatingActionButton: ParentComponent<FloatingActionButtonProps> = ($props) => {
	const [props, other] = splitProps($props, ['classList'])
	return (<Button
		classList={{'c-floating-action-btn': true, ...props.classList}}
		{...other}
	/>)
}

type LinkFloatingActionActionButtonProps = LinkButtonProps
const LinkFloatingActionButton: ParentComponent<LinkFloatingActionActionButtonProps> = ($props) => {
	const [props, other] = splitProps($props, ['classList'])
	return (<LinkButton
		classList={{'c-floating-action-btn': true, ...props.classList}}
		{...other}
	/>)
}

export {
	Button,
	RawButton,
	LinkButton,
	IconButton,
	RawIconButton,
	LinkIconButton,
	FloatingActionButton,
	RawFloatingActionButton,
	LinkFloatingActionButton,
	SquareButton,
	RawSquareButton,
	LinkSquareButton,
	EmojiButton,
	RawEmojiButton,
	LinkEmojiButton,
	ButtonVariant,
	ButtonIndicatorPosition
}
export type {
	ButtonProps,
	RawButtonProps,
	LinkButtonProps,
	IconButtonProps,
	RawIconButtonProps,
	LinkIconButtonProps,
	FloatingActionButtonProps,
	RawFloatingActionButtonProps,
	LinkFloatingActionActionButtonProps,
	SquareButtonProps,
	RawSquareButtonProps,
	LinkSquareButtonProps,
	EmojiButtonProps,
	RawEmojiButtonProps,
	LinkEmojiButtonProps,
}
export default Button