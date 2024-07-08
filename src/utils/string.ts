import { _join, _map, _push, _split, _substring, _toLowerCase, _toUpperCase } from "@/data/string";

export function stringToLowerCase(text: string): string {
    return text[_toLowerCase]()
}

export function stringToUpperCase(text: string): string {
    return text[_toUpperCase]()
}

export function stringToTitleCase(text: string): string {
    return text[_split](' ')[_map](v => 
        stringToUpperCase(v[_substring](0, 1)) + stringToLowerCase(v)[_substring](1)
    )[_join](' ')
}

export function stringToToggleCase(text: string): string {
    const result: string[] = [];
    for (let char of text) {
        const isLower = char === stringToLowerCase(char)
        result[_push](isLower ? stringToUpperCase(char) : stringToLowerCase(char));
    }
    return result[_join]('');
}