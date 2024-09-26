export enum Pages {
    scan,
    generate
}

export enum ErrorCorrectionLevel {
    low = 'L',
    medium = 'M',
    quartile = 'Q',
    high = 'H'
}

export enum EncodingMode {
    auto = 'Auto',
    numeric = 'numeric',
    alphanumeric = 'alphanumeric',
    byte = 'byte',
    kanji = 'kanji'
}

export enum CopyFileType {
    png,
    svg
}

export enum DownloadFileType {
    png,
    jpeg,
    svg
}

export enum Commands {
    /** @param { Pages } page `Pages` */
    change_page = 'a',

    /** @param { ErrorCorrectionLevel } level `ErrorCorrectionLevel` */
    change_settings_errorCorrectionLevel = 'b',

    /** @param { HEXColor } color `HEXColor` */
    change_settings_color = 'c',

    /** @param { HEXColor } color `HEXColor` */
    change_settings_backgroundColor = 'd',

    /** @param { number } value `number` */
    change_settings_margin = 'e',

    /** @param { number | null } version `number | null` */
    change_settings_version = 'f',

    /** @param { EncodingMode } mode `EncodingMode` */
    change_settings_encodingMode = 'g',

    /** @param { string } data `string` */
    change_QRCodeData = 'h',

    /** @param { DownloadFileType } type `DownloadFileType` */
    download_QRCode = 'i',

    /**
    @param { Event } event `Event`
    @param { CopyFileType } type `CopyFileType` */
    copy_QRCode = 'j',
}