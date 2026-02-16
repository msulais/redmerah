export enum Commands {
	// memo = memory
	MemoAdd = 'memo-add',
	MemoSub = 'memo-subtract',
	MemoRecall = 'memo-recall',
	MemoClear = 'memo-clear',

	/** @param char `string` */
	KeyChar = 'key-char',
	KeyDec = 'key-decimal',
	KeyPlusMin = 'key-plus-min',
	KeyClear = 'key-clear',
	KeyBackspace = 'key-backspace',
	KeyEqual = 'key-equal',
	KeyUnitSwap = 'key-unit-swap',
}