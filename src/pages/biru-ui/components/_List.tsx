import { createSignal, Show, type VoidComponent } from "solid-js"

import { ICON_HISTORY, ICON_INFO, ICON_OPEN } from "@/constants/icons"

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
				c:subtitle={<Show when={subtitle()}>Deserunt commodo qui aute veniam tempor ipsum.</Show>}
				c:leading={<Show when={leading()}><Icon c:code={ICON_INFO}/></Show>}
				c:trailing={<Show when={trailing()}>
					<IconButton onClick={ev => ev.stopPropagation()} c:code={ICON_HISTORY}/>
					<IconButton onClick={ev => ev.stopPropagation()} c:code={ICON_OPEN}/>
				</Show>}>
				<Show when={title()}>
					Amet ad ad sint deserunt fugiat
				</Show>
			</List>
			<List
				c:subtitle={<Show when={subtitle()}>Anim ea ad dolor pariatur laboris et ipsum nisi aute eu eu.</Show>}
				c:leading={<Show when={leading()}><Icon c:code={ICON_INFO}/></Show>}
				c:trailing={<Show when={trailing()}>
					<IconButton onClick={ev => ev.stopPropagation()} c:code={ICON_HISTORY}/>
					<IconButton onClick={ev => ev.stopPropagation()} c:code={ICON_OPEN}/>
				</Show>}>
				<Show when={title()}>
					Tempor ut est adipisicing amet laborum
				</Show>
			</List>
			<List
				c:subtitle={<Show when={subtitle()}>Culpa elit enim aliquip aliqua est et adipisicing Lorem laboris nulla.</Show>}
				c:leading={<Show when={leading()}><Icon c:code={ICON_INFO}/></Show>}
				c:trailing={<Show when={trailing()}>
					<IconButton onClick={ev => ev.stopPropagation()} c:code={ICON_HISTORY}/>
					<IconButton onClick={ev => ev.stopPropagation()} c:code={ICON_OPEN}/>
				</Show>}>
				<Show when={title()}>
					Aute commodo eiusmod exercitation nulla amet
				</Show>
			</List>
		</Playground>
		<PlaygroundOptions>
			<CheckBox
				checked={title()}
				onChange={ev => setTitle(ev.currentTarget.checked)}>
				Title
			</CheckBox>
			<CheckBox
				checked={subtitle()}
				onChange={ev => setSubtitle(ev.currentTarget.checked)}>
				Subtitle
			</CheckBox>
			<CheckBox
				checked={leading()}
				onChange={ev => setLeading(ev.currentTarget.checked)}>
				Leading
			</CheckBox>
			<CheckBox
				checked={trailing()}
				onChange={ev => setTrailing(ev.currentTarget.checked)}>
				Trailing
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _