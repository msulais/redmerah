import { createSignal, For, Show, type VoidComponent } from "solid-js"

import { _centerTop, _tonal, _filled, _centerBottom, _leftBottom, _leftTop, _rightBottom, _rightTop, _checked, _currentTarget, _valueAsNumber, _value } from "@/constants/string"
import { safeNumber } from "@/utils/math"

import Icon from "@/components/Icon"
import Button, { ButtonVariant, IconButton } from "@/components/Button"
import CheckBox from "@/components/CheckBox"
import { NumberTextField } from "@/components/TextField"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import Toast, { closeToast, openToast, ToastPosition } from "@/components/Toast"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
	const [header, setHeader] = createSignal<boolean>(false)
	const [actions, setActions] = createSignal<boolean>(false)
	const [leading, setLeading] = createSignal<boolean>(true)
	const [trailing, setTrailing] = createSignal<boolean>(false)
	const [content, setContent] = createSignal<boolean>(true)
	const [autoClose, setAutoClose] = createSignal<boolean>(true)
	const [duration, setDuration] = createSignal<number>(5000)
	const [position, setPosition] = createSignal<ToastPosition>(ToastPosition[_centerTop])
	let toast_ref: HTMLDivElement
	return (<Page
		title="Toast"
		description="A toast is a lightweight notification that appears briefly at the bottom or top of the screen. It provides users with short messages or alerts without interrupting their primary workflow. Toasts are typically used to display success messages, errors, or informational updates.">
		<Playground>
			<Button
				variant={ButtonVariant[_tonal]}
				onClick={ev => openToast(ev, toast_ref, {
					autoClose: autoClose(),
					duration: duration(),
					position: position()
				})}>
				Open toast
			</Button>
			<Toast
				ref={r => toast_ref = r}
				header={<Show when={header()}>Warning</Show>}
				trailing={<Show when={trailing()}>
					<IconButton code={0xEED3} onClick={() => closeToast(toast_ref)}/>
					<IconButton code={0xEE3B} onClick={() => closeToast(toast_ref)}/>
				</Show>}
				actions={<Show when={actions()}>
					<Button variant={ButtonVariant[_tonal]} onClick={() => closeToast(toast_ref)}>Close</Button>
					<Button variant={ButtonVariant[_tonal]} onClick={() => closeToast(toast_ref)}>Reject</Button>
					<Button variant={ButtonVariant[_filled]} onClick={() => closeToast(toast_ref)}>Accept</Button>
				</Show>}
				leading={<Show when={leading()}><Icon code={0xECB6}/></Show>}>
				<Show when={content()}>
					Labore ipsum pariatur ea aliquip ex laboris dolor ea in occaecat in. Officia cillum cupidatat est dolor sit.
				</Show>
			</Toast>
		</Playground>
		<PlaygroundOptions>
			<Show when={autoClose()}>
				<NumberTextField
					label="Duration"
					style={{width: '100px'}}
					value={duration()}
					step={100}
					min={100}
					onBlur={ev => setDuration(d => safeNumber(ev[_currentTarget][_valueAsNumber], d))}
					trailing="ms"
				/>
			</Show>
			<Dropdown
				label="Position"
				values={[position()]}
				onChangeOptions={(options) => setPosition(options[0][_value] as ToastPosition)}>
				<For each={[
					[ToastPosition[_centerBottom], 'Center bottom'],
					[ToastPosition[_centerTop], 'Center top'],
					[ToastPosition[_leftBottom], 'Left bottom'],
					[ToastPosition[_leftTop], 'Left top'],
					[ToastPosition[_rightBottom], 'Right bottom'],
					[ToastPosition[_rightTop], 'Right top'],
				]}>{option => <DropdownOption value={option[0]} text={option[1] as string} />}</For>
			</Dropdown>
			<CheckBox
				checked={header()}
				onChange={ev => setHeader(ev[_currentTarget][_checked])}>
				Header
			</CheckBox>
			<CheckBox
				checked={actions()}
				onChange={ev => setActions(ev[_currentTarget][_checked])}>
				Actions
			</CheckBox>
			<CheckBox
				checked={leading()}
				onChange={ev => setLeading(ev[_currentTarget][_checked])}>
				Leading
			</CheckBox>
			<CheckBox
				checked={trailing()}
				onChange={ev => setTrailing(ev[_currentTarget][_checked])}>
				Trailing
			</CheckBox>
			<CheckBox
				checked={content()}
				onChange={ev => setContent(ev[_currentTarget][_checked])}>
				Content
			</CheckBox>
			<CheckBox
				checked={autoClose()}
				onChange={ev => setAutoClose(ev[_currentTarget][_checked])}>
				Auto close
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _