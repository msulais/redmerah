import { type ParentComponent, type JSX, mergeProps, splitProps, type VoidComponent, type ValidComponent, createMemo } from 'solid-js'
import { Dynamic, type DynamicProps } from 'solid-js/web'

import { classlist, attr_set_if_exist } from '@/utils/attributes'
import { event_call, event_prevent_default } from '@/utils/event'

import Icon, { type IconProps } from '@/components/Icon'
import Emoji from '@/components/Emoji'
import './index.scss'

const enum ButtonVariant {
	filled,
	outlined,
	tonal,
	transparent
}

const enum ButtonIndicatorPosition {
	top = 'top',
	right = 'right',
	bottom = 'bottom',
	left = 'left'
}

type RawButtonProps<T extends ValidComponent = keyof JSX.HTMLElementTags> = DynamicProps<T> & {
	variant?: ButtonVariant
	focused?: boolean
	selected?: boolean
	indicator_position?: ButtonIndicatorPosition
}
const RawButton: ParentComponent<RawButtonProps> = ($props) => {
	const [props, other] = splitProps(mergeProps({
		variant: ButtonVariant.transparent,
	}, $props), [
		'children', 'indicator_position', 'variant',
		'focused', 'selected', 'classList', 'class',
	])
	const variant = createMemo(() => props.variant)

	return (<Dynamic
		class={classlist('c-btn', props.class ?? '')}
		classList={{
			'c-filled-btn': variant() == ButtonVariant.filled,
			'c-tonal-btn': variant() == ButtonVariant.tonal,
			'c-outlined-btn': variant() == ButtonVariant.outlined,
			...props.classList
		}}
		data-c-indicator={props.indicator_position}
		data-c-selected={attr_set_if_exist(props.selected)}
		data-c-focused={attr_set_if_exist(props.focused)}
		{...other}>
		{props.children}
	</Dynamic>)
}

type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: ButtonVariant
	focused?: boolean
	selected?: boolean
	indicator_position?: ButtonIndicatorPosition
}
const Button: ParentComponent<ButtonProps> = ($props) => {
	const $$props = mergeProps({
		type: 'button',
		variant: ButtonVariant.transparent,
	}, $props)
	const [props, other] = splitProps($$props, [
		'children', 'indicator_position', 'variant',
		'focused', 'selected', 'classList', 'type',
		'class',
	])
	const variant = createMemo(() => props.variant)

	return (<button
		class={classlist('c-btn', props.class ?? '')}
		classList={{
			'c-filled-btn': variant() == ButtonVariant.filled,
			'c-tonal-btn': variant() == ButtonVariant.tonal,
			'c-outlined-btn': variant() == ButtonVariant.outlined,
			...props.classList
		}}
		type={props.type as ("button" | "submit" | "reset" | undefined)}
		data-c-indicator={props.indicator_position}
		data-c-selected={attr_set_if_exist(props.selected)}
		data-c-focused={attr_set_if_exist(props.focused)}
		{...other}>
		{props.children}
	</button>)
}

type LinkButtonProps = JSX.AnchorHTMLAttributes<HTMLAnchorElement> & {
	variant?: ButtonVariant
	focused?: boolean
	disabled?: boolean
	open_in_new_tab?: boolean
	selected?: boolean
	indicator_position?: ButtonIndicatorPosition
}

const LinkButton: ParentComponent<LinkButtonProps> = ($props) => {
	const $$props = mergeProps({
		variant: ButtonVariant.transparent,
	}, $props)
	const [props, other] = splitProps($$props, [
		'open_in_new_tab', 'children', 'indicator_position',
		'variant', 'focused', 'selected',
		'classList', 'class', 'disabled',
		'onClick'
	])
	const variant = createMemo(() => props.variant)

	return (<a
		class={classlist('c-btn', props.class ?? '')}
		onClick={(ev) => {
			if (props.disabled) {
				event_prevent_default(ev)
			}
			event_call(ev, props.onClick)
		}}
		classList={{
			'c-filled-btn': variant() == ButtonVariant.filled,
			'c-tonal-btn': variant() == ButtonVariant.tonal,
			'c-outlined-btn': variant() == ButtonVariant.outlined,
			...props.classList
		}}
		data-c-disabled={attr_set_if_exist(props.disabled)}
		data-c-indicator={props.indicator_position}
		data-c-selected={attr_set_if_exist(props.selected)}
		data-c-focused={attr_set_if_exist(props.focused)}
		target={props.open_in_new_tab? "_blank" : undefined}
		rel={props.open_in_new_tab? "noopener noreferrer" : undefined}
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
	code: number
	filled?: boolean
}
const RawIconButton: VoidComponent<RawIconButtonProps> = ($props) => {
	const [props, other] = splitProps($props, ['classList', 'code', 'filled'])
	return (<RawSquareButton
		classList={{'c-icon-btn': true, ...props.classList}}
		{...other}>
		<Icon code={props.code} filled={props.filled}/>
	</RawSquareButton>)
}

type IconButtonProps = SquareButtonProps & {
	code: number
	filled?: boolean
	attr_icon?: Omit<IconProps, 'code'> & {
		code?: number
	}
}
const IconButton: VoidComponent<IconButtonProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'classList', 'code', 'filled',
		'attr_icon'
	])
	const [icon_props, icon_props_other] = splitProps(props.attr_icon! ?? {}, [
		'code', 'filled'
	])
	return (<SquareButton
		classList={{'c-icon-btn': true, ...props.classList}}
		{...other}>
		<Icon
			code={icon_props.code ?? props.code}
			filled={icon_props.filled ?? props.filled}
			{...icon_props_other}
		/>
	</SquareButton>)
}

type LinkIconButtonProps = LinkSquareButtonProps & {
	code: number
	filled?: boolean
	attr_icon?: Omit<IconProps, 'code'> & {
		code?: number
	}
}
const LinkIconButton: VoidComponent<LinkIconButtonProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'classList', 'code', 'filled',
		'attr_icon'
	])
	const [icon_props, icon_props_other] = splitProps(props.attr_icon! ?? {}, [
		'code', 'filled'
	])
	return (<LinkSquareButton
		classList={{'c-icon-btn': true, ...props.classList}}
		{...other}>
		<Icon
			code={icon_props.code ?? props.code}
			filled={icon_props.filled ?? props.filled}
			{...icon_props_other}
		/>
	</LinkSquareButton>)
}

type RawEmojiButtonProps = RawSquareButtonProps & {
	emoji: string
}
const RawEmojiButton: VoidComponent<RawEmojiButtonProps> = ($props) => {
	const [props, other] = splitProps($props, ['classList', 'emoji'])
	return (<RawSquareButton
		classList={{'c-emoji-btn': true, ...props.classList}}
		{...other}>
		<Emoji emoji={props.emoji}/>
	</RawSquareButton>)
}

type EmojiButtonProps = SquareButtonProps & {
	emoji: string
}
const EmojiButton: VoidComponent<EmojiButtonProps> = ($props) => {
	const [props, other] = splitProps($props, ['classList', 'emoji'])
	return (<SquareButton
		classList={{'c-emoji-btn': true, ...props.classList}}
		{...other}>
		<Emoji emoji={props.emoji}/>
	</SquareButton>)
}

type LinkEmojiButtonProps = LinkSquareButtonProps & {
	emoji: string
}
const LinkEmojiButton: VoidComponent<LinkEmojiButtonProps> = ($props) => {
	const [props, other] = splitProps($props, ['classList', 'emoji'])
	return (<LinkSquareButton
		classList={{'c-emoji-btn': true, ...props.classList}}
		{...other}>
		<Emoji emoji={props.emoji}/>
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