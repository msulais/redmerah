import { createSignal, For, Show, type VoidComponent } from "solid-js"

import { numberSafe } from "@/utils/number"

import Button, { ButtonVariant } from "@/components/Button"
import CheckBox from "@/components/CheckBox"
import TextField, { NumberTextField } from "@/components/TextField"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import Tooltip from "@/components/Tooltip"
import Popover, { closePopover, openPopover, PopoverPosition } from "@/components/Popover"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
	const [allowHideAnchor, setAllowHideAnchor] = createSignal<boolean>(true)
	const [draggable, setDraggable] = createSignal<boolean>(false)
	const [gap, setGap] = createSignal<number>(12)
	const [padding, setPadding] = createSignal<number>(0)
	const [position, setPosition] = createSignal<PopoverPosition>(PopoverPosition.centerBottom)
	const [anchor, setAnchor] = createSignal<boolean>(true)
	const [manualDismiss, setManualDismiss] = createSignal<boolean>(false)
	let popoverRef: HTMLDivElement
	return (<Page
		title="Popover"
		description="A popover is a small, temporary window that appears when a user interacts with an element (e.g., hovers over a button). It provides additional information, options, or tools related to the element. Popover content can be triggered by hover, click, or focus.">
		<Playground>
			<Button c:variant={ButtonVariant.tonal} onClick={(ev) => openPopover(popoverRef, {
				anchor: anchor()? ev.currentTarget : undefined,
				allowHideAnchor: allowHideAnchor(),
				draggable: draggable(),
				gap: gap(),
				padding: padding(),
				position: position(),
				manualDismiss: manualDismiss()
			})}>Open popover</Button>
			<Popover ref={r => popoverRef = r} style={{width: '300px'}}>
				<div style={{padding: '16px'}}>
					<TextField placeholder="Feedback"/>
					<p style={{margin: '8px 0'}}>Consequat commodo sint incididunt nulla duis commodo elit enim aliquip ex occaecat eiusmod.</p>
					<Button onClick={(_ev) => closePopover(popoverRef)} c:variant={ButtonVariant.filled}>Close popover</Button>
				</div>
			</Popover>
		</Playground>
		<PlaygroundOptions>
			<Tooltip>
				<Dropdown
					c:label="Position"
					c:values={[position()]}
					c:onChange={(options) => setPosition(options[0].value as PopoverPosition)}>
					<For each={[
						[PopoverPosition.leftTop, 'Left top'],
						[PopoverPosition.leftCenterToBottom, 'Left center to bottom'],
						[PopoverPosition.leftCenter, 'Left center'],
						[PopoverPosition.leftCenterToTop, 'Left center to top'],
						[PopoverPosition.leftBottom, 'Left bottom'],
						[PopoverPosition.rightTop, 'Right top'],
						[PopoverPosition.rightCenterToBottom, 'Right center to bottom'],
						[PopoverPosition.rightCenter, 'Right center'],
						[PopoverPosition.rightCenterToTop, 'Right center to top'],
						[PopoverPosition.rightBottom, 'Right bottom'],
						[PopoverPosition.centerTopToRight, 'Center top to right'],
						[PopoverPosition.centerTop, 'Center top'],
						[PopoverPosition.centerTopToLeft, 'Center top to left'],
						[PopoverPosition.centerBottomToRight, 'Center bottom to right'],
						[PopoverPosition.centerBottom, 'Center bottom'],
						[PopoverPosition.centerBottomToLeft, 'Center bottom to left'],
						[PopoverPosition.centerCenterLeftTop, 'Center center left top'],
						[PopoverPosition.centerCenterLeft, 'Center center left'],
						[PopoverPosition.centerCenterLeftBottom, 'Center center left bottom'],
						[PopoverPosition.centerCenterTop, 'Center center top'],
						[PopoverPosition.centerCenter, 'Center center'],
						[PopoverPosition.centerCenterBottom, 'Center center bottom'],
						[PopoverPosition.centerCenterRightTop, 'Center center right top'],
						[PopoverPosition.centerCenterRight, 'Center center right'],
						[PopoverPosition.centerCenterRightBottom, 'Center center right bottom'],
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
					PopoverPosition.centerTopToRight,
					PopoverPosition.centerCenterLeft,
					PopoverPosition.centerBottomToRight,
					PopoverPosition.centerTopToLeft,
					PopoverPosition.centerCenterRight,
					PopoverPosition.centerBottomToLeft,
					PopoverPosition.leftCenterToBottom,
					PopoverPosition.centerCenterLeftTop,
					PopoverPosition.centerCenterTop,
					PopoverPosition.centerCenterRightTop,
					PopoverPosition.rightCenterToBottom,
					PopoverPosition.leftCenterToTop,
					PopoverPosition.centerCenterLeftBottom,
					PopoverPosition.centerCenterBottom,
					PopoverPosition.centerCenterRightBottom,
					PopoverPosition.rightCenterToTop
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
					checked={draggable()}
					onChange={ev => setDraggable(ev.currentTarget.checked)}>
					Dragable
				</CheckBox>
				<CheckBox
					checked={allowHideAnchor()}
					onChange={ev => setAllowHideAnchor(ev.currentTarget.checked)}>
					Allow hide anchor
				</CheckBox>
				<CheckBox
					checked={manualDismiss()}
					onChange={ev => setManualDismiss(ev.currentTarget.checked)}>
					Manual dismiss
				</CheckBox>
			</Tooltip>
		</PlaygroundOptions>
	</Page>)
}

export default _