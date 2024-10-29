import { type ParentComponent, type JSX, mergeProps, splitProps, type VoidComponent, type ValidComponent } from 'solid-js'
import { Dynamic, type DynamicProps } from 'solid-js/web'

import { _button, _transparent, _bottom, _children, _indicatorPosition, _variant, _focused, _compact, _selected, _layerAttr, _classList, _type, _class, _desktopCompact, _filled, _filledTonal, _outlined, _openInNewTab, _disabled, _onClick, _code, _tonal, _emoji } from '@/constants/string'
import { setElementAttributeIfExist } from '@/utils/attributes'
import { callEventHandler, eventPreventDefault } from '@/utils/event'

import Icon from '@/components/Icon'
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
	variant?: ButtonVariant
	focused?: boolean
	compact?: boolean
	selected?: boolean
	indicatorPosition?: ButtonIndicatorPosition
}
const RawButton: ParentComponent<RawButtonProps> = ($props) => {
	const [props, other] = splitProps(mergeProps({
		variant: ButtonVariant[_transparent],
		indicatorPosition: ButtonIndicatorPosition[_bottom]
	}, $props), [
		_children, _indicatorPosition, _variant,
		_focused, _compact, _selected,
		_classList,  _class,
	])

	return (<Dynamic
		class={`c-btn${props[_class]? ` ${props[_class]}` : ''}`}
		classList={{
			'c-filled-btn': props[_variant] == ButtonVariant[_filled],
			'c-tonal-btn': props[_variant] == ButtonVariant[_tonal],
			'c-outlined-btn': props[_variant] == ButtonVariant[_outlined],
			...props[_classList]
		}}
		data-c-indicator={props[_selected]? props[_indicatorPosition] : undefined}
		data-c-selected={setElementAttributeIfExist(props[_selected])}
		data-c-focused={setElementAttributeIfExist(props[_focused])}
		data-c-compact={setElementAttributeIfExist(props[_compact])}
		{...other}>
		{props[_children]}
	</Dynamic>)
}

type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: ButtonVariant
	focused?: boolean
	compact?: boolean
	selected?: boolean
	indicatorPosition?: ButtonIndicatorPosition
}
const Button: ParentComponent<ButtonProps> = ($props) => {
	const $$props = mergeProps({
		type: _button,
		variant: ButtonVariant[_transparent],
		indicatorPosition: ButtonIndicatorPosition[_bottom]
	}, $props)
	const [props, other] = splitProps($$props, [
		_children, _indicatorPosition, _variant,
		_focused, _compact, _selected,
		_classList, _type, _class,
	])

	return (<button
		class={`c-btn${props[_class]? ` ${props[_class]}` : ''}`}
		classList={{
			'c-filled-btn': props[_variant] == ButtonVariant[_filled],
			'c-tonal-btn': props[_variant] == ButtonVariant[_tonal],
			'c-outlined-btn': props[_variant] == ButtonVariant[_outlined],
			...props[_classList]
		}}
		type={props[_type] as ("button" | "submit" | "reset" | undefined)}
		data-c-indicator={props[_selected]? props[_indicatorPosition] : undefined}
		data-c-selected={setElementAttributeIfExist(props[_selected])}
		data-c-focused={setElementAttributeIfExist(props[_focused])}
		data-c-compact={setElementAttributeIfExist(props[_compact])}
		{...other}>
		{props[_children]}
	</button>)
}

type LinkButtonProps = JSX.AnchorHTMLAttributes<HTMLAnchorElement> & {
	variant?: ButtonVariant
	focused?: boolean
	compact?: boolean
	disabled?: boolean
	openInNewTab?: boolean
	selected?: boolean
	indicatorPosition?: ButtonIndicatorPosition
}

const LinkButton: ParentComponent<LinkButtonProps> = ($props) => {
	const $$props = mergeProps({
		variant: ButtonVariant[_transparent],
		indicatorPosition: ButtonIndicatorPosition[_bottom]
	}, $props)
	const [props, other] = splitProps($$props, [
		_openInNewTab, _children, _indicatorPosition,
		_variant, _focused, _compact, _selected,
		_classList, _class, _disabled,
		_onClick
	])

	return (<a
		class={`c-btn${props[_class]? ` ${props[_class]}` : ''}`}
		onClick={(ev) => {
			if (props[_disabled]) {
				eventPreventDefault(ev)
			}
			callEventHandler(ev, props[_onClick])
		}}
		classList={{
			'c-filled-btn': props[_variant] == ButtonVariant[_filled],
			'c-tonal-btn': props[_variant] == ButtonVariant[_tonal],
			'c-outlined-btn': props[_variant] == ButtonVariant[_outlined],
			...props[_classList]
		}}
		data-c-indicator={props[_selected]? props[_indicatorPosition] : undefined}
		data-c-disabled={setElementAttributeIfExist(props[_disabled])}
		data-c-selected={setElementAttributeIfExist(props[_selected])}
		data-c-focused={setElementAttributeIfExist(props[_focused])}
		data-c-compact={setElementAttributeIfExist(props[_compact])}
		target={props[_openInNewTab]? "_blank" : undefined}
		rel={props[_openInNewTab]? "noopener noreferrer" : undefined}
		{...other}>
		{props[_children]}
	</a>)
}

type RawSquareButtonProps = RawButtonProps
const RawSquareButton: ParentComponent<RawSquareButtonProps> = ($props) => {
	const [props, other] = splitProps($props, [_classList])
	return (<RawButton
		classList={{'c-square-btn': true, ...props[_classList]}}
		{...other}
	/>)
}

type SquareButtonProps = ButtonProps
const SquareButton: ParentComponent<SquareButtonProps> = ($props) => {
	const [props, other] = splitProps($props, [_classList])
	return (<Button
		classList={{'c-square-btn': true, ...props[_classList]}}
		{...other}
	/>)
}

type LinkSquareButtonProps = LinkButtonProps
const LinkSquareButton: ParentComponent<LinkSquareButtonProps> = ($props) => {
	const [props, other] = splitProps($props, [_classList])
	return (<LinkButton
		classList={{'c-square-btn': true, ...props[_classList]}}
		{...other}
	/>)
}

type RawIconButtonProps = RawSquareButtonProps & {
	code: number
	filled?: boolean
}
const RawIconButton: VoidComponent<RawIconButtonProps> = ($props) => {
	const [props, other] = splitProps($props, [_classList, _code, _filled])
	return (<RawSquareButton
		classList={{'c-icon-btn': true, ...props[_classList]}}
		{...other}>
		<Icon code={props[_code]} filled={props[_filled]}/>
	</RawSquareButton>)
}

type IconButtonProps = SquareButtonProps & {
	code: number
	filled?: boolean
}
const IconButton: VoidComponent<IconButtonProps> = ($props) => {
	const [props, other] = splitProps($props, [_classList, _code, _filled])
	return (<SquareButton
		classList={{'c-icon-btn': true, ...props[_classList]}}
		{...other}>
		<Icon code={props[_code]} filled={props[_filled]}/>
	</SquareButton>)
}

type LinkIconButtonProps = LinkSquareButtonProps & {
	code: number
	filled?: boolean
}
const LinkIconButton: VoidComponent<LinkIconButtonProps> = ($props) => {
	const [props, other] = splitProps($props, [_classList, _code, _filled])
	return (<LinkSquareButton
		classList={{'c-icon-btn': true, ...props[_classList]}}
		{...other}>
		<Icon code={props[_code]} filled={props[_filled]}/>
	</LinkSquareButton>)
}

type RawEmojiButtonProps = RawSquareButtonProps & {
	emoji: string
}
const RawEmojiButton: VoidComponent<RawEmojiButtonProps> = ($props) => {
	const [props, other] = splitProps($props, [_classList, _emoji])
	return (<RawSquareButton
		classList={{'c-emoji-btn': true, ...props[_classList]}}
		{...other}>
		<Emoji emoji={props[_emoji]}/>
	</RawSquareButton>)
}

type EmojiButtonProps = SquareButtonProps & {
	emoji: string
}
const EmojiButton: VoidComponent<EmojiButtonProps> = ($props) => {
	const [props, other] = splitProps($props, [_classList, _emoji])
	return (<SquareButton
		classList={{'c-emoji-btn': true, ...props[_classList]}}
		{...other}>
		<Emoji emoji={props[_emoji]}/>
	</SquareButton>)
}

type LinkEmojiButtonProps = LinkSquareButtonProps & {
	emoji: string
}
const LinkEmojiButton: VoidComponent<LinkEmojiButtonProps> = ($props) => {
	const [props, other] = splitProps($props, [_classList, _emoji])
	return (<LinkSquareButton
		classList={{'c-emoji-btn': true, ...props[_classList]}}
		{...other}>
		<Emoji emoji={props[_emoji]}/>
	</LinkSquareButton>)
}

type RawFloatingActionButtonProps = RawButtonProps
const RawFloatingActionButton: ParentComponent<RawFloatingActionButtonProps> = ($props) => {
	const [props, other] = splitProps($props, [_classList])
	return (<RawButton
		classList={{'c-floating-action-btn': true, ...props[_classList]}}
		{...other}
	/>)
}

type FloatingActionButtonProps = ButtonProps
const FloatingActionButton: ParentComponent<FloatingActionButtonProps> = ($props) => {
	const [props, other] = splitProps($props, [_classList])
	return (<Button
		classList={{'c-floating-action-btn': true, ...props[_classList]}}
		{...other}
	/>)
}

type LinkFloatingActionActionButtonProps = LinkButtonProps
const LinkFloatingActionButton: ParentComponent<LinkFloatingActionActionButtonProps> = ($props) => {
	const [props, other] = splitProps($props, [_classList])
	return (<LinkButton
		classList={{'c-floating-action-btn': true, ...props[_classList]}}
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