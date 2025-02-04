import { type VoidComponent, createSignal, For, Show } from "solid-js"

import { Tooltip } from "@/components/Tooltip"
import Icon from "@/components/Icon"
import Button, { ButtonIndicatorPosition, ButtonVariant, EmojiButton, FloatingActionButton, IconButton, LinkButton, LinkEmojiButton, LinkFloatingActionButton, LinkIconButton } from "@/components/Button"
import CheckBox from "@/components/CheckBox"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import { Page, Playground, PlaygroundOptions } from "../_Body"
import { event_current_target } from "@/utils/event"
import { ICON_CURSOR_CLICK } from "@/constants/icons"

const _: VoidComponent = () => {
	const [variant, set_variant] = createSignal<ButtonVariant>(ButtonVariant.transparent)
	const [disabled, set_disabled] = createSignal<boolean>(false)
	const [focused, set_focused] = createSignal<boolean>(false)
	const [selected, set_selected] = createSignal<boolean>(false)
	const [icon, set_icon] = createSignal<boolean>(false)
	const [indicator_position, set_indicator_position] = createSignal<ButtonIndicatorPosition>(ButtonIndicatorPosition.bottom)
	return (<Page
		title="Buttons"
		description="A button is an interactive UI element that triggers a specific action when clicked or tapped. It typically has a clear label indicating its function and provides visual feedback upon interaction. Buttons are essential for guiding users through an interface and facilitating user-system communication.">
		<Playground>
			<Tooltip>
				<Button
					data-tooltip="Button"
					disabled={disabled()}
					c_variant={variant()}
					c_focused={focused()}
					c_selected={selected()}
					c_indicator_position={indicator_position()}>
					<Show when={icon()}>
						<Icon c_code={ICON_CURSOR_CLICK}/>
					</Show>
					Button
				</Button>

				<IconButton
					data-tooltip="IconButton"
					disabled={disabled()}
					c_variant={variant()}
					c_focused={focused()}
					c_selected={selected()}
					c_indicator_position={indicator_position()}
					c_code={ICON_CURSOR_CLICK}
				/>

				<EmojiButton
					data-tooltip="EmojiButton"
					disabled={disabled()}
					c_variant={variant()}
					c_focused={focused()}
					c_selected={selected()}
					c_indicator_position={indicator_position()}
					c_emoji={'🏛'}
				/>

				<LinkButton
					href="#"
					data-tooltip="LinkButton"
					c_disabled={disabled()}
					c_variant={variant()}
					c_focused={focused()}
					c_selected={selected()}
					c_indicator_position={indicator_position()}>
					<Show when={icon()}>
						<Icon c_code={ICON_CURSOR_CLICK}/>
					</Show>
					LinkButton
				</LinkButton>

				<LinkIconButton
					href="#"
					data-tooltip="LinkIconButton"
					c_disabled={disabled()}
					c_variant={variant()}
					c_focused={focused()}
					c_selected={selected()}
					c_indicator_position={indicator_position()}
					c_code={ICON_CURSOR_CLICK}
				/>

				<LinkEmojiButton
					href="#"
					data-tooltip="LinkEmojiButton"
					c_disabled={disabled()}
					c_variant={variant()}
					c_focused={focused()}
					c_selected={selected()}
					c_indicator_position={indicator_position()}
					c_emoji={'😁'}
				/>

				<FloatingActionButton
					data-tooltip="FloatingActionButton"
					disabled={disabled()}
					c_variant={variant()}
					c_focused={focused()}
					c_selected={selected()}
					c_indicator_position={indicator_position()}>
					<Show when={icon()}>
						<Icon c_code={ICON_CURSOR_CLICK}/>
					</Show>
					FloatingActionButton
				</FloatingActionButton>

				<LinkFloatingActionButton
					data-tooltip="LinkFloatingActionButton"
					href={'#'}
					c_disabled={disabled()}
					c_variant={variant()}
					c_focused={focused()}
					c_selected={selected()}
					c_indicator_position={indicator_position()}>
					<Show when={icon()}>
						<Icon c_code={ICON_CURSOR_CLICK}/>
					</Show>
					LinkFloatingActionButton
				</LinkFloatingActionButton>
			</Tooltip>
		</Playground>
		<PlaygroundOptions>
			<Dropdown
				c_label="Variant"
				c_values={[variant()]}
				c_on_change={(items) => set_variant(items[0].value as ButtonVariant)}>
				<For each={[
					[ButtonVariant.filled, 'Filled'],
					[ButtonVariant.tonal, 'Tonal'],
					[ButtonVariant.outlined, 'Outlined'],
					[ButtonVariant.transparent, 'Transparent'],
				]}>{option => <DropdownOption c_value={option[0]} c_text={option[1] as string} />}</For>
			</Dropdown>
			<Show when={selected()}>
				<Dropdown
					c_label="Indicator position"
					c_on_change={(items) => set_indicator_position(items[0].value as ButtonIndicatorPosition)}
					c_values={[indicator_position()]}>
					<For each={[
						[ButtonIndicatorPosition.top, 'Top'],
						[ButtonIndicatorPosition.right, 'Right'],
						[ButtonIndicatorPosition.bottom, 'Bottom'],
						[ButtonIndicatorPosition.left, 'Left'],
					]}>{option => <DropdownOption c_value={option[0]} c_text={option[1] as string} />}</For>
				</Dropdown>
			</Show>
			<CheckBox
				checked={disabled()}
				onChange={ev => set_disabled(event_current_target(ev).checked)}>
				Disabled
			</CheckBox>
			<CheckBox
				checked={focused()}
				onChange={ev => set_focused(event_current_target(ev).checked)}>
				Focused
			</CheckBox>
			<CheckBox
				checked={selected()}
				onChange={ev => set_selected(event_current_target(ev).checked)}>
				Selected
			</CheckBox>
			<CheckBox
				checked={icon()}
				onChange={ev => set_icon(event_current_target(ev).checked)}>
				Show icon
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _