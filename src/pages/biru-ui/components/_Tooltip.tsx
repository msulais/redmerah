import { createSignal, For, type VoidComponent } from "solid-js"

import { numberSafe } from "@/utils/number"

import { Tooltip, TooltipPosition } from "@/components/Tooltip"
import Button from "@/components/Button"
import CheckBox from "@/components/CheckBox"
import { NumberTextField } from "@/components/TextField"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import Icon from "@/components/Icon"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
	const [useAnchor, setUseAnchor] = createSignal<boolean>(false)
	const [position, setPosition] = createSignal<TooltipPosition>(TooltipPosition.centerTop)
	const [gap, setGap] = createSignal<number>(40)
	const [startDelayDuration, setStartDelayDuration] = createSignal<number>(500)
	const [endDelayDuration, setEndDelayDuration] = createSignal<number>(500)

	return (<Page
		title="Tooltip"
		description="A tooltip is a small, temporary window that appears when a user hovers over an element. It provides a brief explanation or description of the element's purpose or function. Tooltips are often used to clarify the meaning of icons, buttons, or other UI elements.">
		<Playground>
			<Tooltip
				c:endDelayDuration={endDelayDuration()}
				c:gap={gap()}
				c:position={position()}
				c:startDelayDuration={startDelayDuration()}
				c:useAnchor={useAnchor()}>
				<Button data-tooltip="This is tooltip">
					Hover me please
					<Icon data-tooltip="This is icon" c:code={0xE4B2}/>
				</Button>
			</Tooltip>
		</Playground>
		<PlaygroundOptions>
			<Tooltip>
				<Dropdown
					c:label="Position"
					c:values={[position()]}
					c:onChange={(options) => setPosition(options[0].value as TooltipPosition)}>
					<For each={[
						[TooltipPosition.leftTop, 'Left top'],
						[TooltipPosition.leftCenterToBottom, 'Left center to bottom'],
						[TooltipPosition.leftCenter, 'Left center'],
						[TooltipPosition.leftCenterToTop, 'Left center to top'],
						[TooltipPosition.leftBottom, 'Left bottom'],
						[TooltipPosition.rightTop, 'Right top'],
						[TooltipPosition.rightCenterToBottom, 'Right center to bottom'],
						[TooltipPosition.rightCenter, 'Right center'],
						[TooltipPosition.rightCenterToTop, 'Right center to top'],
						[TooltipPosition.rightBottom, 'Right bottom'],
						[TooltipPosition.centerTopToRight, 'Center top to right'],
						[TooltipPosition.centerTop, 'Center top'],
						[TooltipPosition.centerTopToLeft, 'Center top to left'],
						[TooltipPosition.centerBottomToRight, 'Center bottom to right'],
						[TooltipPosition.centerBottom, 'Center bottom'],
						[TooltipPosition.centerBottomToLeft, 'Center bottom to left'],
						[TooltipPosition.centerCenterLeftTop, 'Center center left top'],
						[TooltipPosition.centerCenterLeft, 'Center center left'],
						[TooltipPosition.centerCenterLeftBottom, 'Center center left bottom'],
						[TooltipPosition.centerCenterTop, 'Center center top'],
						[TooltipPosition.centerCenter, 'Center center'],
						[TooltipPosition.centerCenterBottom, 'Center center bottom'],
						[TooltipPosition.centerCenterRightTop, 'Center center right top'],
						[TooltipPosition.centerCenterRight, 'Center center right'],
						[TooltipPosition.centerCenterRightBottom, 'Center center right bottom'],
					]}>{option => <DropdownOption c:value={option[0]} c:text={option[1] as string} />}</For>
				</Dropdown>
				<NumberTextField
					style={{width: '100px'}}
					value={gap()}
					min={0}
					onBlur={(ev) => setGap(g => numberSafe(ev.currentTarget.valueAsNumber, g))}
					c:label="Gap"
				/>
				<NumberTextField
					style={{width: '100px'}}
					value={startDelayDuration()}
					min={0}
					step={100}
					onBlur={(ev) => setStartDelayDuration(d => numberSafe(ev.currentTarget.valueAsNumber, d))}
					c:label="Start delay duration"
				/>
				<NumberTextField
					style={{width: '100px'}}
					value={endDelayDuration()}
					min={0}
					step={100}
					onBlur={(ev) => setEndDelayDuration(d => numberSafe(ev.currentTarget.valueAsNumber, d))}
					c:label="End delay duration"
				/>
				<CheckBox
					checked={useAnchor()}
					onChange={ev => setUseAnchor(ev.currentTarget.checked)}>
					Use anchor
				</CheckBox>
			</Tooltip>
		</PlaygroundOptions>
	</Page>)
}

export default _