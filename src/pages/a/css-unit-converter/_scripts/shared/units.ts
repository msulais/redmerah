export class ConverterUnit {
	readonly id: string
	readonly name: string
	readonly symbol: string
	readonly value: number

	constructor (id: string, name: string, symbol: string, value: number) {
		this.id = id
		this.name = name
		this.symbol = symbol
		this.value = value
	}

	equals(unit: ConverterUnit): boolean {
		return this.id === unit.id
	}
}

export namespace LengthUnits {
	// absolute unit
	export const px = new ConverterUnit('length-px', 'Pixel', "px", 1)
	export const inch = new ConverterUnit('length-in', 'Inch', "in", 1 / 96)
	export const cm = new ConverterUnit('length-cm', 'Centimeter', "cm", (1 / 96) * 2.54)
	export const mm = new ConverterUnit('length-mm', 'Millimeter', "mm", (1 / 96) * 25.4)
	export const pt = new ConverterUnit('length-pt', 'Point', "pt", 72 / 96)
	export const pc = new ConverterUnit('length-pc', 'Pico', "pc", 72 / (96 * 12))
	export const Q = new ConverterUnit('length-q', 'Quarter', "Q", 25.4 / 96 / 0.25)

	// relative unit
	export const rem = new ConverterUnit('length-rem', 'Relative font size', "rem", 0)
	export const percentage = new ConverterUnit('length-percentage', 'Percentage', '%', 0)
	export const vh = new ConverterUnit('length-vh', 'Viewport height', "vh", 0)
	export const vw = new ConverterUnit('length-vw', 'Viewport width', "vw", 0)

	export const relativeUnitIds = new Set([rem.id, percentage.id, vh.id, vw.id])

	export const all = new Map<ConverterUnit['id'], ConverterUnit>([
		[px.id, px],
		[inch.id, inch],
		[cm.id, cm],
		[mm.id, mm],
		[pc.id, pc],
		[pt.id, pt],
		[Q.id, Q],
		[rem.id, rem],
		[percentage.id, percentage],
		[vh.id, vh],
		[vw.id, vw],
	])
}

export namespace AngleUnits {
	export const rad  = new ConverterUnit('angle-rad', 'Radian', 'rad', 1)
	export const deg  = new ConverterUnit('angle-deg', 'Degree', 'deg', 180 / Math.PI)
	export const grad = new ConverterUnit('angle-grad', 'Gradian', 'grad', 200 / Math.PI)
	export const turn = new ConverterUnit('angle-turn', 'Turn', 'turn', 1 / (2 * Math.PI))
	export const all = new Map<ConverterUnit['id'], ConverterUnit>([
		[rad.id, rad],
		[deg.id, deg],
		[grad.id, grad],
		[turn.id, turn]
	])
}

export namespace TimeUnits {
	export const s  = new ConverterUnit('time-s', 'Second', 's', 1)
	export const ms  = new ConverterUnit('time-ms', 'Millisecond', 'ms', s.value * 1000)
	export const all = new Map<ConverterUnit['id'], ConverterUnit>([
		[s.id, s],
		[ms.id, ms]
	])
}