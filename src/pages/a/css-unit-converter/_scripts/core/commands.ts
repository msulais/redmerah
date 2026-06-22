import * as Commands from "../shared/commands.enum.js"
import { insertKeyBackspace, insertKeyChar, insertKeyClear, insertKeyPlusMinus, insertKeySwap } from "./key-input.js"

function _initCommandsEvents(): void {
	document.body.addEventListener('click', ev => {
		const $target = ev.target as HTMLElement
		if (!$target) return

		const target = $target.closest(`[data-command]`) as HTMLElement
		if (!target) return

		const dataset = target.dataset
		const type = dataset.command as (typeof Commands[keyof typeof Commands])
		switch (type) {
		case Commands.KeyChar: {
			const char = dataset.char
			if (!char) break

			insertKeyChar(char)
		}; break
		case Commands.KeyDec:
			insertKeyChar('.')
			break
		case Commands.KeyPlusMin:
			insertKeyPlusMinus()
			break
		case Commands.KeyClear:
			insertKeyClear()
			break
		case Commands.KeyBackspace:
			insertKeyBackspace()
			break
		case Commands.KeyUnitSwap:
			insertKeySwap()
			break
		}
	})
}

export default () => {
	_initCommandsEvents()
}