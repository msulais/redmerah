import { Commands } from "../_shared/_commands"
import { insertKeyBackspace, insertKeyChar, insertKeyClear, insertKeyEqual, insertKeyPlusMinus, insertKeySwap } from "./_key-input"
import { clearMemory, recallMemory, updateMemeory } from "./_memory"
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
		case Commands.memoryAdd:
			updateMemeory('add')
			break
		case Commands.memorySubtract:
			updateMemeory('min')
			break
		case Commands.memoryRecall:
			recallMemory()
			break
		case Commands.memoryClear:
			clearMemory()
			break
		case Commands.keyChar: {
			const char = dataset.char
			if (!char) break

			insertKeyChar(char)
		}; break
		case Commands.keyDecimal:
			insertKeyChar(SettingsStore.value.decimalFormat)
			break
		case Commands.keyPlusMinus:
			insertKeyPlusMinus()
			break
		case Commands.keyClear:
			insertKeyClear()
			break
		case Commands.keyBackspace:
			insertKeyBackspace()
			break
		case Commands.keyEqual:
			insertKeyEqual()
			break
		case Commands.keyUnitSwap:
			insertKeySwap()
			break
		}
	})
}

export default () => {
	_initCommandsEvents()
}