import { createSignal, For, Show, type VoidComponent } from "solid-js"

import { numberSafe } from "@/utils/number"

import Button, { ButtonVariant } from "@/components/Button"
import CheckBox from "@/components/CheckBox"
import TextField, { NumberTextField } from "@/components/TextField"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import Tooltip from "@/components/Tooltip"
import Modal, { closeModal, ModalPosition, openModal } from "@/components/Modal"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
	const [allowHideAnchor, setAllowHideAnchor] = createSignal<boolean>(true)
	const [draggable, setDraggable] = createSignal<boolean>(false)
	const [gap, setGap] = createSignal<number>(12)
	const [contentAutoFocus, setContentAutoFocus] = createSignal<boolean>(false)
	const [important, setImportant] = createSignal<boolean>(false)
	const [padding, setPadding] = createSignal<number>(0)
	const [position, setPosition] = createSignal<ModalPosition>(ModalPosition.centerBottom)
	const [anchor, setAnchor] = createSignal<boolean>(true)
	let modalRef: HTMLDialogElement

	return (<Page
		title="Modal"
		description="A modal is an overlay window that appears on top of the main content, blocking user interaction with the underlying elements until it is dismissed. Modals are often used for critical tasks or to present important information.">
		<Playground>
			<Button c:variant={ButtonVariant.tonal} onClick={(ev) => openModal(modalRef, {
				anchor: anchor()? ev.currentTarget : undefined,
				allowHideAnchor: allowHideAnchor(),
				draggable: draggable(),
				gap: gap(),
				important: important(),
				contentAutoFocus: contentAutoFocus(),
				padding: padding(),
				position: position(),
			})}>Open modal</Button>
			<Modal ref={r => modalRef = r} style={{width: '300px'}}>
				<div style={{padding: '16px'}}>
					<TextField placeholder="Feedback"/>
					<p style={{margin: '8px 0'}}>Consequat commodo sint incididunt nulla duis commodo elit enim aliquip ex occaecat eiusmod.</p>
					<Button onClick={(_ev) => closeModal(modalRef)} c:variant={ButtonVariant.filled}>Close modal</Button>
				</div>
			</Modal>
		</Playground>
		<PlaygroundOptions>
			<Tooltip>
				<Dropdown
					c:label="Position"
					c:values={[position()]}
					c:onChange={(options) => setPosition(options[0].value as ModalPosition)}>
					<For each={[
						[ModalPosition.leftTop, 'Left top'],
						[ModalPosition.leftCenterToBottom, 'Left center to bottom'],
						[ModalPosition.leftCenter, 'Left center'],
						[ModalPosition.leftCenterToTop, 'Left center to top'],
						[ModalPosition.leftBottom, 'Left bottom'],
						[ModalPosition.rightTop, 'Right top'],
						[ModalPosition.rightCenterToBottom, 'Right center to bottom'],
						[ModalPosition.rightCenter, 'Right center'],
						[ModalPosition.rightCenterToTop, 'Right center to top'],
						[ModalPosition.rightBottom, 'Right bottom'],
						[ModalPosition.centerTopToRight, 'Center top to right'],
						[ModalPosition.centerTop, 'Center top'],
						[ModalPosition.centerTopToLeft, 'Center top to left'],
						[ModalPosition.centerBottomToRight, 'Center bottom to right'],
						[ModalPosition.centerBottom, 'Center bottom'],
						[ModalPosition.centerBottomToLeft, 'Center bottom to left'],
						[ModalPosition.centerCenterLeftTop, 'Center center left top'],
						[ModalPosition.centerCenterLeft, 'Center center left'],
						[ModalPosition.centerCenterLeftBottom, 'Center center left bottom'],
						[ModalPosition.centerCenterTop, 'Center center top'],
						[ModalPosition.centerCenter, 'Center center'],
						[ModalPosition.centerCenterBottom, 'Center center bottom'],
						[ModalPosition.centerCenterRightTop, 'Center center right top'],
						[ModalPosition.centerCenterRight, 'Center center right'],
						[ModalPosition.centerCenterRightBottom, 'Center center right bottom'],
					]}>{option => <DropdownOption c:value={option[0]} c:text={option[1] as string} />}</For>
				</Dropdown>
				<NumberTextField
					style={{width: '100px'}}
					value={gap()}
					min={0}
					onBlur={(ev) => setGap(g => numberSafe(ev.currentTarget.valueAsNumber, g))}
					c:label="Gap"
				/>
				<Show when={[
					ModalPosition.centerTopToRight,
					ModalPosition.centerCenterLeft,
					ModalPosition.centerBottomToRight,
					ModalPosition.centerTopToLeft,
					ModalPosition.centerCenterRight,
					ModalPosition.centerBottomToLeft,
					ModalPosition.leftCenterToBottom,
					ModalPosition.centerCenterLeftTop,
					ModalPosition.centerCenterTop,
					ModalPosition.centerCenterRightTop,
					ModalPosition.rightCenterToBottom,
					ModalPosition.leftCenterToTop,
					ModalPosition.centerCenterLeftBottom,
					ModalPosition.centerCenterBottom,
					ModalPosition.centerCenterRightBottom,
					ModalPosition.rightCenterToTop
				].includes(position())}>
					<NumberTextField
						value={padding()}
						style={{width: '100px'}}
						min={0}
						onBlur={(ev) => setPadding(p => numberSafe(ev.currentTarget.valueAsNumber, p))}
						c:label="Padding"
					/>
				</Show>
				<CheckBox
					checked={anchor()}
					onChange={ev => setAnchor(ev.currentTarget.checked)}>
					Anchor
				</CheckBox>
				<CheckBox
					checked={important()}
					onChange={ev => setImportant(ev.currentTarget.checked)}>
					Important
				</CheckBox>
				<CheckBox
					checked={contentAutoFocus()}
					onChange={ev => setContentAutoFocus(ev.currentTarget.checked)}>
					Input Autofocus
				</CheckBox>
				<CheckBox
					checked={draggable()}
					onChange={ev => setDraggable(ev.currentTarget.checked)}>
					Draggable
				</CheckBox>
				<CheckBox
					checked={allowHideAnchor()}
					onChange={ev => setAllowHideAnchor(ev.currentTarget.checked)}>
					Allow hide anchor
				</CheckBox>
			</Tooltip>
		</PlaygroundOptions>
	</Page>)
}

export default _