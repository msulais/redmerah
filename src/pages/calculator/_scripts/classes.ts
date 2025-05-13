import type { ConverterUnitType } from "./_types"

export class ConverterUnit {
	name: string
	symbol: string
	value: number

	constructor (name: string, symbol: string, value: number) {
		this.name = name
		this.symbol = symbol
		this.value = value
	}

	equals(unit: ConverterUnit): boolean {
		return (
			unit.name == this.name
			&& unit.symbol == this.symbol
			&& unit.value == this.value
		)
	}

	get json(): ConverterUnitType {
		return {
			name: this.name,
			symbol: this.symbol,
			value: this.value
		}
	}

	static parseJSON(unit: ConverterUnitType): ConverterUnit {
		return new ConverterUnit(
			unit.name,
			unit.symbol,
			unit.value
		)
	}
}