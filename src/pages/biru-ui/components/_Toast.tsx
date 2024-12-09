import { createSignal, For, Show, type VoidComponent } from "solid-js"

import { number_safe } from "@/utils/number"

import Icon from "@/components/Icon"
import Button, { ButtonVariant, IconButton } from "@/components/Button"
import CheckBox from "@/components/CheckBox"
import { NumberTextField } from "@/components/TextField"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import Toast, { close_toast, open_toast, ToastPosition } from "@/components/Toast"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
	const [header, set_header] = createSignal<boolean>(false)
	const [actions, set_actions] = createSignal<boolean>(false)
	const [leading, set_leading] = createSignal<boolean>(true)
	const [trailing, set_trailing] = createSignal<boolean>(false)
	const [content, set_content] = createSignal<boolean>(true)
	const [autoclose, set_autoclose] = createSignal<boolean>(true)
	const [duration, set_duration] = createSignal<number>(5000)
	const [position, set_position] = createSignal<ToastPosition>(ToastPosition.center_top)
	let toast_ref: HTMLDivElement
	return (<Page
		title="Toast"
		description="A toast is a lightweight notification that appears briefly at the bottom or top of the screen. It provides users with short messages or alerts without interrupting their primary workflow. Toasts are typically used to display success messages, errors, or informational updates.">
		<Playground>
			<Button
				variant={ButtonVariant.tonal}
				onClick={ev => open_toast(ev, toast_ref, {
					autoclose: autoclose(),
					duration: duration(),
					position: position()
				})}>
				Open toast
			</Button>
			<Toast
				ref={r => toast_ref = r}
				header={<Show when={header()}>Warning</Show>}
				trailing={<Show when={trailing()}>
					<IconButton code={0xEED3} onClick={() => close_toast(toast_ref)}/>
					<IconButton code={0xEE3B} onClick={() => close_toast(toast_ref)}/>
				</Show>}
				actions={<Show when={actions()}>
					<Button variant={ButtonVariant.tonal} onClick={() => close_toast(toast_ref)}>Close</Button>
					<Button variant={ButtonVariant.tonal} onClick={() => close_toast(toast_ref)}>Reject</Button>
					<Button variant={ButtonVariant.filled} onClick={() => close_toast(toast_ref)}>Accept</Button>
				</Show>}
				leading={<Show when={leading()}><Icon code={0xECB6}/></Show>}>
				<Show when={content()}>
					Labore ipsum pariatur ea aliquip ex laboris dolor ea in occaecat in. Officia cillum cupidatat est dolor sit.
				</Show>
			</Toast>
		</Playground>
		<PlaygroundOptions>
			<Show when={autoclose()}>
				<NumberTextField
					label="Duration"
					style={{width: '100px'}}
					value={duration()}
					step={100}
					min={100}
					onBlur={ev => set_duration(d => number_safe(ev.currentTarget.valueAsNumber, d))}
					trailing="ms"
				/>
			</Show>
			<Dropdown
				label="Position"
				values={[position()]}
				on_change_options={(options) => set_position(options[0].value as ToastPosition)}>
				<For each={[
					[ToastPosition.center_bottom, 'Center bottom'],
					[ToastPosition.center_top, 'Center top'],
					[ToastPosition.left_bottom, 'Left bottom'],
					[ToastPosition.left_top, 'Left top'],
					[ToastPosition.right_bottom, 'Right bottom'],
					[ToastPosition.right_top, 'Right top'],
				]}>{option => <DropdownOption value={option[0]} text={option[1] as string} />}</For>
			</Dropdown>
			<CheckBox
				checked={header()}
				onChange={ev => set_header(ev.currentTarget.checked)}>
				Header
			</CheckBox>
			<CheckBox
				checked={actions()}
				onChange={ev => set_actions(ev.currentTarget.checked)}>
				Actions
			</CheckBox>
			<CheckBox
				checked={leading()}
				onChange={ev => set_leading(ev.currentTarget.checked)}>
				Leading
			</CheckBox>
			<CheckBox
				checked={trailing()}
				onChange={ev => set_trailing(ev.currentTarget.checked)}>
				Trailing
			</CheckBox>
			<CheckBox
				checked={content()}
				onChange={ev => set_content(ev.currentTarget.checked)}>
				Content
			</CheckBox>
			<CheckBox
				checked={autoclose()}
				onChange={ev => set_autoclose(ev.currentTarget.checked)}>
				Auto close
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _