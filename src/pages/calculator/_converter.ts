export type ConverterUnitType = {
	name: string
	symbol: string
	value: number
}

export const enum ConverterType {
	length = 'length',
	area = 'area',
	volume = 'volume',
	temperature = 'temperature',
	time = 'time',
	weight = 'weight',
	frequency = 'frequency',
	pressure = 'pressure',
	angle = 'angle',
}

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

	static parse_json(unit: ConverterUnitType): ConverterUnit {
		return new ConverterUnit(
			unit.name,
			unit.symbol,
			unit.value
		)
	}
}

export const UNIT_LENGTH_KILOMETER = new ConverterUnit("Kilometer", 'km', 1E-3)
export const UNIT_LENGTH_HECTOMETER = new ConverterUnit("Hectometer", 'hm', 1E-2)
export const UNIT_LENGTH_DEKAMETER = new ConverterUnit("Dekameter", 'dam', 1E-1)
export const UNIT_LENGTH_METER = new ConverterUnit("Meter", 'm', 1)
export const UNIT_LENGTH_DECIMETER = new ConverterUnit("Decimeter", 'dm', 1E1)
export const UNIT_LENGTH_CENTIMETER = new ConverterUnit("Centimeter", 'cm', 1E2)
export const UNIT_LENGTH_MILLIMETER = new ConverterUnit("Millimeter", 'mm', 1E3)
export const UNIT_LENGTH_MICROMETER = new ConverterUnit("Micrometer", 'μm', 1E6)
export const UNIT_LENGTH_NANOMETER = new ConverterUnit("Nanometer", 'nm', 1E9)
export const UNIT_LENGTH_PICOMETER = new ConverterUnit("Picometer", 'pm', 1E12)
export const UNIT_LENGTH_MILE = new ConverterUnit("Mile", 'mi', 0.0006213689)
export const UNIT_LENGTH_INCH = new ConverterUnit("Inch", 'in', 39.37007874)
export const UNIT_LENGTH_YARD = new ConverterUnit("Yard", 'yd', 1.0936132983)
export const UNIT_LENGTH_FOOT = new ConverterUnit("Foot", 'ft', 3.280839895)
export const UNIT_LENGTH = [
	UNIT_LENGTH_KILOMETER , UNIT_LENGTH_HECTOMETER, UNIT_LENGTH_DEKAMETER,
	UNIT_LENGTH_METER     , UNIT_LENGTH_DECIMETER , UNIT_LENGTH_CENTIMETER,
	UNIT_LENGTH_CENTIMETER, UNIT_LENGTH_MILLIMETER, UNIT_LENGTH_MICROMETER,
	UNIT_LENGTH_NANOMETER , UNIT_LENGTH_PICOMETER , UNIT_LENGTH_MILE,
	UNIT_LENGTH_INCH      , UNIT_LENGTH_YARD      , UNIT_LENGTH_FOOT
]

export const UNIT_AREA_KILOMETER = new ConverterUnit("Square Kilometer", 'km²', 1E-6)
export const UNIT_AREA_HECTOMETER = new ConverterUnit("Square Hectometer", 'hm²', 1E-4)
export const UNIT_AREA_DEKAMETER = new ConverterUnit("Square Dekameter", 'dam²', 1E-2)
export const UNIT_AREA_METER = new ConverterUnit("Square Meter", 'm²', 1)
export const UNIT_AREA_DECIMETER = new ConverterUnit("Square Decimeter", 'dm²', 1E2)
export const UNIT_AREA_CENTIMETER = new ConverterUnit("Square Centimeter", 'cm²', 1E4)
export const UNIT_AREA_MILLIMETER = new ConverterUnit("Square Millimeter", 'mm²', 1E6)
export const UNIT_AREA_MICROMETER = new ConverterUnit("Square Micrometer", 'μm²', 1E12)
export const UNIT_AREA_NANOMETER = new ConverterUnit("Square Nanometer", 'nm²', 1E18)
export const UNIT_AREA_PICOMETER = new ConverterUnit("Square Picometer", 'pm²', 1E24)
export const UNIT_AREA_MILE = new ConverterUnit("Square Mile", 'mi²', 3.861018768E-7)
export const UNIT_AREA_INCH = new ConverterUnit("Square Inch", 'in²', 1550.0031)
export const UNIT_AREA_YARD = new ConverterUnit("Square Yard", 'yd²', 1.1959900463)
export const UNIT_AREA_FOOT = new ConverterUnit("Square Foot", 'ft²', 10.763910417)
export const UNIT_AREA_HECTARE = new ConverterUnit("Hectare", 'ha', 1E-4)
export const UNIT_AREA = [
	UNIT_AREA_KILOMETER , UNIT_AREA_HECTOMETER, UNIT_AREA_DEKAMETER,
	UNIT_AREA_METER     , UNIT_AREA_DECIMETER , UNIT_AREA_CENTIMETER,
	UNIT_AREA_CENTIMETER, UNIT_AREA_MILLIMETER, UNIT_AREA_MICROMETER,
	UNIT_AREA_NANOMETER , UNIT_AREA_PICOMETER , UNIT_AREA_MILE,
	UNIT_AREA_INCH      , UNIT_AREA_YARD      , UNIT_AREA_FOOT,
	UNIT_AREA_HECTARE
]

export const UNIT_VOLUME_KILOMETER = new ConverterUnit("Cubic Kilometer", 'km³', 1E-9)
export const UNIT_VOLUME_HECTOMETER = new ConverterUnit("Cubic Hectometer", 'hm³', 1E-6)
export const UNIT_VOLUME_DEKAMETER = new ConverterUnit("Cubic Dekameter", 'dam³', 1E-3)
export const UNIT_VOLUME_METER = new ConverterUnit("Cubic Meter", 'm³', 1)
export const UNIT_VOLUME_DECIMETER = new ConverterUnit("Cubic Decimeter", 'dm³', 1E3)
export const UNIT_VOLUME_CENTIMETER = new ConverterUnit("Cubic Centimeter", 'cm³', 1E6)
export const UNIT_VOLUME_MILLIMETER = new ConverterUnit("Cubic Millimeter", 'mm³', 1E9)
export const UNIT_VOLUME_MICROMETER = new ConverterUnit("Cubic Micrometer", 'μm³', 1E18)
export const UNIT_VOLUME_NANOMETER = new ConverterUnit("Cubic Nanometer", 'nm³', 1E27)
export const UNIT_VOLUME_PICOMETER = new ConverterUnit("Cubic Picometer", 'pm³', 1E36)
export const UNIT_VOLUME_MILE = new ConverterUnit("Cubic Mile", 'mi³', 2.399128636E-10)
export const UNIT_VOLUME_INCH = new ConverterUnit("Cubic Inch", 'in³', 61023.744095)
export const UNIT_VOLUME_YARD = new ConverterUnit("Cubic Yard", 'yd³', 1.3079506193)
export const UNIT_VOLUME_FOOT = new ConverterUnit("Cubic Foot", 'ft³', 35.314666721)
export const UNIT_VOLUME_LITER = new ConverterUnit("Liter", 'L', 1E3)
export const UNIT_VOLUME_MILLILITER = new ConverterUnit("Milliliter", 'mL', 1E6)
export const UNIT_VOLUME = [
	UNIT_VOLUME_KILOMETER , UNIT_VOLUME_HECTOMETER, UNIT_VOLUME_DEKAMETER,
	UNIT_VOLUME_METER     , UNIT_VOLUME_DECIMETER , UNIT_VOLUME_CENTIMETER,
	UNIT_VOLUME_CENTIMETER, UNIT_VOLUME_MILLIMETER, UNIT_VOLUME_MICROMETER,
	UNIT_VOLUME_NANOMETER , UNIT_VOLUME_PICOMETER , UNIT_VOLUME_MILE,
	UNIT_VOLUME_INCH      , UNIT_VOLUME_YARD      , UNIT_VOLUME_FOOT,
	UNIT_VOLUME_LITER     , UNIT_VOLUME_MILLILITER
]

export const UNIT_TEMPERATURE_KELVIN = new ConverterUnit("Kelvin", 'K', 274.15)
export const UNIT_TEMPERATURE_CELCIUS = new ConverterUnit("Celcius", '°C', 1)
export const UNIT_TEMPERATURE_REAMUR = new ConverterUnit("Réamur", '°Ré', 0.8)
export const UNIT_TEMPERATURE_FAHRENHEIT = new ConverterUnit("Fahrenheit", '°F', 33.8)
export const UNIT_TEMPERATURE_ROMER = new ConverterUnit("Rømer", '°Rø', 7.875)
export const UNIT_TEMPERATURE_RANKINE = new ConverterUnit("Rankine", '°R', 491.67)
export const UNIT_TEMPERATURE_DELISLE = new ConverterUnit("Delisle", '°De', 148.5)
export const UNIT_TEMPERATURE = [
	UNIT_TEMPERATURE_KELVIN    , UNIT_TEMPERATURE_CELCIUS, UNIT_TEMPERATURE_REAMUR,
	UNIT_TEMPERATURE_FAHRENHEIT, UNIT_TEMPERATURE_ROMER  , UNIT_TEMPERATURE_RANKINE,
	UNIT_TEMPERATURE_DELISLE
]

export const UNIT_TIME_CENTURY = new ConverterUnit("Century", 'century', 3.168808781402895E-10)
export const UNIT_TIME_DECADE = new ConverterUnit("Decade", 'decade', 3.168808781402895E-9)
export const UNIT_TIME_YEAR = new ConverterUnit("Year", 'y', 3.168808781402895E-8)
export const UNIT_TIME_MONTH = new ConverterUnit("Month", 'm', 3.802570537683474e-7)
export const UNIT_TIME_WEEK = new ConverterUnit("Week", 'w', 0.00003802910052910053)
export const UNIT_TIME_DAY = new ConverterUnit("Day", 'd', 0.000011574074074074073)
export const UNIT_TIME_HOUR = new ConverterUnit("Hour", 'h', 0.0002777777777777778)
export const UNIT_TIME_MINUTE = new ConverterUnit("Minute", 'min', 0.016666666666666666)
export const UNIT_TIME_SECOND = new ConverterUnit("Second", 's', 1)
export const UNIT_TIME_MILLISECOND = new ConverterUnit("Millisecond", 'ms', 1E3)
export const UNIT_TIME_MICROSECOND = new ConverterUnit("Microsecond", 'μs', 1E6)
export const UNIT_TIME_NANOSECOND = new ConverterUnit("Nanosecond", 'ns', 1E9)
export const UNIT_TIME = [
	UNIT_TIME_CENTURY    , UNIT_TIME_DECADE     , UNIT_TIME_YEAR,
	UNIT_TIME_MONTH      , UNIT_TIME_WEEK       , UNIT_TIME_DAY,
	UNIT_TIME_HOUR       , UNIT_TIME_MINUTE     , UNIT_TIME_SECOND,
	UNIT_TIME_MILLISECOND, UNIT_TIME_MICROSECOND, UNIT_TIME_NANOSECOND
]

export const UNIT_WEIGHT_KILOGRAM = new ConverterUnit("Kilogram", 'kg', 1E-3)
export const UNIT_WEIGHT_HECTOGRAM = new ConverterUnit("Hectogram", 'hg', 1E-2)
export const UNIT_WEIGHT_DEKAGRAM = new ConverterUnit("Dekagram", 'dag', 1E-1)
export const UNIT_WEIGHT_GRAM = new ConverterUnit("Gram", 'g', 1)
export const UNIT_WEIGHT_DECIGRAM = new ConverterUnit("Decigram", 'dg', 1E1)
export const UNIT_WEIGHT_CENTIGRAM = new ConverterUnit("Centigram", 'cg', 1E2)
export const UNIT_WEIGHT_MILLIGRAM = new ConverterUnit("Milligram", 'mg', 1E3)
export const UNIT_WEIGHT_MICROGRAM = new ConverterUnit("Microgram", 'μg', 1E6)
export const UNIT_WEIGHT_NANOGRAM = new ConverterUnit("Nanogram", 'ng', 1E9)
export const UNIT_WEIGHT_PICOGRAM = new ConverterUnit("Picogram", 'pg', 1E12)
export const UNIT_WEIGHT_TONNE = new ConverterUnit("Tonne", 't', 1E-6)
export const UNIT_WEIGHT_OUNCE = new ConverterUnit("Ounce", 'oz', 0.0352739907)
export const UNIT_WEIGHT_POUND = new ConverterUnit("Pound", 'lbs', 0.0022046244)
export const UNIT_WEIGHT_CARRAT = new ConverterUnit("Carrat", 'ct', 5)
export const UNIT_WEIGHT = [
	UNIT_WEIGHT_KILOGRAM, UNIT_WEIGHT_HECTOGRAM, UNIT_WEIGHT_DEKAGRAM,
	UNIT_WEIGHT_GRAM, UNIT_WEIGHT_DECIGRAM, UNIT_WEIGHT_CENTIGRAM,
	UNIT_WEIGHT_MILLIGRAM, UNIT_WEIGHT_MICROGRAM, UNIT_WEIGHT_NANOGRAM,
	UNIT_WEIGHT_PICOGRAM, UNIT_WEIGHT_TONNE, UNIT_WEIGHT_OUNCE,
	UNIT_WEIGHT_POUND, UNIT_WEIGHT_CARRAT
]

export const UNIT_FREQUENCY_TERAHERTZ = new ConverterUnit("Terahertz", 'THz', 1E-12)
export const UNIT_FREQUENCY_GIGAHERTZ = new ConverterUnit("Gigahertz", 'GHz', 1E-9)
export const UNIT_FREQUENCY_MEGAHERTZ = new ConverterUnit("Megahertz", 'MHz', 1E-6)
export const UNIT_FREQUENCY_KILOHERTZ = new ConverterUnit("Kilohertz", 'KHz', 1E-3)
export const UNIT_FREQUENCY_HERTZ = new ConverterUnit("Hertz", 'Hz', 1)
export const UNIT_FREQUENCY = [
	UNIT_FREQUENCY_TERAHERTZ, UNIT_FREQUENCY_GIGAHERTZ, UNIT_FREQUENCY_MEGAHERTZ,
	UNIT_FREQUENCY_KILOHERTZ, UNIT_FREQUENCY_HERTZ
]

export const UNIT_PRESSURE_KILOPASCAL = new ConverterUnit("Kilopascal", 'km', 1E-3)
export const UNIT_PRESSURE_HECTOPASCAL = new ConverterUnit("Hectopascal", 'hm', 1E-2)
export const UNIT_PRESSURE_DEKAPASCAL = new ConverterUnit("Dekapascal", 'dam', 1E-1)
export const UNIT_PRESSURE_PASCAL = new ConverterUnit("Pascal", 'Pa', 1)
export const UNIT_PRESSURE_DECIPASCAL = new ConverterUnit("Decipascal", 'dm', 1E1)
export const UNIT_PRESSURE_CENTIPASCAL = new ConverterUnit("Centipascal", 'cm', 1E2)
export const UNIT_PRESSURE_MILLIPASCAL = new ConverterUnit("Millipascal", 'mm', 1E3)
export const UNIT_PRESSURE_MICROPASCAL = new ConverterUnit("Micropascal", 'μm', 1E6)
export const UNIT_PRESSURE_NANOPASCAL = new ConverterUnit("Nanopascal", 'nm', 1E9)
export const UNIT_PRESSURE_PICOPASCAL = new ConverterUnit("Picopascal", 'pm', 1E12)
export const UNIT_PRESSURE_BAR = new ConverterUnit("Bar", 'bar', 1E-6)
export const UNIT_PRESSURE_PSI = new ConverterUnit("Psi", 'psi', 0.0001450377)
export const UNIT_PRESSURE_ATMOSPHERE = new ConverterUnit("Atmosphere", 'atm', 0.0000098692)
export const UNIT_PRESSURE_TORR = new ConverterUnit("Torr", 'torr', 0.0075006168)
export const UNIT_PRESSURE = [
	UNIT_PRESSURE_KILOPASCAL, UNIT_PRESSURE_HECTOPASCAL, UNIT_PRESSURE_DEKAPASCAL,
	UNIT_PRESSURE_PASCAL, UNIT_PRESSURE_DECIPASCAL, UNIT_PRESSURE_CENTIPASCAL,
	UNIT_PRESSURE_MILLIPASCAL, UNIT_PRESSURE_MICROPASCAL, UNIT_PRESSURE_NANOPASCAL,
	UNIT_PRESSURE_PICOPASCAL, UNIT_PRESSURE_BAR, UNIT_PRESSURE_PSI,
	UNIT_PRESSURE_ATMOSPHERE, UNIT_PRESSURE_TORR
]

export const UNIT_ANGLE_GRADIAN = new ConverterUnit("Gradian", 'ᵍ', 63.662)
export const UNIT_ANGLE_RADIAN = new ConverterUnit("Radian", 'rad', 1)
export const UNIT_ANGLE_DEGREE = new ConverterUnit("Degree", '°', 57.2958)
export const UNIT_ANGLE = [
	UNIT_ANGLE_GRADIAN, UNIT_ANGLE_RADIAN, UNIT_ANGLE_DEGREE
]