import { createSignal, Show, type VoidComponent } from "solid-js"

import { stopPropagation } from "@/utils/event"

import Icon from "@/components/Icon"
import List from "@/components/List"
import { IconButton } from "@/components/Button"
import CheckBox from "@/components/CheckBox"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
	const [title, setTitle] = createSignal<boolean>(true)
	const [subtitle, setSubtitle] = createSignal<boolean>(false)
	const [leading, setLeading] = createSignal<boolean>(false)
	const [trailing, setTrailing] = createSignal<boolean>(false)
	return (<Page
		title="List"
		description="A list is a UI element that displays a collection of items in a sequential order. It typically includes components like title, subtitle, leading icon (placed before the title), and trailing buttons (placed after the title).">
		<Playground>
			<List
				subtitle={<Show when={subtitle()}>Deserunt commodo qui aute veniam tempor ipsum.</Show>}
				leading={<Show when={leading()}><Icon code={0xE569}/></Show>}
				trailing={<Show when={trailing()}>
					<IconButton onClick={ev => stopPropagation(ev)} code={0xE6BF}/>
					<IconButton onClick={ev => stopPropagation(ev)} code={0xEBB8}/>
				</Show>}>
				<Show when={title()}>
					Amet ad ad sint deserunt fugiat
				</Show>
			</List>
			<List
				subtitle={<Show when={subtitle()}>Anim ea ad dolor pariatur laboris et ipsum nisi aute eu eu.</Show>}
				leading={<Show when={leading()}><Icon code={0xE569}/></Show>}
				trailing={<Show when={trailing()}>
					<IconButton onClick={ev => stopPropagation(ev)} code={0xE6BF}/>
					<IconButton onClick={ev => stopPropagation(ev)} code={0xEBB8}/>
				</Show>}>
				<Show when={title()}>
					Tempor ut est adipisicing amet laborum
				</Show>
			</List>
			<List
				subtitle={<Show when={subtitle()}>Culpa elit enim aliquip aliqua est et adipisicing Lorem laboris nulla.</Show>}
				leading={<Show when={leading()}><Icon code={0xE569}/></Show>}
				trailing={<Show when={trailing()}>
					<IconButton onClick={ev => stopPropagation(ev)} code={0xE6BF}/>
					<IconButton onClick={ev => stopPropagation(ev)} code={0xEBB8}/>
				</Show>}>
				<Show when={title()}>
					Aute commodo eiusmod exercitation nulla amet
				</Show>
			</List>
		</Playground>
		<PlaygroundOptions>
			<CheckBox value={title()} onValueChanged={(v) => setTitle(v)}>Title</CheckBox>
			<CheckBox value={subtitle()} onValueChanged={(v) => setSubtitle(v)}>Subtitle</CheckBox>
			<CheckBox value={leading()} onValueChanged={(v) => setLeading(v)}>Leading</CheckBox>
			<CheckBox value={trailing()} onValueChanged={(v) => setTrailing(v)}>Trailing</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _