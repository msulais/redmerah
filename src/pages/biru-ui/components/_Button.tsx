import { type VoidComponent, createSignal, Show } from "solid-js"

import { _transparent, _bottom, _filled, _tonal, _outlined, _top, _right, _left, _checked, _currentTarget } from "@/constants/string"

import { TextTooltip } from "@/components/Tooltip"
import Icon from "@/components/Icon"
import Button, { ButtonIndicatorPosition, ButtonVariant, EmojiButton, FloatingActionButton, IconButton, LinkButton, LinkEmojiButton, LinkFloatingActionButton, LinkIconButton } from "@/components/Button"
import CheckBox from "@/components/CheckBox"
import Dropdown from "@/components/Dropdown"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
	const [variant, setVariant] = createSignal<ButtonVariant>(ButtonVariant[_transparent])
	const [disabled, setDisabled] = createSignal<boolean>(false)
	const [focused, setFocused] = createSignal<boolean>(false)
	const [selected, setSelected] = createSignal<boolean>(false)
	const [icon, setIcon] = createSignal<boolean>(false)
	const [compact, setCompact] = createSignal<boolean>(false)
	const [indicatorPosition, setIndicatorPosition] = createSignal<ButtonIndicatorPosition>(ButtonIndicatorPosition[_bottom])
	return (<Page
		title="Buttons"
		description="A button is an interactive UI element that triggers a specific action when clicked or tapped. It typically has a clear label indicating its function and provides visual feedback upon interaction. Buttons are essential for guiding users through an interface and facilitating user-system communication.">
		<Playground>
			<TextTooltip text="Button">
				<Button
					disabled={disabled()}
					variant={variant()}
					compact={compact()}
					focused={focused()}
					selected={selected()}
					indicatorPosition={indicatorPosition()}>
					<Show when={icon()}>
						<Icon code={0xE54B}/>
					</Show>
					Button
				</Button>
			</TextTooltip>

			<TextTooltip text="IconButton">
				<IconButton
					disabled={disabled()}
					variant={variant()}
					compact={compact()}
					focused={focused()}
					selected={selected()}
					indicatorPosition={indicatorPosition()}
					code={0xE54B}
				/>
			</TextTooltip>

			<TextTooltip text="EmojiButton">
				<EmojiButton
					disabled={disabled()}
					variant={variant()}
					compact={compact()}
					focused={focused()}
					selected={selected()}
					indicatorPosition={indicatorPosition()}
					emoji={'🏛'}
				/>
			</TextTooltip>

			<TextTooltip text="LinkButton">
				<LinkButton
					href="#"
					disabled={disabled()}
					variant={variant()}
					compact={compact()}
					focused={focused()}
					selected={selected()}
					indicatorPosition={indicatorPosition()}>
					<Show when={icon()}>
						<Icon code={0xE54B}/>
					</Show>
					LinkButton
				</LinkButton>
			</TextTooltip>

			<TextTooltip text="LinkIconButton">
				<LinkIconButton
					href="#"
					disabled={disabled()}
					variant={variant()}
					compact={compact()}
					focused={focused()}
					selected={selected()}
					indicatorPosition={indicatorPosition()}
					code={0xE54B}
				/>
			</TextTooltip>

			<TextTooltip text="LinkEmojiButton">
				<LinkEmojiButton
					href="#"
					disabled={disabled()}
					variant={variant()}
					compact={compact()}
					focused={focused()}
					selected={selected()}
					indicatorPosition={indicatorPosition()}
					emoji={'😁'}
				/>
			</TextTooltip>

			<TextTooltip text="FloatingActionButton">
				<FloatingActionButton
					disabled={disabled()}
					variant={variant()}
					compact={compact()}
					focused={focused()}
					selected={selected()}
					indicatorPosition={indicatorPosition()}>
					<Show when={icon()}>
						<Icon code={0xE54B}/>
					</Show>
					FloatingActionButton
				</FloatingActionButton>
			</TextTooltip>

			<TextTooltip text="LinkFloatingActionButton">
				<LinkFloatingActionButton
					href={'#'}
					disabled={disabled()}
					variant={variant()}
					compact={compact()}
					focused={focused()}
					selected={selected()}
					indicatorPosition={indicatorPosition()}>
					<Show when={icon()}>
						<Icon code={0xE54B}/>
					</Show>
					LinkFloatingActionButton
				</LinkFloatingActionButton>
			</TextTooltip>
		</Playground>
		<PlaygroundOptions>
			<Dropdown
				labelText="Variant"
				style={{width: '100px'}}
				items={[
					[ButtonVariant[_filled], 'Filled'],
					[ButtonVariant[_tonal], 'Tonal'],
					[ButtonVariant[_outlined], 'Outlined'],
					[ButtonVariant[_transparent], 'Transparent'],
				]}
				onSelectedItemsChanged={(items) => setVariant(items[0][0] as ButtonVariant)}
				selectedValues={[variant()]}
			/>
			<Show when={selected()}>
				<Dropdown
					labelText="Indicator position"
					style={{width: '100px'}}
					items={[
						[ButtonIndicatorPosition[_top], 'Top'],
						[ButtonIndicatorPosition[_right], 'Right'],
						[ButtonIndicatorPosition[_bottom], 'Bottom'],
						[ButtonIndicatorPosition[_left], 'Left'],
					]}
					onSelectedItemsChanged={(items) => setIndicatorPosition(items[0][0] as ButtonIndicatorPosition)}
					selectedValues={[indicatorPosition()]}
				/>
			</Show>
			<CheckBox
				checked={disabled()}
				onChange={ev => setDisabled(ev[_currentTarget][_checked])}>
				Disabled
			</CheckBox>
			<CheckBox
				checked={focused()}
				onChange={ev => setFocused(ev[_currentTarget][_checked])}>
				Focused
			</CheckBox>
			<CheckBox
				checked={selected()}
				onChange={ev => setSelected(ev[_currentTarget][_checked])}>
				Selected
			</CheckBox>
			<CheckBox
				checked={icon()}
				onChange={ev => setIcon(ev[_currentTarget][_checked])}>
				Show icon
			</CheckBox>
			<CheckBox
				checked={compact()}
				onChange={ev => setCompact(ev[_currentTarget][_checked])}>
				Compact
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _