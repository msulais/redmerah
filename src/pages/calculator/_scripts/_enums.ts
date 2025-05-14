import { ConverterUnit } from "./classes"

let _ID_INDEX = 0

function _generateId(): string {
	++_ID_INDEX
	return 'app-' + _ID_INDEX
}

export class ElementIds {
	static readonly appbar = _generateId()
	static readonly appbarSideBarButton = _generateId()
	static readonly appbarInfoButton = _generateId()
	static readonly appbarInfoMenu = _generateId()
	static readonly appbarInfoMenuShareButton = _generateId()
	static readonly appbarSettingsButton = _generateId()
	static readonly appbarSettingsMenu = _generateId()
	static readonly appbarSettingsAnimationMenu = _generateId()
	static readonly appbarSettingsThemeMenu = _generateId()
	static readonly appbarSettingsDecimalMenu = _generateId()
	static readonly appbarSettingsGroupMenu = _generateId()
	static readonly bodyBasic = _generateId()
	static readonly bodyBasicInput = _generateId()
	static readonly bodyBasicOutput = _generateId()
	static readonly bodyConverter = _generateId()
	static readonly bodyConverterOptions = _generateId()
	static readonly bodyConverterInput = _generateId()
	static readonly bodyConverterOutput = _generateId()
	static readonly bodyConverterType = _generateId()
	static readonly bodyConverterSwap = _generateId()
	static readonly bodyConverterInputUnit = _generateId()
	static readonly bodyConverterOutputUnit = _generateId()
	static readonly bodyDate = _generateId()
	static readonly bodyDateInputFromButton = _generateId()
	static readonly bodyDateInputToButton = _generateId()
	static readonly bodyDateInputFromDatePicker = _generateId()
	static readonly bodyDateInputToDatePicker = _generateId()
	static readonly bodyDateOutput = _generateId()
	static readonly bodyProgrammer = _generateId()
	static readonly bodyProgrammerInput = _generateId()
	static readonly bodyProgrammerOutput = _generateId()
	static readonly bodyProgrammerOutputDec = _generateId()
	static readonly bodyProgrammerOutputHex = _generateId()
	static readonly bodyProgrammerOutputOct = _generateId()
	static readonly bodyProgrammerOutputBin = _generateId()
	static readonly bodyScientific = _generateId()
	static readonly bodyScientificAngle = _generateId()
	static readonly bodyScientificInput = _generateId()
	static readonly bodyScientificOutput = _generateId()
	static readonly bodyScientificFunctionButton = _generateId()
	static readonly bodyScientificFunctionMenu = _generateId()
	static readonly bodyScientificFunctionInvers = _generateId()
	static readonly bodyScientificFunctionHyperbolic = _generateId()
	static readonly navigationSideBar = _generateId()
	static readonly navigationDrawer = _generateId()
}

export enum ElementAttributes {
	command = 'data-command'
}

export enum BodyEvents {
	command = 'body:command'
}

export enum Pages {
	basic = 'basic',
	scientific = 'scientific',
	converter = 'converter',
	programmer = 'programmer',
	date = 'date'
}

export enum Commands {
	memoryAdd = 'memory-add',
	memorySubtract = 'memory-subtract',
	memoryRecall = 'memory-recall',
	memoryClear = 'memory-clear',

	/** @param options `CommandChangeProgrammerTypeDetail` */
	changeProgrammerType = 'change-programmer-type',

	/** @param options `CommandChangeConverterTypeDetail` */
	changeConverterType = 'change-converter-type',

	/** @param options `CommandChangeUnitDetail` */
	changeInputUnit = 'change-input-unit',

	/** @param options `CommandChangeUnitDetail` */
	changeOutputUnit = 'change-output-unit',

	/** @param options `CommandChangeDecimalFormatDetail` */
	changeDecimalFormat = 'change-decimal-format',

	/** @param options `CommandChangeGroupingFormatDetail` */
	changeGroupingFormat = 'change-grouping-format',

	/** @param options `CommandChangePageDetail` */
	changePage = 'change-page',

	/** @param options `CommandScientificAngleDetail` */
	scientificAngle = 'scientific-angle',

	/** @param options `CommandKeyCharDetail` */
	keyChar = 'key-char',
	keyDecimal = 'key-decimal',
	keyPlusMinus = 'key-plus-minus',
	keyClear = 'key-clear',
	keyBackspace = 'key-backspace',
	keyEqual = 'key-equal',
	keyUnitSwap = 'key-unit-swap',
}

export enum ScientificAngleType {
	RAD = 'RAD',
	DEG = 'DEG',
	GRAD = 'GRAD'
}

export enum RadioGroupNames {
	settingsAnimation = 'settings:animation',
	settingsTheme = 'settings:theme',
	settingsGrouping = 'settings:grouping',
	settingsDecimal = 'settings:decimal',
}

export enum DateOperation {
	add = 'add',
	subtract = 'subtract',
	difference = 'difference'
}

export enum NumberType {
	decimal = 'decimal',
	hexadecimal = 'hexadecimal',
	octal = 'octal',
	binary = 'binary',
}

export enum GroupingNumberFormat {
	point = '.',
	comma = ',',
	none = '',
	space = ' ',
	underscore = '_'
}

export enum DecimalNumberFormat {
	point = '.',
	comma = ','
}



export enum ConverterType {
	length      = 'length',
	area        = 'area',
	volume      = 'volume',
	temperature = 'temperature',
	time        = 'time',
	weight      = 'weight',
	frequency   = 'frequency',
	pressure    = 'pressure',
	angle       = 'angle',
}

export class LengthUnits {
	static readonly kilometer = new ConverterUnit("Kilometer", 'km', 1E-3)
	static readonly hectometer = new ConverterUnit("Hectometer", 'hm', 1E-2)
	static readonly dekameter = new ConverterUnit("Dekameter", 'dam', 1E-1)
	static readonly meter = new ConverterUnit("Meter", 'm', 1)
	static readonly decimeter = new ConverterUnit("Decimeter", 'dm', 1E1)
	static readonly centimeter = new ConverterUnit("Centimeter", 'cm', 1E2)
	static readonly millimeter = new ConverterUnit("Millimeter", 'mm', 1E3)
	static readonly micrometer = new ConverterUnit("Micrometer", 'μm', 1E6)
	static readonly nanometer = new ConverterUnit("Nanometer", 'nm', 1E9)
	static readonly picometer = new ConverterUnit("Picometer", 'pm', 1E12)
	static readonly mile = new ConverterUnit("Mile", 'mi', 0.0006213689)
	static readonly inch = new ConverterUnit("Inch", 'in', 39.37007874)
	static readonly yard = new ConverterUnit("Yard", 'yd', 1.0936132983)
	static readonly foot = new ConverterUnit("Foot", 'ft', 3.280839895)
	static readonly all = [
		this.kilometer , this.hectometer, this.dekameter,
		this.meter     , this.decimeter , this.centimeter,
		this.millimeter, this.micrometer, this.nanometer,
		this.picometer , this.mile      , this.inch,
		this.yard      , this.foot
	]
}

export class AreaUnits {
	static readonly kilometer = new ConverterUnit("Square Kilometer", 'km²', 1E-6)
	static readonly hectometer = new ConverterUnit("Square Hectometer", 'hm²', 1E-4)
	static readonly dekameter = new ConverterUnit("Square Dekameter", 'dam²', 1E-2)
	static readonly meter = new ConverterUnit("Square Meter", 'm²', 1)
	static readonly decimeter = new ConverterUnit("Square Decimeter", 'dm²', 1E2)
	static readonly centimeter = new ConverterUnit("Square Centimeter", 'cm²', 1E4)
	static readonly millimeter = new ConverterUnit("Square Millimeter", 'mm²', 1E6)
	static readonly micrometer = new ConverterUnit("Square Micrometer", 'μm²', 1E12)
	static readonly nanometer = new ConverterUnit("Square Nanometer", 'nm²', 1E18)
	static readonly picometer = new ConverterUnit("Square Picometer", 'pm²', 1E24)
	static readonly mile = new ConverterUnit("Square Mile", 'mi²', 3.861018768E-7)
	static readonly inch = new ConverterUnit("Square Inch", 'in²', 1550.0031)
	static readonly yard = new ConverterUnit("Square Yard", 'yd²', 1.1959900463)
	static readonly foot = new ConverterUnit("Square Foot", 'ft²', 10.763910417)
	static readonly hectare = new ConverterUnit("Hectare", 'ha', 1E-4)
	static readonly all = [
		this.kilometer , this.hectometer, this.dekameter,
		this.meter     , this.decimeter , this.centimeter,
		this.millimeter, this.micrometer, this.nanometer,
		this.picometer , this.mile      , this.inch,
		this.yard      , this.foot      , this.hectare
	]
}

export class VolumeUnits {
	static readonly kilometer = new ConverterUnit("Cubic Kilometer", 'km³', 1E-9)
	static readonly hectometer = new ConverterUnit("Cubic Hectometer", 'hm³', 1E-6)
	static readonly dekameter = new ConverterUnit("Cubic Dekameter", 'dam³', 1E-3)
	static readonly meter = new ConverterUnit("Cubic Meter", 'm³', 1)
	static readonly decimeter = new ConverterUnit("Cubic Decimeter", 'dm³', 1E3)
	static readonly centimeter = new ConverterUnit("Cubic Centimeter", 'cm³', 1E6)
	static readonly millimeter = new ConverterUnit("Cubic Millimeter", 'mm³', 1E9)
	static readonly micrometer = new ConverterUnit("Cubic Micrometer", 'μm³', 1E18)
	static readonly nanometer = new ConverterUnit("Cubic Nanometer", 'nm³', 1E27)
	static readonly picometer = new ConverterUnit("Cubic Picometer", 'pm³', 1E36)
	static readonly mile = new ConverterUnit("Cubic Mile", 'mi³', 2.399128636E-10)
	static readonly inch = new ConverterUnit("Cubic Inch", 'in³', 61023.744095)
	static readonly yard = new ConverterUnit("Cubic Yard", 'yd³', 1.3079506193)
	static readonly foot = new ConverterUnit("Cubic Foot", 'ft³', 35.314666721)
	static readonly liter = new ConverterUnit("Liter", 'L', 1E3)
	static readonly milliliter = new ConverterUnit("Milliliter", 'mL', 1E6)
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
	static readonly kelvin = new ConverterUnit("Kelvin", 'K', 274.15)
	static readonly celcius = new ConverterUnit("Celcius", '°C', 1)
	static readonly reamur = new ConverterUnit("Réamur", '°Ré', 0.8)
	static readonly fahrenheit = new ConverterUnit("Fahrenheit", '°F', 33.8)
	static readonly romer = new ConverterUnit("Rømer", '°Rø', 7.875)
	static readonly rankine = new ConverterUnit("Rankine", '°R', 491.67)
	static readonly delisle = new ConverterUnit("Delisle", '°De', 148.5)
	static readonly all = [
		this.kelvin    , this.celcius, this.reamur ,
		this.fahrenheit, this.romer  , this.rankine,
		this.delisle
	]
}

export class TimeUnits {
	static readonly century = new ConverterUnit("Century", 'century', 1)
	static readonly decade = new ConverterUnit("Decade", 'decade', 10)
	static readonly year = new ConverterUnit("Year", 'y', 100)
	static readonly month = new ConverterUnit("Month", 'm', 12 * 100)
	static readonly week = new ConverterUnit("Week", 'w', 365.25 * 100 / 7)
	static readonly day = new ConverterUnit("Day", 'd', 365.25 * 100)
	static readonly hour = new ConverterUnit("Hour", 'h', 365.25 * 100 * 24)
	static readonly minute = new ConverterUnit("Minute", 'min', 365.25 * 100 * 24 * 60)
	static readonly second = new ConverterUnit("Second", 's', 365.25 * 100 * 24 * 60 * 60)
	static readonly millisecond = new ConverterUnit("Millisecond", 'ms', 365.25 * 100 * 24 * 60 * 60 * 1E3)
	static readonly microsecond = new ConverterUnit("Microsecond", 'μs', 365.25 * 100 * 24 * 60 * 60 * 1E6)
	static readonly nanosecond = new ConverterUnit("Nanosecond", 'ns', 365.25 * 100 * 24 * 60 * 60 * 1E9)
	static readonly all = [
		this.century    , this.decade     , this.year,
		this.month      , this.week       , this.day,
		this.hour       , this.minute     , this.second,
		this.millisecond, this.microsecond, this.nanosecond,
	]
}

export class WeightUnits {
	static readonly kilogram = new ConverterUnit("Kilogram", 'kg', 1E-3)
	static readonly hectogram = new ConverterUnit("Hectogram", 'hg', 1E-2)
	static readonly dekagram = new ConverterUnit("Dekagram", 'dag', 1E-1)
	static readonly gram = new ConverterUnit("Gram", 'g', 1)
	static readonly decigram = new ConverterUnit("Decigram", 'dg', 1E1)
	static readonly centigram = new ConverterUnit("Centigram", 'cg', 1E2)
	static readonly milligram = new ConverterUnit("Milligram", 'mg', 1E3)
	static readonly microgram = new ConverterUnit("Microgram", 'μg', 1E6)
	static readonly nanogram = new ConverterUnit("Nanogram", 'ng', 1E9)
	static readonly picogram = new ConverterUnit("Picogram", 'pg', 1E12)
	static readonly tonne = new ConverterUnit("Tonne", 't', 1E-6)
	static readonly ounce = new ConverterUnit("Ounce", 'oz', 0.0352739907)
	static readonly pound = new ConverterUnit("Pound", 'lbs', 0.0022046244)
	static readonly carrat = new ConverterUnit("Carrat", 'ct', 5)
	static readonly all = [
		this.kilogram , this.hectogram, this.dekagram,
		this.gram     , this.decigram , this.centigram,
		this.milligram, this.microgram, this.nanogram,
		this.picogram , this.tonne    , this.ounce,
		this.pound    , this.carrat
	]
}

export class FrequencyUnits {
	static readonly terahertz = new ConverterUnit("Terahertz", 'THz', 1E-12)
	static readonly gigahertz = new ConverterUnit("Gigahertz", 'GHz', 1E-9)
	static readonly megahertz = new ConverterUnit("Megahertz", 'MHz', 1E-6)
	static readonly kilohertz = new ConverterUnit("Kilohertz", 'KHz', 1E-3)
	static readonly hertz = new ConverterUnit("Hertz", 'Hz', 1)
	static readonly all = [
		this.terahertz, this.gigahertz, this.megahertz,

	]
}

export class PressureUnits {
	static readonly kilopascal = new ConverterUnit("Kilopascal", 'km', 1E-3)
	static readonly hectopascal = new ConverterUnit("Hectopascal", 'hm', 1E-2)
	static readonly dekapascal = new ConverterUnit("Dekapascal", 'dam', 1E-1)
	static readonly pascal = new ConverterUnit("Pascal", 'Pa', 1)
	static readonly decipascal = new ConverterUnit("Decipascal", 'dm', 1E1)
	static readonly centipascal = new ConverterUnit("Centipascal", 'cm', 1E2)
	static readonly millipascal = new ConverterUnit("Millipascal", 'mm', 1E3)
	static readonly micropascal = new ConverterUnit("Micropascal", 'μm', 1E6)
	static readonly nanopascal = new ConverterUnit("Nanopascal", 'nm', 1E9)
	static readonly picopascal = new ConverterUnit("Picopascal", 'pm', 1E12)
	static readonly bar = new ConverterUnit("Bar", 'bar', 1E-6)
	static readonly psi = new ConverterUnit("Psi", 'psi', 0.0001450377)
	static readonly atmosphere = new ConverterUnit("Atmosphere", 'atm', 0.0000098692)
	static readonly torr = new ConverterUnit("Torr", 'torr', 0.0075006168)
	static readonly all = [
		this.kilopascal , this.hectopascal, this.dekapascal,
		this.pascal     , this.decipascal , this.centipascal,
		this.millipascal, this.micropascal, this.nanopascal,
		this.bar        , this.psi        , this.atmosphere,
		this.torr
	]
}

export class AngleUnits {
	static readonly gradian = new ConverterUnit("Gradian", 'ᵍ', 400 / 2)
	static readonly radian = new ConverterUnit("Radian", 'rad', 1)
	static readonly degree = new ConverterUnit("Degree", '°', 180 / Math.PI)
	static readonly all = [
		this.gradian, this.radian, this.degree
	]
}