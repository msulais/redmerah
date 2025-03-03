import { createSignal, Show, type VoidComponent } from "solid-js"

import Button, { ButtonVariant } from "@/components/Button"
import CheckBox from "@/components/CheckBox"
import TextField from "@/components/TextField"
import Dialog, { closeDialog, openDialog } from "@/components/Dialog"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
	const [important, setImportant] = createSignal<boolean>(false)
	const [contentAutoFocus, setContentAutoFocus] = createSignal<boolean>(false)
	const [hasHeader, setHasHeader] = createSignal<boolean>(true)
	const [hasActions, setHasActions] = createSignal<boolean>(true)
	const [hasContent, setHasContent] = createSignal<boolean>(true)
	const [headerText, setHeaderText] = createSignal<string>('Header')
	const [contentText, setContentText] = createSignal<string>('Cupidatat aliqua est quis enim commodo. Aute Lorem occaecat commodo nisi amet dolor ut cupidatat qui ipsum magna in. In aliquip voluptate nulla aliquip duis cillum consectetur eiusmod adipisicing reprehenderit officia reprehenderit adipisicing dolor.')
	let dialogRef: HTMLDialogElement

	return (<Page
		title="Dialog"
		description="A dialog is an overlay window that interrupts the user's main workflow to deliver important information or request user input. It typically contains a title, content area, and buttons for user actions.">
		<Playground>
			<Button
				c:variant={ButtonVariant.tonal}
				onClick={() => openDialog(dialogRef, {
					important: important(),
					contentAutoFocus: contentAutoFocus()
				})}>
				Open dialog
			</Button>
			<Dialog
				style={{width: '500px'}}
				ref={r => dialogRef = r}
				c:header={<Show when={hasHeader()}>{headerText()}</Show>}
				c:actions={<Show when={hasActions()}>
					<Button c:variant={ButtonVariant.tonal} onClick={() => closeDialog(dialogRef)}>Close</Button>
					<Button c:variant={ButtonVariant.tonal}>Options</Button>
					<Button c:variant={ButtonVariant.filled} onClick={() => closeDialog(dialogRef)}>Accept</Button>
				</Show>}>
				<Show when={hasContent()}>
					{contentText()}
					<div style={{height: '16px'}}/>
					<TextField c:label="Some input"/>
				</Show>
			</Dialog>
		</Playground>
		<PlaygroundOptions>
			<Show when={hasHeader()}>
				<TextField c:label="Header text" value="Header" onInput={ev => setHeaderText(ev.currentTarget.value)}/>
			</Show>
			<Show when={hasContent()}>
				<TextField c:label="Content text" value="Cupidatat aliqua est quis enim commodo. Aute Lorem occaecat commodo nisi amet dolor ut cupidatat qui ipsum magna in. In aliquip voluptate nulla aliquip duis cillum consectetur eiusmod adipisicing reprehenderit officia reprehenderit adipisicing dolor." onInput={ev => setContentText(ev.currentTarget.value)}/>
			</Show>
			<CheckBox
				checked={important()}
				onChange={ev => setImportant(ev.currentTarget.checked)}>
				Important
			</CheckBox>
			<CheckBox
				checked={contentAutoFocus()}
				onChange={ev => setContentAutoFocus(ev.currentTarget.checked)}>
				Content autofocus
			</CheckBox>
			<CheckBox
				checked={hasHeader()}
				onChange={ev => setHasHeader(ev.currentTarget.checked)}>
				Header
			</CheckBox>
			<CheckBox
				checked={hasActions()}
				onChange={ev => setHasActions(ev.currentTarget.checked)}>
				Actions
			</CheckBox>
			<CheckBox
				checked={hasContent()}
				onChange={ev => setHasContent(ev.currentTarget.checked)}>
				Content
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _