import { createSignal, Show, type VoidComponent } from "solid-js"

import { _centerBottom, _tonal, _currentTarget, _filled, _leftTop, _leftCenterToBottom, _leftCenter, _leftCenterToTop, _leftBottom, _rightTop, _rightCenterToBottom, _rightCenter, _rightCenterToTop, _rightBottom, _centerTopToRight, _centerTop, _centerTopToLeft, _centerBottomToRight, _centerBottomToLeft, _centerCenterLeftTop, _centerCenterLeft, _centerCenterLeftBottom, _centerCenterTop, _centerCenter, _centerCenterBottom, _centerCenterRightTop, _centerCenterRight, _centerCenterRightBottom, _includes, _checked, _valueAsNumber } from "@/constants/string"
import { safeNumber } from "@/utils/math"

import Button, { ButtonVariant } from "@/components/Button"
import CheckBox from "@/components/CheckBox"
import TextField, { NumberTextField } from "@/components/TextField"
import Dropdown from "@/components/Dropdown"
import Popover, { closePopover, openPopover, PopoverPosition } from "@/components/Popover"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
	const [allowHideAnchor, setAllowHideAnchor] = createSignal<boolean>(true)
	const [dragable, setDragable] = createSignal<boolean>(false)
	const [gap, setGap] = createSignal<number>(12)
	const [padding, setPadding] = createSignal<number>(0)
	const [position, setPosition] = createSignal<PopoverPosition>(PopoverPosition[_centerBottom])
	const [anchor, setAnchor] = createSignal<boolean>(true)
	const [manualDismiss, setManualDismiss] = createSignal<boolean>(false)
	let popover_ref: HTMLDivElement
	return (<Page
		title="Popover"
		description="A popover is a small, temporary window that appears when a user interacts with an element (e.g., hovers over a button). It provides additional information, options, or tools related to the element. Popover content can be triggered by hover, click, or focus.">
		<Playground>
			<Button variant={ButtonVariant[_tonal]} onClick={(ev) => openPopover(ev, popover_ref, {
				anchor: anchor()? ev[_currentTarget] : undefined,
				allowHideAnchor: allowHideAnchor(),
				dragable: dragable(),
				gap: gap(),
				padding: padding(),
				position: position(),
				manualDismiss: manualDismiss()
			})}>Open popover</Button>
			<Popover ref={r => popover_ref = r} style={{width: '300px'}}>
				<div style={{padding: '16px'}}>
					<TextField placeholder="Feedback"/>
					<p style={{margin: '8px 0'}}>Consequat commodo sint incididunt nulla duis commodo elit enim aliquip ex occaecat eiusmod.</p>
					<Button onClick={(_ev) => closePopover(popover_ref)} variant={ButtonVariant[_filled]}>Close popover</Button>
				</div>
			</Popover>
		</Playground>
		<PlaygroundOptions>
			<Dropdown
				items={[
					[PopoverPosition[_leftTop], 'Left top'],
					[PopoverPosition[_leftCenterToBottom], 'Left center to bottom'],
					[PopoverPosition[_leftCenter], 'Left center'],
					[PopoverPosition[_leftCenterToTop], 'Left center to top'],
					[PopoverPosition[_leftBottom], 'Left bottom'],
					[PopoverPosition[_rightTop], 'Right top'],
					[PopoverPosition[_rightCenterToBottom], 'Right center to bottom'],
					[PopoverPosition[_rightCenter], 'Right center'],
					[PopoverPosition[_rightCenterToTop], 'Right center to top'],
					[PopoverPosition[_rightBottom], 'Right bottom'],
					[PopoverPosition[_centerTopToRight], 'Center top to right'],
					[PopoverPosition[_centerTop], 'Center top'],
					[PopoverPosition[_centerTopToLeft], 'Center top to left'],
					[PopoverPosition[_centerBottomToRight], 'Center bottom to right'],
					[PopoverPosition[_centerBottom], 'Center bottom'],
					[PopoverPosition[_centerBottomToLeft], 'Center bottom to left'],
					[PopoverPosition[_centerCenterLeftTop], 'Center center left top'],
					[PopoverPosition[_centerCenterLeft], 'Center center left'],
					[PopoverPosition[_centerCenterLeftBottom], 'Center center left bottom'],
					[PopoverPosition[_centerCenterTop], 'Center center top'],
					[PopoverPosition[_centerCenter], 'Center center'],
					[PopoverPosition[_centerCenterBottom], 'Center center bottom'],
					[PopoverPosition[_centerCenterRightTop], 'Center center right top'],
					[PopoverPosition[_centerCenterRight], 'Center center right'],
					[PopoverPosition[_centerCenterRightBottom], 'Center center right bottom'],
				]}
				labelText="Position"
				selectedValues={[position()]}
				onSelectedItemsChanged={(items) => setPosition(items[0][0] as PopoverPosition)}
			/>
			<NumberTextField
				style={{width: '100px'}}
				value={gap()}
				min={0}
				onBlur={(ev) => setGap(g => safeNumber(ev[_currentTarget][_valueAsNumber], g))}
				labelText="Gap"
			/>
			<Show when={[
				PopoverPosition[_centerTopToRight],
				PopoverPosition[_centerCenterLeft],
				PopoverPosition[_centerBottomToRight],
				PopoverPosition[_centerTopToLeft],
				PopoverPosition[_centerCenterRight],
				PopoverPosition[_centerBottomToLeft],
				PopoverPosition[_leftCenterToBottom],
				PopoverPosition[_centerCenterLeftTop],
				PopoverPosition[_centerCenterTop],
				PopoverPosition[_centerCenterRightTop],
				PopoverPosition[_rightCenterToBottom],
				PopoverPosition[_leftCenterToTop],
				PopoverPosition[_centerCenterLeftBottom],
				PopoverPosition[_centerCenterBottom],
				PopoverPosition[_centerCenterRightBottom],
				PopoverPosition[_rightCenterToTop]
			][_includes](position())}>
				<NumberTextField
					value={padding()}
					style={{width: '100px'}}
					min={0}
					onBlur={(ev) => setPadding(p => safeNumber(ev[_currentTarget][_valueAsNumber], p))}
					labelText="Padding"
				/>
			</Show>
			<CheckBox
				checked={anchor()}
				onChange={ev => setAnchor(ev[_currentTarget][_checked])}>
				Anchor
			</CheckBox>
			<CheckBox
				checked={dragable()}
				onChange={ev => setDragable(ev[_currentTarget][_checked])}>
				Dragable
			</CheckBox>
			<CheckBox
				checked={allowHideAnchor()}
				onChange={ev => setAllowHideAnchor(ev[_currentTarget][_checked])}>
				Allow hide anchor
			</CheckBox>
			<CheckBox
				checked={manualDismiss()}
				onChange={ev => setManualDismiss(ev[_currentTarget][_checked])}>
				Manual dismiss
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _