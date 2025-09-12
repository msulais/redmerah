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

export class LengthUnits {
	static readonly kilometer  = new ConverterUnit('length-km' , "Kilometer" , 'km' , 1)
	static readonly hectometer = new ConverterUnit('length-hm' , "Hectometer", 'hm' , this.kilometer.value * 10)
	static readonly dekameter  = new ConverterUnit('length-dam', "Dekameter" , 'dam', this.hectometer.value * 10)
	static readonly meter      = new ConverterUnit('length-m'  , "Meter"     , 'm'  , this.dekameter.value * 10)
	static readonly decimeter  = new ConverterUnit('length-dm' , "Decimeter" , 'dm' , this.meter.value * 10)
	static readonly centimeter = new ConverterUnit('length-cm' , "Centimeter", 'cm' , this.decimeter.value * 10)
	static readonly millimeter = new ConverterUnit('length-mm' , "Millimeter", 'mm' , this.centimeter.value * 10)
	static readonly micrometer = new ConverterUnit('length-μm' , "Micrometer", 'μm' , this.millimeter.value * 1000)
	static readonly nanometer  = new ConverterUnit('length-nm' , "Nanometer" , 'nm' , this.micrometer.value * 1000)
	static readonly picometer  = new ConverterUnit('length-pm' , "Picometer" , 'pm' , this.nanometer.value * 1000)
	static readonly mile       = new ConverterUnit('length-mi' , "Mile"      , 'mi' , 25146 / 15625)
	static readonly inch       = new ConverterUnit('length-in' , "Inch"      , 'in' , 1 / 25.4 * this.millimeter.value)
	static readonly yard       = new ConverterUnit('length-yd' , "Yard"      , 'yd' , this.inch.value * 36)
	static readonly foot       = new ConverterUnit('length-ft' , "Foot"      , 'ft' , this.inch.value * 12)
	static readonly all = [
		this.kilometer , this.hectometer, this.dekameter,
		this.meter     , this.decimeter , this.centimeter,
		this.millimeter, this.micrometer, this.nanometer,
		this.picometer , this.mile      , this.inch,
		this.yard      , this.foot
	]
}

export class AreaUnits {
	static readonly kilometer  = new ConverterUnit('area-km' , "Square Kilometer" , 'km²' , 1)
	static readonly hectometer = new ConverterUnit('area-hm' , "Square Hectometer", 'hm²' , this.kilometer.value * 100)
	static readonly dekameter  = new ConverterUnit('area-dam', "Square Dekameter" , 'dam²', this.hectometer.value * 100)
	static readonly meter      = new ConverterUnit('area-m'  , "Square Meter"     , 'm²'  , this.dekameter.value * 100)
	static readonly decimeter  = new ConverterUnit('area-dm' , "Square Decimeter" , 'dm²' , this.meter.value * 100)
	static readonly centimeter = new ConverterUnit('area-cm' , "Square Centimeter", 'cm²' , this.decimeter.value * 100)
	static readonly millimeter = new ConverterUnit('area-mm' , "Square Millimeter", 'mm²' , this.centimeter.value * 100)
	static readonly micrometer = new ConverterUnit('area-μm' , "Square Micrometer", 'μm²' , this.millimeter.value * 1000000)
	static readonly nanometer  = new ConverterUnit('area-nm' , "Square Nanometer" , 'nm²' , this.micrometer.value * 1000000)
	static readonly picometer  = new ConverterUnit('area-pm' , "Square Picometer" , 'pm²' , this.nanometer.value * 1000000)
	static readonly mile       = new ConverterUnit('area-mi' , "Square Mile"      , 'mi²' , Math.pow(25146 / 15625, -2))
	static readonly inch       = new ConverterUnit('area-in' , "Square Inch"      , 'in²' , 1 / Math.pow(25.4, 2) * this.millimeter.value)
	static readonly yard       = new ConverterUnit('area-yd' , "Square Yard"      , 'yd²' , 1 / Math.pow(25.4 * 36, 2) * this.millimeter.value)
	static readonly foot       = new ConverterUnit('area-ft' , "Square Foot"      , 'ft²' , 1 / Math.pow(25.4 * 12, 2) * this.millimeter.value)
	static readonly hectare    = new ConverterUnit('area-ha' , "Hectare"          , 'ha'  , this.hectometer.value)
	static readonly all = [
		this.kilometer , this.hectometer, this.dekameter,
		this.meter     , this.decimeter , this.centimeter,
		this.millimeter, this.micrometer, this.nanometer,
		this.picometer , this.mile      , this.inch,
		this.yard      , this.foot      , this.hectare
	]
}

export class VolumeUnits {
	static readonly kilometer  = new ConverterUnit('volume-km' , "Cubic Kilometer" , 'km³' , 1)
	static readonly hectometer = new ConverterUnit('volume-hm' , "Cubic Hectometer", 'hm³' , this.kilometer.value * 1000)
	static readonly dekameter  = new ConverterUnit('volume-dam', "Cubic Dekameter" , 'dam³', this.hectometer.value * 1000)
	static readonly meter      = new ConverterUnit('volume-m'  , "Cubic Meter"     , 'm³'  , this.dekameter.value * 1000)
	static readonly decimeter  = new ConverterUnit('volume-dm' , "Cubic Decimeter" , 'dm³' , this.meter.value * 1000)
	static readonly centimeter = new ConverterUnit('volume-cm' , "Cubic Centimeter", 'cm³' , this.decimeter.value * 1000)
	static readonly millimeter = new ConverterUnit('volume-mm' , "Cubic Millimeter", 'mm³' , this.centimeter.value * 1000)
	static readonly micrometer = new ConverterUnit('volume-μm' , "Cubic Micrometer", 'μm³' , this.millimeter.value * 1000_000_000)
	static readonly nanometer  = new ConverterUnit('volume-nm' , "Cubic Nanometer" , 'nm³' , this.micrometer.value * 1000_000_000)
	static readonly picometer  = new ConverterUnit('volume-pm' , "Cubic Picometer" , 'pm³' , this.nanometer.value * 1000_000_000)
	static readonly mile       = new ConverterUnit('volume-mi' , "Cubic Mile"      , 'mi³' , Math.pow(25146 / 15625, -3))
	static readonly inch       = new ConverterUnit('volume-in' , "Cubic Inch"      , 'in³' , 1 / Math.pow(25.4, 3) * this.millimeter.value)
	static readonly yard       = new ConverterUnit('volume-yd' , "Cubic Yard"      , 'yd³' , 1 / Math.pow(25.4 * 36, 3) * this.millimeter.value)
	static readonly foot       = new ConverterUnit('volume-ft' , "Cubic Foot"      , 'ft³' , 1 / Math.pow(25.4 * 12, 3) * this.millimeter.value)
	static readonly liter      = new ConverterUnit('volume-l'  , "Liter"           , 'L'   , this.dekameter.value)
	static readonly milliliter = new ConverterUnit('volume-ml' , "Milliliter"      , 'mL'  , this.meter.value)
	static readonly all = [
		this.kilometer , this.hectometer, this.dekameter,
		this.meter     , this.decimeter , this.centimeter,
		this.millimeter, this.micrometer, this.nanometer,
		this.picometer , this.mile      , this.inch,
		this.yard      , this.foot      , this.liter,
		this.milliliter
	]
}

export class TemperatureUnits {
	static readonly kelvin     = new ConverterUnit('temperature-k' , "Kelvin"    , 'K'  , 274.15)
	static readonly celcius    = new ConverterUnit('temperature-c' , "Celcius"   , '°C' , 1)
	static readonly reamur     = new ConverterUnit('temperature-re', "Réamur"    , '°Ré', 0.8)
	static readonly fahrenheit = new ConverterUnit('temperature-f' , "Fahrenheit", '°F' , 33.8)
	static readonly romer      = new ConverterUnit('temperature-ro', "Rømer"     , '°Rø', 7.875)
	static readonly rankine    = new ConverterUnit('temperature-r' , "Rankine"   , '°R' , 491.67)
	static readonly delisle    = new ConverterUnit('temperature-de', "Delisle"   , '°De', 148.5)
	static readonly all = [
		this.kelvin    , this.celcius, this.reamur ,
		this.fahrenheit, this.romer  , this.rankine,
		this.delisle
	]
}

export class TimeUnits {
	static readonly century     = new ConverterUnit('time-century', "Century"    , 'century', 1)
	static readonly decade      = new ConverterUnit('time-decade' , "Decade"     , 'decade' , this.century.value * 10)
	static readonly year        = new ConverterUnit('time-y'      , "Year"       , 'y'      , this.decade.value * 10)
	static readonly month       = new ConverterUnit('time-m'      , "Month"      , 'm'      , 12 * this.year.value)
	static readonly day         = new ConverterUnit('time-d'      , "Day"        , 'd'      , 365.25 * this.year.value)
	static readonly week        = new ConverterUnit('time-w'      , "Week"       , 'w'      , this.day.value / 7)
	static readonly hour        = new ConverterUnit('time-h'      , "Hour"       , 'h'      , this.day.value * 24)
	static readonly minute      = new ConverterUnit('time-min'    , "Minute"     , 'min'    , this.hour.value * 60)
	static readonly second      = new ConverterUnit('time-s'      , "Second"     , 's'      , this.minute.value * 60)
	static readonly millisecond = new ConverterUnit('time-ms'     , "Millisecond", 'ms'     , this.second.value * 1000)
	static readonly microsecond = new ConverterUnit('time-μs'     , "Microsecond", 'μs'     , this.millisecond.value * 1000)
	static readonly nanosecond  = new ConverterUnit('time-ns'     , "Nanosecond" , 'ns'     , this.microsecond.value * 1000)
	static readonly all = [
		this.century    , this.decade     , this.year,
		this.month      , this.week       , this.day,
		this.hour       , this.minute     , this.second,
		this.millisecond, this.microsecond, this.nanosecond,
	]
}

export class WeightUnits {
	static readonly kilogram  = new ConverterUnit('weight-kg' , "Kilogram" , 'kg' , 1)
	static readonly hectogram = new ConverterUnit('weight-hg' , "Hectogram", 'hg' , this.kilogram.value * 10)
	static readonly dekagram  = new ConverterUnit('weight-dag', "Dekagram" , 'dag', this.hectogram.value * 10)
	static readonly gram      = new ConverterUnit('weight-g'  , "Gram"     , 'g'  , this.dekagram.value * 10)
	static readonly decigram  = new ConverterUnit('weight-dg' , "Decigram" , 'dg' , this.gram.value * 10)
	static readonly centigram = new ConverterUnit('weight-cg' , "Centigram", 'cg' , this.decigram.value * 10)
	static readonly milligram = new ConverterUnit('weight-mg' , "Milligram", 'mg' , this.centigram.value * 10)
	static readonly microgram = new ConverterUnit('weight-μg' , "Microgram", 'μg' , this.milligram.value * 1000)
	static readonly nanogram  = new ConverterUnit('weight-ng' , "Nanogram" , 'ng' , this.microgram.value * 1000)
	static readonly picogram  = new ConverterUnit('weight-pg' , "Picogram" , 'pg' , this.nanogram.value * 1000)
	static readonly tonne     = new ConverterUnit('weight-t'  , "Tonne"    , 't'  , 1 / 1E3)
	static readonly grain     = new ConverterUnit('weight-gr' , "Grain"    , 'gr' , 64.79891 * this.milligram.value)
	static readonly pound     = new ConverterUnit('weight-lbs', "Pound"    , 'lbs', 0.45359237)
	static readonly carrat    = new ConverterUnit('weight-ct' , "Carat"    , 'ct' , 200 * this.milligram.value)
	static readonly all = [
		this.kilogram , this.hectogram, this.dekagram,
		this.gram     , this.decigram , this.centigram,
		this.milligram, this.microgram, this.nanogram,
		this.picogram , this.tonne    , this.pound,
		this.carrat   , this.grain
	]
}

export class FrequencyUnits {
	static readonly terahertz = new ConverterUnit('frequency-t', "Terahertz", 'THz', 1)
	static readonly gigahertz = new ConverterUnit('frequency-g', "Gigahertz", 'GHz', this.terahertz.value * 1E3)
	static readonly megahertz = new ConverterUnit('frequency-m', "Megahertz", 'MHz', this.gigahertz.value * 1E3)
	static readonly kilohertz = new ConverterUnit('frequency-k', "Kilohertz", 'KHz', this.megahertz.value * 1E3)
	static readonly hertz     = new ConverterUnit('frequency-h', "Hertz"    , 'Hz' , this.kilohertz.value * 1E3)
	static readonly all = [
		this.terahertz, this.gigahertz, this.megahertz,
		this.kilohertz, this.hertz
	]
}

export class PressureUnits {
	static readonly kilopascal  = new ConverterUnit('pressure-kPa' , "Kilopascal"           , 'kPa' , 1)
	static readonly hectopascal = new ConverterUnit('pressure-hPa' , "Hectopascal"          , 'hPa' , this.kilopascal.value * 10)
	static readonly dekapascal  = new ConverterUnit('pressure-daPa', "Dekapascal"           , 'daPa', this.hectopascal.value * 10)
	static readonly pascal      = new ConverterUnit('pressure-Pa'  , "Pascal"               , 'Pa'  , this.dekapascal.value * 10)
	static readonly decipascal  = new ConverterUnit('pressure-dPa' , "Decipascal"           , 'dPa' , this.pascal.value * 10)
	static readonly centipascal = new ConverterUnit('pressure-cPa' , "Centipascal"          , 'cPa' , this.decipascal.value * 10)
	static readonly millipascal = new ConverterUnit('pressure-mPa' , "Millipascal"          , 'mPa' , this.centipascal.value * 10)
	static readonly micropascal = new ConverterUnit('pressure-μPa' , "Micropascal"          , 'μPa' , this.millipascal.value * 1000)
	static readonly nanopascal  = new ConverterUnit('pressure-nPa' , "Nanopascal"           , 'nPa' , this.micropascal.value * 1000)
	static readonly picopascal  = new ConverterUnit('pressure-pPa' , "Picopascal"           , 'pPa' , this.nanopascal.value * 1000)
	static readonly bar         = new ConverterUnit('pressure-bar' , "Bar"                  , 'bar' , 1E2)
	static readonly psi         = new ConverterUnit('pressure-psi' , "Pound per square inch", 'psi' , 8896443230521 / 1290320000 * this.pascal.value)
	static readonly atmosphere  = new ConverterUnit('pressure-atm' , "Atmosphere"           , 'atm' , 101325 * this.pascal.value)
	static readonly torr        = new ConverterUnit('pressure-torr', "Torr"                 , 'torr', 101325 / 760 * this.pascal.value)
	static readonly all = [
		this.kilopascal , this.hectopascal, this.dekapascal,
		this.pascal     , this.decipascal , this.centipascal,
		this.millipascal, this.micropascal, this.nanopascal,
		this.bar        , this.psi        , this.atmosphere,
		this.torr
	]
}

export class AngleUnits {
	static readonly gradian = new ConverterUnit('angle-grad', "Gradian", 'ᵍ'  , 400 / 2)
	static readonly radian  = new ConverterUnit('angle-rad' , "Radian" , 'rad', 1)
	static readonly degree  = new ConverterUnit('angle-deg' , "Degree" , '°'  , 180 / Math.PI)
	static readonly all = [
		this.gradian, this.radian, this.degree
	]
}

export const AllUnits = [
	...LengthUnits.all,
	...AreaUnits.all,
	...VolumeUnits.all,
	...TemperatureUnits.all,
	...TimeUnits.all,
	...WeightUnits.all,
	...FrequencyUnits.all,
	...PressureUnits.all,
	...AngleUnits.all
]