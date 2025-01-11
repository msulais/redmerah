import { createSignal, Show, type VoidComponent } from "solid-js"

import { event_current_target, event_stop_propagation } from "@/utils/event"

import Icon from "@/components/Icon"
import List from "@/components/List"
import { IconButton } from "@/components/Button"
import CheckBox from "@/components/CheckBox"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
	const [title, set_title] = createSignal<boolean>(true)
	const [subtitle, set_subtitle] = createSignal<boolean>(false)
	const [leading, set_leading] = createSignal<boolean>(false)
	const [trailing, set_trailing] = createSignal<boolean>(false)
	return (<Page
		title="List"
		description="A list is a UI element that displays a collection of items in a sequential order. It typically includes components like title, subtitle, leading icon (placed before the title), and trailing buttons (placed after the title).">
		<Playground>
			<List
				c_subtitle={<Show when={subtitle()}>Deserunt commodo qui aute veniam tempor ipsum.</Show>}
				c_leading={<Show when={leading()}><Icon c_code={0xE569}/></Show>}
				c_trailing={<Show when={trailing()}>
					<IconButton onClick={ev => event_stop_propagation(ev)} c_code={0xE6BF}/>
					<IconButton onClick={ev => event_stop_propagation(ev)} c_code={0xEBB8}/>
				</Show>}>
				<Show when={title()}>
					Amet ad ad sint deserunt fugiat
				</Show>
			</List>
			<List
				c_subtitle={<Show when={subtitle()}>Anim ea ad dolor pariatur laboris et ipsum nisi aute eu eu.</Show>}
				c_leading={<Show when={leading()}><Icon c_code={0xE569}/></Show>}
				c_trailing={<Show when={trailing()}>
					<IconButton onClick={ev => event_stop_propagation(ev)} c_code={0xE6BF}/>
					<IconButton onClick={ev => event_stop_propagation(ev)} c_code={0xEBB8}/>
				</Show>}>
				<Show when={title()}>
					Tempor ut est adipisicing amet laborum
				</Show>
			</List>
			<List
				c_subtitle={<Show when={subtitle()}>Culpa elit enim aliquip aliqua est et adipisicing Lorem laboris nulla.</Show>}
				c_leading={<Show when={leading()}><Icon c_code={0xE569}/></Show>}
				c_trailing={<Show when={trailing()}>
					<IconButton onClick={ev => event_stop_propagation(ev)} c_code={0xE6BF}/>
					<IconButton onClick={ev => event_stop_propagation(ev)} c_code={0xEBB8}/>
				</Show>}>
				<Show when={title()}>
					Aute commodo eiusmod exercitation nulla amet
				</Show>
			</List>
		</Playground>
		<PlaygroundOptions>
			<CheckBox
				checked={title()}
				onChange={ev => set_title(event_current_target(ev).checked)}>
				Title
			</CheckBox>
			<CheckBox
				checked={subtitle()}
				onChange={ev => set_subtitle(event_current_target(ev).checked)}>
				Subtitle
			</CheckBox>
			<CheckBox
				checked={leading()}
				onChange={ev => set_leading(event_current_target(ev).checked)}>
				Leading
			</CheckBox>
			<CheckBox
				checked={trailing()}
				onChange={ev => set_trailing(event_current_target(ev).checked)}>
				Trailing
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _