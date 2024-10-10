import { createSignal, Show, type VoidComponent } from "solid-js"

import { _checked, _currentTarget, _slice } from "@/constants/string"

import CheckBox from "@/components/CheckBox"
import { NumberTextField } from "@/components/TextField"
import Dropdown, { DropdownDivider, DropdownHeader, DropdownItem, type Item } from "@/components/Dropdown"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
	const [multiple, setMultiple] = createSignal<boolean>(false)
	const [header, setHeader] = createSignal<boolean>(true)
	const [footer, setFooter] = createSignal<boolean>(true)
	const [dividers, setDividers] = createSignal<boolean>(false)
	const [labels, setLabels] = createSignal<boolean>(false)
	const [readOnly, setReadOnly] = createSignal<boolean>(false)
	const [compact, setCompact] = createSignal<boolean>(false)
	const [count, setCount] = createSignal<number>(10)
	return (<Page
		title="Dropdown"
		description="A dropdown is a UI element that displays a list of options when clicked. It provides a compact way to present multiple choices while saving screen space.">
		<Playground>
			<Dropdown
				compact={compact()}
				items={[
					[0, 'Tiger'],
					[1, 'Lion'],
					[2, 'Girrafe'],
					[3, 'Duck'],
					[4, 'Shark'],
					[5, 'Chicken'],
					[6, 'Snail'],
					[7, 'Komodo'],
					[8, 'Orangutan'],
					[9, 'Fish'],
					[10, 'Bird']
				][_slice](0, count()) as Item[]}
				readOnly={readOnly()}
				multiple={multiple()}
				header={<Show when={header()}>
					<DropdownHeader>Animals</DropdownHeader>
					<DropdownDivider />
				</Show>}
				footer={<Show when={footer()}>
					<DropdownDivider />
					<DropdownItem iconCode={0xE007}>Add animal</DropdownItem>
					<DropdownItem iconCode={0xE59D}>Clear selected animals</DropdownItem>
				</Show>}
				dividerIndexs={dividers()? [1, 3, 8] : undefined}
				labels={labels()? [
					[1, 'label 1'],
					[3, 'label 2'],
					[8, 'label 3'],
				] : undefined}
				labelText="Animals"
				placeholder="Select animals"
			/>
		</Playground>
		<PlaygroundOptions>
			<NumberTextField labelText="Count" style={{width: '100px'}} value={10} min={1} max={10} onFinalValueChanged={(v) => setCount(v)}/>
			<CheckBox
				checked={multiple()}
				onChange={ev => setMultiple(ev[_currentTarget][_checked])}>
				Multiple
			</CheckBox>
			<CheckBox
				checked={header()}
				onChange={ev => setHeader(ev[_currentTarget][_checked])}>
				Header
			</CheckBox>
			<CheckBox
				checked={footer()}
				onChange={ev => setFooter(ev[_currentTarget][_checked])}>
				Footer
			</CheckBox>
			<CheckBox
				checked={dividers()}
				onChange={ev => setDividers(ev[_currentTarget][_checked])}>
				Dividers
			</CheckBox>
			<CheckBox
				checked={labels()}
				onChange={ev => setLabels(ev[_currentTarget][_checked])}>
				Labels
			</CheckBox>
			<CheckBox
				checked={readOnly()}
				onChange={ev => setReadOnly(ev[_currentTarget][_checked])}>
				Read only
			</CheckBox>
			<CheckBox
				checked={compact()}
				onChange={ev => setCompact(ev[_currentTarget][_checked])}>
				Compact
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _