import { type VoidComponent, createSignal, For, Show } from "solid-js"

import { TextTooltip } from "@/components/Tooltip"
import Icon from "@/components/Icon"
import Button, { ButtonIndicatorPosition, ButtonVariant, EmojiButton, FloatingActionButton, IconButton, LinkButton, LinkEmojiButton, LinkFloatingActionButton, LinkIconButton } from "@/components/Button"
import CheckBox from "@/components/CheckBox"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import { Page, Playground, PlaygroundOptions } from "../_Body"

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
			<TextTooltip>
				<Button
					data-tooltip="Button"
					disabled={disabled()}
					variant={variant()}
					focused={focused()}
					selected={selected()}
					indicator_position={indicator_position()}>
					<Show when={icon()}>
						<Icon code={0xE54B}/>
					</Show>
					Button
				</Button>

				<IconButton
					data-tooltip="IconButton"
					disabled={disabled()}
					variant={variant()}
					focused={focused()}
					selected={selected()}
					indicator_position={indicator_position()}
					code={0xE54B}
				/>

				<EmojiButton
					data-tooltip="EmojiButton"
					disabled={disabled()}
					variant={variant()}
					focused={focused()}
					selected={selected()}
					indicator_position={indicator_position()}
					emoji={'🏛'}
				/>

				<LinkButton
					href="#"
					data-tooltip="LinkButton"
					disabled={disabled()}
					variant={variant()}
					focused={focused()}
					selected={selected()}
					indicator_position={indicator_position()}>
					<Show when={icon()}>
						<Icon code={0xE54B}/>
					</Show>
					LinkButton
				</LinkButton>

				<LinkIconButton
					href="#"
					data-tooltip="LinkIconButton"
					disabled={disabled()}
					variant={variant()}
					focused={focused()}
					selected={selected()}
					indicator_position={indicator_position()}
					code={0xE54B}
				/>

				<LinkEmojiButton
					href="#"
					data-tooltip="LinkEmojiButton"
					disabled={disabled()}
					variant={variant()}
					focused={focused()}
					selected={selected()}
					indicator_position={indicator_position()}
					emoji={'😁'}
				/>

				<FloatingActionButton
					data-tooltip="FloatingActionButton"
					disabled={disabled()}
					variant={variant()}
					focused={focused()}
					selected={selected()}
					indicator_position={indicator_position()}>
					<Show when={icon()}>
						<Icon code={0xE54B}/>
					</Show>
					FloatingActionButton
				</FloatingActionButton>

				<LinkFloatingActionButton
					data-tooltip="LinkFloatingActionButton"
					href={'#'}
					disabled={disabled()}
					variant={variant()}
					focused={focused()}
					selected={selected()}
					indicator_position={indicator_position()}>
					<Show when={icon()}>
						<Icon code={0xE54B}/>
					</Show>
					LinkFloatingActionButton
				</LinkFloatingActionButton>
			</TextTooltip>
		</Playground>
		<PlaygroundOptions>
			<Dropdown
				label="Variant"
				values={[variant()]}
				on_change_options={(items) => set_variant(items[0].value as ButtonVariant)}>
				<For each={[
					[ButtonVariant.filled, 'Filled'],
					[ButtonVariant.tonal, 'Tonal'],
					[ButtonVariant.outlined, 'Outlined'],
					[ButtonVariant.transparent, 'Transparent'],
				]}>{option => <DropdownOption value={option[0]} text={option[1] as string} />}</For>
			</Dropdown>
			<Show when={selected()}>
				<Dropdown
					label="Indicator position"
					on_change_options={(items) => set_indicator_position(items[0].value as ButtonIndicatorPosition)}
					values={[indicator_position()]}>
					<For each={[
						[ButtonIndicatorPosition.top, 'Top'],
						[ButtonIndicatorPosition.right, 'Right'],
						[ButtonIndicatorPosition.bottom, 'Bottom'],
						[ButtonIndicatorPosition.left, 'Left'],
					]}>{option => <DropdownOption value={option[0]} text={option[1] as string} />}</For>
				</Dropdown>
			</Show>
			<CheckBox
				checked={disabled()}
				onChange={ev => set_disabled(ev.currentTarget.checked)}>
				Disabled
			</CheckBox>
			<CheckBox
				checked={focused()}
				onChange={ev => set_focused(ev.currentTarget.checked)}>
				Focused
			</CheckBox>
			<CheckBox
				checked={selected()}
				onChange={ev => set_selected(ev.currentTarget.checked)}>
				Selected
			</CheckBox>
			<CheckBox
				checked={icon()}
				onChange={ev => set_icon(ev.currentTarget.checked)}>
				Show icon
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _