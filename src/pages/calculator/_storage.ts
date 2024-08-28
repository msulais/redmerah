export type ObjectStoreSettings<T = unknown> = {
    key: string
    value: T
}

export type ObjectStoreLastInput<T = unknown> = {
    key: string
    value: T
}

export type ObjectStoreLastOutput<T = unknown> = {
    key: string
    value: T
}

export type ObjectStoreMiscellaneous<T = unknown> = {
    key: string
    value: T
}

export enum ObjectStoreNames {
    settings = 'settings', 
    lastInput = 'lastInput', 
    lastOutput = 'lastOutput', 
    miscellaneous = 'miscellaneous'
}

export enum ObjectStoreKeys {

    /** @param value `string|null` */
    lastInput_basic = 'basic',

    /** @param value `string|null` */
    lastInput_scientific = 'scientific',

    /** @param value `string|null` */
    lastInput_converter = 'converter',

    /** @param value `string|null` */
    lastInput_programmer = 'programmer',

    /** @param value `string` */
    lastInput_date_from = 'date/from',

    /** @param value `string` */
    lastInput_date_to = 'date/to',

    /** @param value `number` */
    lastInput_date_year = 'date/year',

    /** @param value `number` */
    lastInput_date_month = 'date/month',

    /** @param value `number` */
    lastInput_date_day = 'date/day',
    
    /** @param value `number | null` */
    lastOutput_basic = 'basic',
    
    /** @param value `number | null` */
    lastOutput_scientific = 'scientific',
    
    /** @param value `number | null` */
    lastOutput_converter = 'converter',

    /** @param value `number | null` */
    lastOutput_programmer = 'programmer',

    /** @param value`string | null` */
    lastOutput_date = 'date',
    
    /** @param {CalculatorType} value `CalculatorType` */
    miscellaneous_lastPage = 'lastPage',
    
    /** @param value `string` */
    miscellaneous_note = 'note',
    
    /** @param {DecimalNumberFormat} value `DecimalNumberFormat` */
    settings_numberFormat_decimal = 'numberFormat/decimal',

    /** @param {GroupingNumberFormat} value `GroupingNumberFormat` */
    settings_numberFormat_grouping = 'numberFormat/grouping', 
    
    /** @param value `boolean` */
    settings_scientificNotation = 'scientificNotation',

    /** @param value `boolean` */
    settings_memoryButtons = 'memoryButtons', 

    /** @param {ConverterType} value `ConverterType` */
    settings_converter_type = 'converter/type',

    /** @param {ConverterUnit} value `ConverterUnit` */
    settings_converter_inputUnit = 'converter/inputUnit',

    /** @param {ConverterUnit} value `ConverterUnit` */
    settings_converter_outputUnit = 'converter/outputUnit',

    /** @param {ScientificAngleType} value `ScientificAngleType` */
    settings_scientific_angle = 'scientific/angle', 

    /** @param {NumberType} value `NumberType` */
    settings_programmer_numberType = 'programmer/numberType',

    /** @param {DateOperation} value `DateOperation` */
    settings_date_operation = 'date/operation'
}