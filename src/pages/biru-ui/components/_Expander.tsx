import { createSignal, Show, splitProps, type JSX, type ParentComponent, type VoidComponent } from "solid-js"

import { _tonal, _filled, _outlined, _transparent, _checked, _currentTarget } from "@/constants/string"
import { stopPropagation } from "@/utils/event"

import Icon from "@/components/Icon"
import { IconButton } from "@/components/Button"
import CheckBox from "@/components/CheckBox"
import Dropdown from "@/components/Dropdown"
import Expander, { ExpanderHeader, ExpanderVariant } from "@/components/Expander"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
	const [title, setTitle] = createSignal<boolean>(true)
	const [subtitle, setSubtitle] = createSignal<boolean>(false)
	const [leading, setLeading] = createSignal<boolean>(false)
	const [trailing, setTrailing] = createSignal<boolean>(false)
	const [useExpandIcon, setUseExpandIcon] = createSignal<boolean>(true)
	const [variant, setVariant] = createSignal<ExpanderVariant>(ExpanderVariant[_tonal])
	const [content, setContent] = createSignal<boolean>(true)
	return (<Page
		title="Expander"
		description="An expander is a UI element that allows users to reveal or collapse hidden content within a list item.">
		<Playground>
			{/* <Expander

				variant={variant()}>
				<Show when={content()}>
					<p style={{"margin-bottom": '1.15em'}}>Deserunt sint voluptate nisi reprehenderit anim veniam ex quis deserunt ad. Aute duis commodo veniam incididunt aute anim anim et. Ipsum exercitation ea minim voluptate veniam ad duis dolore. Do officia amet adipisicing ea incididunt labore ipsum commodo minim. Quis ipsum dolor non sunt magna ad aliqua. Ea minim reprehenderit sint exercitation nostrud veniam nisi sit. Ut et culpa occaecat proident id sint officia anim adipisicing.</p>
					<p>Qui culpa cillum sunt sit in dolore ullamco excepteur ipsum ex do ut reprehenderit. Magna dolor excepteur velit ullamco laboris. Esse nulla qui sit enim et ex ullamco tempor eiusmod voluptate eiusmod non dolore. Aliquip mollit tempor id qui do consequat occaecat mollit. Voluptate nisi deserunt ipsum quis eiusmod tempor culpa excepteur tempor velit deserunt.</p>
				</Show>
			</Expander> */}
			<Expander
				header={<ExpanderHeader
					useExpandIcon={useExpandIcon()}
					subtitle={<Show when={subtitle()}>Deserunt commodo qui aute veniam tempor ipsum.</Show>}
					leading={<Show when={leading()}><Icon code={0xE569}/></Show>}
					trailing={<Show when={trailing()}>
						<IconButton onClick={ev => stopPropagation(ev)} code={0xE6BF}/>
						<IconButton onClick={ev => stopPropagation(ev)} code={0xEBB8}/>
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
				labelText="Variant"
				items={[
					[ExpanderVariant[_filled], 'Filled'],
					[ExpanderVariant[_tonal], 'Tonal'],
					[ExpanderVariant[_outlined], 'Outlined'],
					[ExpanderVariant[_transparent], 'Transparent'],
				]}
				selectedValues={[variant()]}
				onSelectedItemsChanged={(items) => setVariant(items[0][0] as ExpanderVariant)}
			/>
			<CheckBox
				checked={title()}
				onChange={ev => setTitle(ev[_currentTarget][_checked])}>
				Title
			</CheckBox>
			<CheckBox
				checked={subtitle()}
				onChange={ev => setSubtitle(ev[_currentTarget][_checked])}>
				Subtitle
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
				checked={useExpandIcon()}
				onChange={ev => setUseExpandIcon(ev[_currentTarget][_checked])}>
				Show expand icon
			</CheckBox>
			<CheckBox
				checked={content()}
				onChange={ev => setContent(ev[_currentTarget][_checked])}>
				Content
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _