import { type ParentComponent, type JSX, mergeProps, splitProps, type VoidComponent, type ValidComponent, createMemo } from 'solid-js'
import { Dynamic, type DynamicProps } from 'solid-js/web'

import { classlist, attr_set_if_exist } from '@/utils/attributes'
import { event_call, event_prevent_default } from '@/utils/event'

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
	c_variant?: ButtonVariant
	c_focused?: boolean
	c_selected?: boolean
	c_indicator_position?: ButtonIndicatorPosition
}
const RawButton: ParentComponent<RawButtonProps> = ($props) => {
	const [props, other] = splitProps(mergeProps({
		c_variant: ButtonVariant.transparent,
	}, $props), [
		'children', 'c_indicator_position', 'c_variant',
		'c_focused', 'c_selected', 'classList', 'class',
	])
	const variant = createMemo(() => props.c_variant)

	return (<Dynamic
		class={classlist('c-btn', props.class ?? '')}
		classList={{
			'c-filled-btn': variant() == ButtonVariant.filled,
			'c-tonal-btn': variant() == ButtonVariant.tonal,
			'c-outlined-btn': variant() == ButtonVariant.outlined,
			...props.classList
		}}
		data-c-indicator={props.c_indicator_position}
		data-c-selected={attr_set_if_exist(props.c_selected)}
		data-c-focused={attr_set_if_exist(props.c_focused)}
		{...other}>
		{props.children}
	</Dynamic>)
}

type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
	c_variant?: ButtonVariant
	c_focused?: boolean
	c_selected?: boolean
	c_indicator_position?: ButtonIndicatorPosition
}
const Button: ParentComponent<ButtonProps> = ($props) => {
	const $$props = mergeProps({
		type: 'button',
		c_variant: ButtonVariant.transparent,
	}, $props)
	const [props, other] = splitProps($$props, [
		'children', 'c_indicator_position', 'c_variant',
		'c_focused', 'c_selected', 'classList', 'type',
		'class',
	])
	const variant = createMemo(() => props.c_variant)

	return (<button
		class={classlist('c-btn', props.class ?? '')}
		classList={{
			'c-filled-btn': variant() == ButtonVariant.filled,
			'c-tonal-btn': variant() == ButtonVariant.tonal,
			'c-outlined-btn': variant() == ButtonVariant.outlined,
			...props.classList
		}}
		type={props.type as ("button" | "submit" | "reset" | undefined)}
		data-c-indicator={props.c_indicator_position}
		data-c-selected={attr_set_if_exist(props.c_selected)}
		data-c-focused={attr_set_if_exist(props.c_focused)}
		{...other}>
		{props.children}
	</button>)
}

type LinkButtonProps = JSX.AnchorHTMLAttributes<HTMLAnchorElement> & {
	c_variant?: ButtonVariant
	c_focused?: boolean
	c_disabled?: boolean
	c_new_tab?: boolean
	c_selected?: boolean
	c_indicator_position?: ButtonIndicatorPosition
}

const LinkButton: ParentComponent<LinkButtonProps> = ($props) => {
	const $$props = mergeProps({
		c_variant: ButtonVariant.transparent,
	}, $props)
	const [props, other] = splitProps($$props, [
		'c_new_tab', 'children', 'c_indicator_position',
		'c_variant', 'c_focused', 'c_selected',
		'classList', 'class', 'c_disabled',
		'onClick'
	])
	const variant = createMemo(() => props.c_variant)

	return (<a
		class={classlist('c-btn', props.class ?? '')}
		onClick={(ev) => {
			event_call(ev, props.onClick)
			if (props.c_disabled) {
				event_prevent_default(ev)
			}
		}}
		classList={{
			'c-filled-btn': variant() == ButtonVariant.filled,
			'c-tonal-btn': variant() == ButtonVariant.tonal,
			'c-outlined-btn': variant() == ButtonVariant.outlined,
			...props.classList
		}}
		data-c-disabled={attr_set_if_exist(props.c_disabled)}
		data-c-indicator={props.c_indicator_position}
		data-c-selected={attr_set_if_exist(props.c_selected)}
		data-c-focused={attr_set_if_exist(props.c_focused)}
		target={props.c_new_tab? "_blank" : undefined}
		rel={props.c_new_tab? "noopener noreferrer" : undefined}
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
	c_code: number
	c_filled?: boolean
}
const RawIconButton: VoidComponent<RawIconButtonProps> = ($props) => {
	const [props, other] = splitProps($props, ['classList', 'c_code', 'c_filled'])
	return (<RawSquareButton
		classList={{'c-icon-btn': true, ...props.classList}}
		{...other}>
		<Icon c_code={props.c_code} c_filled={props.c_filled}/>
	</RawSquareButton>)
}

type IconButtonProps = SquareButtonProps & {
	c_code: number
	c_filled?: boolean
	c_attr_icon?: Omit<IconProps, 'c_code'> & {
		c_code?: number
	}
}
const IconButton: VoidComponent<IconButtonProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'classList', 'c_code', 'c_filled',
		'c_attr_icon'
	])
	const [icon_props, icon_props_other] = splitProps(props.c_attr_icon! ?? {}, [
		'c_code', 'c_filled'
	])
	return (<SquareButton
		classList={{'c-icon-btn': true, ...props.classList}}
		{...other}>
		<Icon
			c_code={icon_props.c_code ?? props.c_code}
			c_filled={icon_props.c_filled ?? props.c_filled}
			{...icon_props_other}
		/>
	</SquareButton>)
}

type LinkIconButtonProps = LinkSquareButtonProps & {
	c_code: number
	c_filled?: boolean
	c_attr_icon?: Omit<IconProps, 'c_code'> & {
		c_code?: number
	}
}
const LinkIconButton: VoidComponent<LinkIconButtonProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'classList', 'c_code', 'c_filled',
		'c_attr_icon'
	])
	const [icon_props, icon_props_other] = splitProps(props.c_attr_icon! ?? {}, [
		'c_code', 'c_filled'
	])
	return (<LinkSquareButton
		classList={{'c-icon-btn': true, ...props.classList}}
		{...other}>
		<Icon
			c_code={icon_props.c_code ?? props.c_code}
			c_filled={icon_props.c_filled ?? props.c_filled}
			{...icon_props_other}
		/>
	</LinkSquareButton>)
}

type RawEmojiButtonProps = RawSquareButtonProps & {
	c_emoji: string
}
const RawEmojiButton: VoidComponent<RawEmojiButtonProps> = ($props) => {
	const [props, other] = splitProps($props, ['classList', 'c_emoji'])
	return (<RawSquareButton
		classList={{'c-emoji-btn': true, ...props.classList}}
		{...other}>
		<Emoji c_emoji={props.c_emoji}/>
	</RawSquareButton>)
}

type EmojiButtonProps = SquareButtonProps & {
	c_emoji: string
}
const EmojiButton: VoidComponent<EmojiButtonProps> = ($props) => {
	const [props, other] = splitProps($props, ['classList', 'c_emoji'])
	return (<SquareButton
		classList={{'c-emoji-btn': true, ...props.classList}}
		{...other}>
		<Emoji c_emoji={props.c_emoji}/>
	</SquareButton>)
}

type LinkEmojiButtonProps = LinkSquareButtonProps & {
	c_emoji: string
}
const LinkEmojiButton: VoidComponent<LinkEmojiButtonProps> = ($props) => {
	const [props, other] = splitProps($props, ['classList', 'c_emoji'])
	return (<LinkSquareButton
		classList={{'c-emoji-btn': true, ...props.classList}}
		{...other}>
		<Emoji c_emoji={props.c_emoji}/>
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