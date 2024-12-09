import { createSignal, For, Show, type VoidComponent } from "solid-js"

import { event_stop_propagation } from "@/utils/event"

import Icon from "@/components/Icon"
import { IconButton } from "@/components/Button"
import CheckBox from "@/components/CheckBox"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import Expander, { ExpanderHeader, ExpanderVariant } from "@/components/Expander"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
	const [title, set_title] = createSignal<boolean>(true)
	const [subtitle, set_subtitle] = createSignal<boolean>(false)
	const [leading, set_leading] = createSignal<boolean>(false)
	const [trailing, set_trailing] = createSignal<boolean>(false)
	const [use_expand_icon, set_use_expand_icon] = createSignal<boolean>(true)
	const [variant, set_variant] = createSignal<ExpanderVariant>(ExpanderVariant.tonal)
	const [content, set_content] = createSignal<boolean>(true)
	return (<Page
		title="Expander"
		description="An expander is a UI element that allows users to reveal or collapse hidden content within a list item.">
		<Playground>
			<Expander
				header={<ExpanderHeader
					use_expand_icon={use_expand_icon()}
					subtitle={<Show when={subtitle()}>Deserunt commodo qui aute veniam tempor ipsum.</Show>}
					leading={<Show when={leading()}><Icon code={0xE569}/></Show>}
					trailing={<Show when={trailing()}>
						<IconButton onClick={ev => event_stop_propagation(ev)} code={0xE6BF}/>
						<IconButton onClick={ev => event_stop_propagation(ev)} code={0xEBB8}/>
					</Show>}>
					<Show when={title()}>Click to expand</Show>
				</ExpanderHeader>}
				variant={variant()}>
				<Show when={content()}>
					<p style={{"margin-bottom": '1.15em'}}>Deserunt sint voluptate nisi reprehenderit anim veniam ex quis deserunt ad. Aute duis commodo veniam incididunt aute anim anim et. Ipsum exercitation ea minim voluptate veniam ad duis dolore. Do officia amet adipisicing ea incididunt labore ipsum commodo minim. Quis ipsum dolor non sunt magna ad aliqua. Ea minim reprehenderit sint exercitation nostrud veniam nisi sit. Ut et culpa occaecat proident id sint officia anim adipisicing.</p>
					<p>Qui culpa cillum sunt sit in dolore ullamco excepteur ipsum ex do ut reprehenderit. Magna dolor excepteur velit ullamco laboris. Esse nulla qui sit enim et ex ullamco tempor eiusmod voluptate eiusmod non dolore. Aliquip mollit tempor id qui do consequat occaecat mollit. Voluptate nisi deserunt ipsum quis eiusmod tempor culpa excepteur tempor velit deserunt.</p>
				</Show>
			</Expander>
		</Playground>
		<PlaygroundOptions>
			<Dropdown
				label="Variant"
				values={[variant()]}
				on_change_options={(items) => set_variant(items[0].value as ExpanderVariant)}>
				<For each={[
					[ExpanderVariant.filled, 'Filled'],
					[ExpanderVariant.tonal, 'Tonal'],
					[ExpanderVariant.outlined, 'Outlined'],
					[ExpanderVariant.transparent, 'Transparent'],
				]}>{option => <DropdownOption value={option[0]} text={option[1] as string} />}</For>
			</Dropdown>
			<CheckBox
				checked={title()}
				onChange={ev => set_title(ev.currentTarget.checked)}>
				Title
			</CheckBox>
			<CheckBox
				checked={subtitle()}
				onChange={ev => set_subtitle(ev.currentTarget.checked)}>
				Subtitle
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
				checked={use_expand_icon()}
				onChange={ev => set_use_expand_icon(ev.currentTarget.checked)}>
				Show expand icon
			</CheckBox>
			<CheckBox
				checked={content()}
				onChange={ev => set_content(ev.currentTarget.checked)}>
				Content
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _