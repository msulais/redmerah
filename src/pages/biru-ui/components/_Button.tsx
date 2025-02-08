import { type VoidComponent, createSignal, For, Show } from "solid-js"

import { Tooltip } from "@/components/Tooltip"
import Icon from "@/components/Icon"
import Button, { ButtonIndicatorPosition, ButtonVariant, EmojiButton, FloatingActionButton, IconButton, LinkButton, LinkEmojiButton, LinkFloatingActionButton, LinkIconButton } from "@/components/Button"
import CheckBox from "@/components/CheckBox"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import { Page, Playground, PlaygroundOptions } from "../_Body"
import { eventCurrentTarget } from "@/utils/event"
import { ICON_CURSOR_CLICK } from "@/constants/icons"

const _: VoidComponent = () => {
	const [variant, setVariant] = createSignal<ButtonVariant>(ButtonVariant.transparent)
	const [disabled, setDisabled] = createSignal<boolean>(false)
	const [focused, setFocused] = createSignal<boolean>(false)
	const [selected, setSelected] = createSignal<boolean>(false)
	const [icon, setIcon] = createSignal<boolean>(false)
	const [indicatorPosition, setIndicatorPosition] = createSignal<ButtonIndicatorPosition>(ButtonIndicatorPosition.bottom)
	return (<Page
		title="Buttons"
		description="A button is an interactive UI element that triggers a specific action when clicked or tapped. It typically has a clear label indicating its function and provides visual feedback upon interaction. Buttons are essential for guiding users through an interface and facilitating user-system communication.">
		<Playground>
			<Tooltip>
				<Button
					data-tooltip="Button"
					disabled={disabled()}
					c:variant={variant()}
					c:focused={focused()}
					c:selected={selected()}
					c:indicatorPosition={indicatorPosition()}>
					<Show when={icon()}>
						<Icon c:code={ICON_CURSOR_CLICK}/>
					</Show>
					Button
				</Button>

				<IconButton
					data-tooltip="IconButton"
					disabled={disabled()}
					c:variant={variant()}
					c:focused={focused()}
					c:selected={selected()}
					c:indicatorPosition={indicatorPosition()}
					c:code={ICON_CURSOR_CLICK}
				/>

				<EmojiButton
					data-tooltip="EmojiButton"
					disabled={disabled()}
					c:variant={variant()}
					c:focused={focused()}
					c:selected={selected()}
					c:indicatorPosition={indicatorPosition()}
					c:emoji={'🏛'}
				/>

				<LinkButton
					href="#"
					data-tooltip="LinkButton"
					c:disabled={disabled()}
					c:variant={variant()}
					c:focused={focused()}
					c:selected={selected()}
					c:indicatorPosition={indicatorPosition()}>
					<Show when={icon()}>
						<Icon c:code={ICON_CURSOR_CLICK}/>
					</Show>
					LinkButton
				</LinkButton>

				<LinkIconButton
					href="#"
					data-tooltip="LinkIconButton"
					c:disabled={disabled()}
					c:variant={variant()}
					c:focused={focused()}
					c:selected={selected()}
					c:indicatorPosition={indicatorPosition()}
					c:code={ICON_CURSOR_CLICK}
				/>

				<LinkEmojiButton
					href="#"
					data-tooltip="LinkEmojiButton"
					c:disabled={disabled()}
					c:variant={variant()}
					c:focused={focused()}
					c:selected={selected()}
					c:indicatorPosition={indicatorPosition()}
					c:emoji={'😁'}
				/>

				<FloatingActionButton
					data-tooltip="FloatingActionButton"
					disabled={disabled()}
					c:variant={variant()}
					c:focused={focused()}
					c:selected={selected()}
					c:indicatorPosition={indicatorPosition()}>
					<Show when={icon()}>
						<Icon c:code={ICON_CURSOR_CLICK}/>
					</Show>
					FloatingActionButton
				</FloatingActionButton>

				<LinkFloatingActionButton
					data-tooltip="LinkFloatingActionButton"
					href={'#'}
					c:disabled={disabled()}
					c:variant={variant()}
					c:focused={focused()}
					c:selected={selected()}
					c:indicatorPosition={indicatorPosition()}>
					<Show when={icon()}>
						<Icon c:code={ICON_CURSOR_CLICK}/>
					</Show>
					LinkFloatingActionButton
				</LinkFloatingActionButton>
			</Tooltip>
		</Playground>
		<PlaygroundOptions>
			<Dropdown
				c:label="Variant"
				c:values={[variant()]}
				c:onChange={(items) => setVariant(items[0].value as ButtonVariant)}>
				<For each={[
					[ButtonVariant.filled, 'Filled'],
					[ButtonVariant.tonal, 'Tonal'],
					[ButtonVariant.outlined, 'Outlined'],
					[ButtonVariant.transparent, 'Transparent'],
				]}>{option => <DropdownOption c:value={option[0]} c:text={option[1] as string} />}</For>
			</Dropdown>
			<Show when={selected()}>
				<Dropdown
					c:label="Indicator position"
					c:onChange={(items) => setIndicatorPosition(items[0].value as ButtonIndicatorPosition)}
					c:values={[indicatorPosition()]}>
					<For each={[
						[ButtonIndicatorPosition.top, 'Top'],
						[ButtonIndicatorPosition.right, 'Right'],
						[ButtonIndicatorPosition.bottom, 'Bottom'],
						[ButtonIndicatorPosition.left, 'Left'],
					]}>{option => <DropdownOption c:value={option[0]} c:text={option[1] as string} />}</For>
				</Dropdown>
			</Show>
			<CheckBox
				checked={disabled()}
				onChange={ev => setDisabled(eventCurrentTarget(ev).checked)}>
				Disabled
			</CheckBox>
			<CheckBox
				checked={focused()}
				onChange={ev => setFocused(eventCurrentTarget(ev).checked)}>
				Focused
			</CheckBox>
			<CheckBox
				checked={selected()}
				onChange={ev => setSelected(eventCurrentTarget(ev).checked)}>
				Selected
			</CheckBox>
			<CheckBox
				checked={icon()}
				onChange={ev => setIcon(eventCurrentTarget(ev).checked)}>
				Show icon
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _