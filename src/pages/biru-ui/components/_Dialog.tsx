import { createSignal, Show, type VoidComponent } from "solid-js"

import { _tonal, _filled, _currentTarget, _value, _checked } from "@/constants/string"

import Button, { ButtonVariant } from "@/components/Button"
import CheckBox from "@/components/CheckBox"
import TextField from "@/components/TextField"
import Dialog, { closeDialog, openDialog } from "@/components/Dialog"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
	const [important, setImportant] = createSignal<boolean>(false)
	const [inputAutoFocus, setInputAutoFocus] = createSignal<boolean>(false)
	const [hasHeader, setHasHeader] = createSignal<boolean>(true)
	const [hasActions, setHasActions] = createSignal<boolean>(true)
	const [hasContent, setHasContent] = createSignal<boolean>(true)
	const [headerText, setHeaderText] = createSignal<string>('Header')
	const [contentText, setContentText] = createSignal<string>('Cupidatat aliqua est quis enim commodo. Aute Lorem occaecat commodo nisi amet dolor ut cupidatat qui ipsum magna in. In aliquip voluptate nulla aliquip duis cillum consectetur eiusmod adipisicing reprehenderit officia reprehenderit adipisicing dolor.')
	let dialog_ref: HTMLDialogElement

	return (<Page
		title="Dialog"
		description="A dialog is an overlay window that interrupts the user's main workflow to deliver important information or request user input. It typically contains a title, content area, and buttons for user actions.">
		<Playground>
			<Button
				variant={ButtonVariant[_tonal]}
				onClick={(ev) => openDialog(ev, dialog_ref, {
					important: important(),
					inputAutoFocus: inputAutoFocus()
				})}>
				Open dialog
			</Button>
			<Dialog
				style={{width: '500px'}}
				ref={r => dialog_ref = r}
				header={<Show when={hasHeader()}>{headerText()}</Show>}
				actions={<Show when={hasActions()}>
					<Button variant={ButtonVariant[_tonal]} onClick={() => closeDialog(dialog_ref)}>Close</Button>
					<Button variant={ButtonVariant[_tonal]}>Options</Button>
					<Button variant={ButtonVariant[_filled]} onClick={() => closeDialog(dialog_ref)}>Accept</Button>
				</Show>}>
				<Show when={hasContent()}>
					{contentText()}
					<div style={{height: '16px'}}/>
					<TextField labelText="Some input"/>
				</Show>
			</Dialog>
		</Playground>
		<PlaygroundOptions>
			<Show when={hasHeader()}>
				<TextField labelText="Header text" value="Header" onInput={ev => setHeaderText(ev[_currentTarget][_value])}/>
			</Show>
			<Show when={hasContent()}>
				<TextField labelText="Content text" value="Cupidatat aliqua est quis enim commodo. Aute Lorem occaecat commodo nisi amet dolor ut cupidatat qui ipsum magna in. In aliquip voluptate nulla aliquip duis cillum consectetur eiusmod adipisicing reprehenderit officia reprehenderit adipisicing dolor." onInput={ev => setContentText(ev[_currentTarget][_value])}/>
			</Show>
			<CheckBox
				checked={important()}
				onChange={ev => setImportant(ev[_currentTarget][_checked])}>
				Important
			</CheckBox>
			<CheckBox
				checked={inputAutoFocus()}
				onChange={ev => setInputAutoFocus(ev[_currentTarget][_checked])}>
				Input autofocus
			</CheckBox>
			<CheckBox
				checked={hasHeader()}
				onChange={ev => setHasHeader(ev[_currentTarget][_checked])}>
				Header
			</CheckBox>
			<CheckBox
				checked={hasActions()}
				onChange={ev => setHasActions(ev[_currentTarget][_checked])}>
				Actions
			</CheckBox>
			<CheckBox
				checked={hasContent()}
				onChange={ev => setHasContent(ev[_currentTarget][_checked])}>
				Content
			</CheckBox>
		</PlaygroundOptions>
	</Page>)
}

export default _