import * as Commands from "../shared/commands.enum.js"
import * as Settings from "./settings.js"
import { insertKeyBackspace, insertKeyChar, insertKeyClear, insertKeyEqual, insertKeyPlusMinus, insertKeySwap } from "./key-input.js"
import { clearMemory, recallMemory, updateMemory } from "./memory.js"
import { delegateEvent } from "@/utils/event-registry.js"

function _initCommandsEvents(): void {
	delegateEvent(document.body, 'click', ev => {
		const $target = ev.target as HTMLElement
		if (!$target) return

		const target = $target.closest(`[data-command]`) as HTMLElement
		if (!target) return

		const dataset = target.dataset
		const type = dataset.command as (typeof Commands[keyof typeof Commands])
		switch (type) {
		case Commands.MemoryAdd:
			updateMemory('add')
			break
		case Commands.MemorySubtract:
			updateMemory('min')
			break
		case Commands.MemoryRecall:
			recallMemory()
			break
		case Commands.MemoryClear:
			clearMemory()
			break
		case Commands.KeyChar: {
			const char = dataset.char
			if (!char) break

			insertKeyChar(char)
		}; break
		case Commands.KeyDec:
			insertKeyChar(Settings.sg_decimalFormat())
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