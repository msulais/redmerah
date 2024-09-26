export type ObjectStoreSettings<T = unknown> = {
    key: string
    value: T
}

export type ObjectStoreMiscellaneous<T = unknown> = {
    key: string
    value: T
}

export enum ObjectStoreNames {
    settings = 'settings',
    miscellaneous = 'miscellaneous'
}

export enum ObjectStoreKeys {
    /** @param value `Pages` */
    miscellaneous_lastPage = 'lastPage',

    /** @param value `HEXColor` */
    settings_backgroundColor = 'backgroundColor',

    /** @param value `HEXColor` */
    settings_color = 'color',

    /** @param value `number` */
    settings_margin = 'margin',

    /** @param value `1-40 | null` */
    settings_version = 'version',

    /** @param value `ErrorCorrectionLevel` */
    settings_errorCorrectionLevel = 'errorCorrectionLevel',

    /** @param value `EncodingMode` */
    settings_encodingMode = 'encodingMode',
}