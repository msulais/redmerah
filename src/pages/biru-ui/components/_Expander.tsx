import { createSignal, For, Show, type VoidComponent } from "solid-js"

import { eventCurrentTarget, eventStopPropagation } from "@/utils/event"

import Icon from "@/components/Icon"
import { IconButton } from "@/components/Button"
import CheckBox from "@/components/CheckBox"
import Tooltip from "@/components/Tooltip"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import Expander, { ExpanderHeader, ExpanderVariant } from "@/components/Expander"
import { Page, Playground, PlaygroundOptions } from "../_Body"
import { ICON_HISTORY, ICON_INFO, ICON_OPEN } from "@/constants/icons"

const _: VoidComponent = () => {
	const [title, setTitle] = createSignal<boolean>(true)
	const [subtitle, setSubtitle] = createSignal<boolean>(false)
	const [leading, setLeading] = createSignal<boolean>(false)
	const [trailing, setTrailing] = createSignal<boolean>(false)
	const [useExpandIcon, setUseExpandIcon] = createSignal<boolean>(true)
	const [variant, setVariant] = createSignal<ExpanderVariant>(ExpanderVariant.tonal)
	const [content, setContent] = createSignal<boolean>(true)
	return (<Page
		title="Expander"
		description="An expander is a UI element that allows users to reveal or collapse hidden content within a list item.">
		<Playground>
			<Tooltip>
				<Expander
					c:header={<ExpanderHeader
						c:useExpandIcon={useExpandIcon()}
						c:subtitle={<Show when={subtitle()}>Deserunt commodo qui aute veniam tempor ipsum.</Show>}
						c:leading={<Show when={leading()}><Icon c:code={ICON_INFO}/></Show>}
						c:trailing={<Show when={trailing()}>
							<IconButton onClick={ev => eventStopPropagation(ev)} c:code={ICON_HISTORY}/>
							<IconButton onClick={ev => eventStopPropagation(ev)} c:code={ICON_OPEN}/>
						</Show>}>
						<Show when={title()}>Click to expand</Show>
					</ExpanderHeader>}
					c:variant={variant()}>
					<Show when={content()}>
						<p style={{"margin-bottom": '1.15em'}}>Deserunt sint voluptate nisi reprehenderit anim veniam ex quis deserunt ad. Aute duis commodo veniam incididunt aute anim anim et. Ipsum exercitation ea minim voluptate veniam ad duis dolore. Do officia amet adipisicing ea incididunt labore ipsum commodo minim. Quis ipsum dolor non sunt magna ad aliqua. Ea minim reprehenderit sint exercitation nostrud veniam nisi sit. Ut et culpa occaecat proident id sint officia anim adipisicing.</p>
						<p>Qui culpa cillum sunt sit in dolore ullamco excepteur ipsum ex do ut reprehenderit. Magna dolor excepteur velit ullamco laboris. Esse nulla qui sit enim et ex ullamco tempor eiusmod voluptate eiusmod non dolore. Aliquip mollit tempor id qui do consequat occaecat mollit. Voluptate nisi deserunt ipsum quis eiusmod tempor culpa excepteur tempor velit deserunt.</p>
					</Show>
				</Expander>
			</Tooltip>
		</Playground>
		<PlaygroundOptions>
			<Dropdown
				c:label="Variant"
				c:values={[variant()]}
				c:onChange={(items) => setVariant(items[0].value as ExpanderVariant)}>
				<For each={[
					[ExpanderVariant.filled, 'Filled'],
					[ExpanderVariant.tonal, 'Tonal'],
					[ExpanderVariant.outlined, 'Outlined'],
					[ExpanderVariant.transparent, 'Transparent'],
				]}>{option => <DropdownOption c:value={option[0]} c:text={option[1] as string} />}</For>
			</Dropdown>
			<CheckBox
				checked={title()}
				onChange={ev => setTitle(eventCurrentTarget(ev).checked)}>
				Title
			</CheckBox>
			<CheckBox
				checked={subtitle()}
				onChange={ev => setSubtitle(eventCurrentTarget(ev).checked)}>
				Subtitle
			</CheckBox>
			<CheckBox
				checked={leading()}
				onChange={ev => setLeading(eventCurrentTarget(ev).checked)}>
				Leading
			</CheckBox>
			<CheckBox
				checked={trailing()}
				onChange={ev => setTrailing(eventCurrentTarget(ev).checked)}>
				Trailing
			</CheckBox>
			<CheckBox
				checked={useExpandIcon()}
				onChange={ev => setUseExpandIcon(eventCurrentTarget(ev).checked)}>
				Show expand icon
			</CheckBox>
			<CheckBox
				checked={content()}
				onChange={ev => setContent(eventCurrentTarget(ev).checked)}>
				Content
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _