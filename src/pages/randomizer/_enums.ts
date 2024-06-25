export enum RandomizerType {
    string = 'string',
    numbers = 'numbers',
    words = 'words',
    selection = 'selection',
    colors = 'colors',
    teams = 'teams'
}

export enum NumbersRandomizerNumberType {
    decimal = 10,
    hexadecimal = 16,
    octal = 8,
    binary = 2
}

export enum NumbersRandomizerSort {
    ascending,
    descending,
    none,
}

export enum WordsRandomizerWordCase {
    uppercase,
    lowercase,
    titlecase,
    togglecase,
    none
}

export enum ColorsRandomizerColorModel {
    rgb,
    hsl,
    hex
}