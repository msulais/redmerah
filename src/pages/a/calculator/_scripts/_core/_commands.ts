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
		case Commands.MemoAdd:
			updateMemory('add')
			break
		case Commands.MemoSub:
			updateMemory('min')
			break
		case Commands.MemoRecall:
			recallMemory()
			break
		case Commands.MemoClear:
			clearMemory()
			break
		case Commands.KeyChar: {
			const char = dataset.char
			if (!char) break

			insertKeyChar(char)
		}; break
		case Commands.KeyDec:
			insertKeyChar(SettingsStore.value.decimalFormat)
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
		case Commands.KeyEqual:
			insertKeyEqual()
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