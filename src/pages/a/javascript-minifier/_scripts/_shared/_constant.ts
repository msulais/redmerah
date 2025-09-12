import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"

export const DEFAULT_THEME = PlatformThemeMode.auto
export const DEFAULT_ANIMATION = PlatformAnimationMode.auto
export const DEFAULT_TEXT_WRAP = true
export const DEFAULT_MODULE = true
export const DEFAULT_KEEP_CLASS_NAMES = false
export const DEFAULT_KEEP_FUNC_NAMES = false
export const DEFAULT_TOP_LEVEL = true
export const DEFAULT_BEAUTIFY = true
export const DEFAULT_JAVASCRIPT_INPUT_TEXT = `console.log("Hello world")

function add(num1, num2){
    return num1 + num2
}

const PI = Math.PI
console.log(add(90, PI))

(() => {
    'use strict'
    let firstName = 'Lorem'
    let secondName = 'Ipsum'

    function log(...data) {
        return console.log(...data)
    }

    log(firstName, secondName)
    log(1, 2, 0xE123, firstName, secondName)
})()`
export const DEFAULT_JAVASCRIPT_OUTPUT_TEXT = `console.log("Hello world");
const o = Math.PI;
console.log(90 + o)((() => {
    let o = "Lorem",
        l = "Ipsum";

    function e(...o) {
        return console.log(...o)
    }
    e(o, l), e(1, 2, 57635, o, l)
}))();`