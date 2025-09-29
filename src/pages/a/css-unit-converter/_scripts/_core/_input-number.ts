import { $$$ } from "./_dom-utils"

const _refs_input = $$$<HTMLInputElement>('input[type=number]')

// [value] attribute in <input> causing a bug when value has decimal symbol
function _removeInputValueAttribute(): void {
	for (const ref of _refs_input) {
		const value = ref.valueAsNumber
		ref.removeAttribute('value')
		ref.valueAsNumber = value
	}
}

export default () => {
	_removeInputValueAttribute()
}