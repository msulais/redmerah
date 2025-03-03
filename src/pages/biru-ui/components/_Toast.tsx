import { createSignal, For, Show, type VoidComponent } from "solid-js"

import { numberSafe } from "@/utils/number"

import Icon from "@/components/Icon"
import Button, { ButtonVariant, IconButton } from "@/components/Button"
import CheckBox from "@/components/CheckBox"
import { NumberTextField } from "@/components/TextField"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import Tooltip from "@/components/Tooltip"
import Toast, { closeToast, openToast, ToastPosition } from "@/components/Toast"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
	const [header, setHeader] = createSignal<boolean>(false)
	const [actions, setActions] = createSignal<boolean>(false)
	const [leading, setLeading] = createSignal<boolean>(true)
	const [trailing, setTrailing] = createSignal<boolean>(false)
	const [content, setContent] = createSignal<boolean>(true)
	const [autoclose, setAutoclose] = createSignal<boolean>(true)
	const [duration, setDuration] = createSignal<number>(5000)
	const [position, setPosition] = createSignal<ToastPosition>(ToastPosition.centerTop)
	let toastRef: HTMLDivElement
	return (<Page
		title="Toast"
		description="A toast is a lightweight notification that appears briefly at the bottom or top of the screen. It provides users with short messages or alerts without interrupting their primary workflow. Toasts are typically used to display success messages, errors, or informational updates.">
		<Playground>
			<Button
				c:variant={ButtonVariant.tonal}
				onClick={() => openToast(toastRef, {
					autoclose: autoclose(),
					duration: duration(),
					position: position()
				})}>
				Open toast
			</Button>
			<Toast
				ref={r => toastRef = r}
				c:header={<Show when={header()}>Warning</Show>}
				c:trailing={<Show when={trailing()}>
					<IconButton c:code={0xEED3} onClick={() => closeToast(toastRef)}/>
					<IconButton c:code={0xEE3B} onClick={() => closeToast(toastRef)}/>
				</Show>}
				c:actions={<Show when={actions()}>
					<Button c:variant={ButtonVariant.tonal} onClick={() => closeToast(toastRef)}>Close</Button>
					<Button c:variant={ButtonVariant.tonal} onClick={() => closeToast(toastRef)}>Reject</Button>
					<Button c:variant={ButtonVariant.filled} onClick={() => closeToast(toastRef)}>Accept</Button>
				</Show>}
				c:leading={<Show when={leading()}><Icon c:code={0xECB6}/></Show>}>
				<Show when={content()}>
					Labore ipsum pariatur ea aliquip ex laboris dolor ea in occaecat in. Officia cillum cupidatat est dolor sit.
				</Show>
			</Toast>
		</Playground>
		<PlaygroundOptions>
			<Show when={autoclose()}>
				<Tooltip>
					<NumberTextField
						c:label="Duration"
						style={{width: '100px'}}
						value={duration()}
						step={100}
						min={100}
						onBlur={ev => setDuration(d => numberSafe(ev.currentTarget.valueAsNumber, d))}
						c:trailing="ms"
					/>
				</Tooltip>
			</Show>
			<Dropdown
				c:label="Position"
				c:values={[position()]}
				c:onChange={(options) => setPosition(options[0].value as ToastPosition)}>
				<For each={[
					[ToastPosition.centerBottom, 'Center bottom'],
					[ToastPosition.centerTop, 'Center top'],
					[ToastPosition.leftBottom, 'Left bottom'],
					[ToastPosition.leftTop, 'Left top'],
					[ToastPosition.rightBottom, 'Right bottom'],
					[ToastPosition.rightCenter, 'Right top'],
				]}>{option => <DropdownOption c:value={option[0]} c:text={option[1] as string} />}</For>
			</Dropdown>
			<CheckBox
				checked={header()}
				onChange={ev => setHeader(ev.currentTarget.checked)}>
				Header
			</CheckBox>
			<CheckBox
				checked={actions()}
				onChange={ev => setActions(ev.currentTarget.checked)}>
				Actions
			</CheckBox>
			<CheckBox
				checked={leading()}
				onChange={ev => setLeading(ev.currentTarget.checked)}>
				Leading
			</CheckBox>
			<CheckBox
				checked={trailing()}
				onChange={ev => setTrailing(ev.currentTarget.checked)}>
				Trailing
			</CheckBox>
			<CheckBox
				checked={content()}
				onChange={ev => setContent(ev.currentTarget.checked)}>
				Content
			</CheckBox>
			<CheckBox
				checked={autoclose()}
				onChange={ev => setAutoclose(ev.currentTarget.checked)}>
				Auto close
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _