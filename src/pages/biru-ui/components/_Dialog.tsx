import { createSignal, Show, type VoidComponent } from "solid-js"

import Button, { ButtonVariant } from "@/components/Button"
import CheckBox from "@/components/CheckBox"
import TextField from "@/components/TextField"
import Dialog, { close_dialog, open_dialog } from "@/components/Dialog"
import { Page, Playground, PlaygroundOptions } from "../_Body"
import { event_current_target } from "@/utils/event"

const _: VoidComponent = () => {
	const [important, set_important] = createSignal<boolean>(false)
	const [content_autofocus, set_content_autofocus] = createSignal<boolean>(false)
	const [has_header, set_has_header] = createSignal<boolean>(true)
	const [has_actions, set_has_actions] = createSignal<boolean>(true)
	const [has_content, set_has_content] = createSignal<boolean>(true)
	const [header_text, set_header_text] = createSignal<string>('Header')
	const [content_text, set_content_text] = createSignal<string>('Cupidatat aliqua est quis enim commodo. Aute Lorem occaecat commodo nisi amet dolor ut cupidatat qui ipsum magna in. In aliquip voluptate nulla aliquip duis cillum consectetur eiusmod adipisicing reprehenderit officia reprehenderit adipisicing dolor.')
	let dialog_ref: HTMLDialogElement

	return (<Page
		title="Dialog"
		description="A dialog is an overlay window that interrupts the user's main workflow to deliver important information or request user input. It typically contains a title, content area, and buttons for user actions.">
		<Playground>
			<Button
				variant={ButtonVariant.tonal}
				onClick={(ev) => open_dialog(ev, dialog_ref, {
					important: important(),
					content_auto_focus: content_autofocus()
				})}>
				Open dialog
			</Button>
			<Dialog
				style={{width: '500px'}}
				ref={r => dialog_ref = r}
				header={<Show when={has_header()}>{header_text()}</Show>}
				actions={<Show when={has_actions()}>
					<Button variant={ButtonVariant.tonal} onClick={() => close_dialog(dialog_ref)}>Close</Button>
					<Button variant={ButtonVariant.tonal}>Options</Button>
					<Button variant={ButtonVariant.filled} onClick={() => close_dialog(dialog_ref)}>Accept</Button>
				</Show>}>
				<Show when={has_content()}>
					{content_text()}
					<div style={{height: '16px'}}/>
					<TextField label="Some input"/>
				</Show>
			</Dialog>
		</Playground>
		<PlaygroundOptions>
			<Show when={has_header()}>
				<TextField label="Header text" value="Header" onInput={ev => set_header_text(event_current_target(ev).value)}/>
			</Show>
			<Show when={has_content()}>
				<TextField label="Content text" value="Cupidatat aliqua est quis enim commodo. Aute Lorem occaecat commodo nisi amet dolor ut cupidatat qui ipsum magna in. In aliquip voluptate nulla aliquip duis cillum consectetur eiusmod adipisicing reprehenderit officia reprehenderit adipisicing dolor." onInput={ev => set_content_text(event_current_target(ev).value)}/>
			</Show>
			<CheckBox
				checked={important()}
				onChange={ev => set_important(event_current_target(ev).checked)}>
				Important
			</CheckBox>
			<CheckBox
				checked={content_autofocus()}
				onChange={ev => set_content_autofocus(event_current_target(ev).checked)}>
				Content autofocus
			</CheckBox>
			<CheckBox
				checked={has_header()}
				onChange={ev => set_has_header(event_current_target(ev).checked)}>
				Header
			</CheckBox>
			<CheckBox
				checked={has_actions()}
				onChange={ev => set_has_actions(event_current_target(ev).checked)}>
				Actions
			</CheckBox>
			<CheckBox
				checked={has_content()}
				onChange={ev => set_has_content(event_current_target(ev).checked)}>
				Content
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _