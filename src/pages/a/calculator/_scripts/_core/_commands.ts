import { Commands } from "../_shared/_commands"
import { insertKeyBackspace, insertKeyChar, insertKeyClear, insertKeyEqual, insertKeyPlusMinus, insertKeySwap } from "./_key-input"
import { clearMemory, recallMemory, updateMemory } from "./_memory"
import { SettingsStore } from "./_settings"

function _initCommandsEvents(): void {
	document.body.addEventListener('click', ev => {
		const $target = ev.target as HTMLElement
		if (!$target) return

		const target = $target.closest(`[data-command]`) as HTMLElement
		if (!target) return

		const dataset = target.dataset
		const type = dataset.command as Commands
		switch (type) {
		case Commands.memo_add:
			updateMemory('add')
			break
		case Commands.memo_sub:
			updateMemory('min')
			break
		case Commands.memo_recall:
			recallMemory()
			break
		case Commands.memo_clear:
			clearMemory()
			break
		case Commands.key_char: {
			const char = dataset.char
			if (!char) break

			insertKeyChar(char)
		}; break
		case Commands.key_dec:
			insertKeyChar(SettingsStore.value.decimalFormat)
			break
		case Commands.key_plusMin:
			insertKeyPlusMinus()
			break
		case Commands.key_clear:
			insertKeyClear()
			break
		case Commands.key_backspace:
			insertKeyBackspace()
			break
		case Commands.key_equal:
			insertKeyEqual()
			break
		case Commands.key_unitSwap:
			insertKeySwap()
			break
		}
	})
}

export default () => {
	_initCommandsEvents()
}