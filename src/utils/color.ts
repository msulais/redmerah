/**
 * Resources:
 * http://www.easyrgb.com/en/math.php
 * https://www.myndex.com/WEB/LuminanceContrast
 */

import { _padStart, _slice, _startsWith, _substring, _test, _toString } from "@/constants/string"
import type { RGBColor, HSLColor, HSVColor, HEXColor } from "@/types/color"
import { mathFloor, mathMax, mathMin, mathPow, mathRound, numberParse } from "./math"

export function testHexColorWithAlpha(hex: string): void {
    if (/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/i[_test](hex)) return
    throw new Error("Invalid hex color format!")
}

export function testHexColor(hex: string): void {
    if (/^#[0-9a-fA-F]{6}$/i[_test](hex)) return
    throw new Error("Invalid hex color format!")
}

export function getLuminance(rgb: RGBColor): number {

    const r = mathPow(rgb.r / 255, 2.2)
    const g = mathPow(rgb.g / 255, 2.2)
    const b = mathPow(rgb.b / 255, 2.2)
    const luminance = r * 0.2126 + g * 0.7152 + b * 0.0722

    return luminance
}

/**
 * `Y` = Luminance
 */
export function YtoLstar(Y: number): number {
    if (Y <= (216 / 24389)) return Y * (24389 / 27)
    return mathPow(Y, (1 / 3)) * 116 - 16
}

/**
 * Result value is between `0` (low contrast) to `100` (high contrast)
 */
export function getContrastRatio(rgb1: RGBColor, rgb2: RGBColor): number {
    const L1 = YtoLstar(getLuminance(rgb1))
    const L2 = YtoLstar(getLuminance(rgb2))
    const ratio = mathMax(L1, L2) - mathMin(L1, L2)
    return ratio
}

export function hexToHSL(hex: string): HSLColor {
    return rgbToHsl(hexToRgb(hex))
}

export function rgbToHsl(rgb: RGBColor): HSLColor {
    let h = 0, s = 0, l = 0
    const r = rgb.r / 255
    const g = rgb.g / 255
    const b = rgb.b / 255

    const min = mathMin(r, g, b)
    const max = mathMax(r, g, b)
    const delta = max - min

    l = (max + min) / 2

    if (delta == 0) {
        h = 0
        s = 0
        return {h, s, l}
    }

    if (l < 0.5) s = delta / (max + min)
    else s = delta / (2 - max - min)

    const deltaR = (((max - r) / 6) + (delta / 2)) / delta
    const deltaG = (((max - g) / 6) + (delta / 2)) / delta
    const deltaB = (((max - b) / 6) + (delta / 2)) / delta

    if (r == max) h = deltaB - deltaG
    else if (g == max) h = (1 / 3) + deltaR - deltaB
    else if (b == max) h = (2 / 3) + deltaG - deltaR

    if (h < 0) h += 1
    if (h > 1) h -= 1

    return {h, s, l}
}

export function hexToRgb(hex: string): RGBColor {
    testHexColor(hex)

    hex = hex[_startsWith]("#") ? hex[_slice](1) : hex

    const r = numberParse(hex[_substring](0, 2), true, 16)
    const g = numberParse(hex[_substring](2, 4), true, 16)
    const b = numberParse(hex[_substring](4, 6), true, 16)
    return { r, g, b }
}

export function hueToRgb(v1: number, v2: number, vH: number) {
    while (vH < 0) vH += 1
    while (vH > 1) vH -= 1

    if (6 * vH < 1) return v1 + (v2 - v1) * 6 * vH
    if (2 * vH < 1) return v2
    if (3 * vH < 2) return v1 + (v2 - v1) * (2 / 3 - vH) * 6
    return v1
}

export function hslToRgb(hsl: HSLColor): RGBColor {
    let r, g, b

    if (hsl.s == 0) r = g = b = hsl.l
    else {
        const v2 = hsl.l < 0.5
            ? hsl.l * (1 + hsl.s)
            : hsl.l + hsl.s - hsl.s * hsl.l
        const v1 = 2 * hsl.l - v2

        r = hueToRgb(v1, v2, hsl.h + 1 / 3)
        g = hueToRgb(v1, v2, hsl.h)
        b = hueToRgb(v1, v2, hsl.h - 1 / 3)
    }

    return {
        r: mathRound(r * 255),
        g: mathRound(g * 255),
        b: mathRound(b * 255)
    }
}

export function hslToHex(hsl: HSLColor): HEXColor {
    return rgbToHex(hslToRgb(hsl))
}

export function rgbToHex(rgb: RGBColor): HEXColor {
    return ('#'
        + rgb.r[_toString](16)[_padStart](2, '0')
        + rgb.g[_toString](16)[_padStart](2, '0')
        + rgb.b[_toString](16)[_padStart](2, '0')
    ) as HEXColor
}

export function rgbToHsv(rgb: RGBColor): HSVColor {
    let h: number = 0
    let s: number = 0
    let v: number = 0

    const r = rgb.r / 255
    const g = rgb.g / 255
    const b = rgb.b / 255

    const min = mathMin(r, g, b)
    const max = mathMax(r, g, b)
    const delta = max - min

    v = max

    if (delta == 0) {
        s = 0
        h = 0
        return {h, s, v}
    }

    s = delta / max

    const deltaR = (((max - r) / 6) + (delta / 2)) / delta
    const deltaG = (((max - g) / 6) + (delta / 2)) / delta
    const deltaB = (((max - b) / 6) + (delta / 2)) / delta

    if (r == max) h = deltaB - deltaG
    else if (g == max) h = (1 / 3) + deltaR - deltaB
    else if (b == max) h = (2 / 3) + deltaG - deltaR

    if (h < 0) h += 1
    if (h > 1) h -= 1

    return {h, s, v}
}

export function hsvToRgb(hsv: HSVColor): RGBColor {
    let r, g, b

    if (hsv.s == 0) {
        r = g = b = mathRound(hsv.v * 255)
        return {r, g, b}
    }

    let h = hsv.h * 6
    if (h == 6) h = 0

    const i = mathFloor(h)
    const j = hsv.v * (1 - hsv.s)
    const k = hsv.v * (1 - hsv.s * (h - i))
    const l = hsv.v * (1 - hsv.s * (1 - (h - i)))

    if (i == 0){
        r = hsv.v
        g = l
        b = j
    }
    else if (i == 1){
        r = k
        g = hsv.v
        b = j
    }
    else if (i == 2){
        r = j
        g = hsv.v
        b = l
    }
    else if (i == 3){
        r = j
        g = k
        b = hsv.v
    }
    else if (i == 4){
        r = l
        g = j
        b = hsv.v
    }
    else {
        r = hsv.v
        g = j
        b = k
    }

    r = mathRound(r * 255)
    g = mathRound(g * 255)
    b = mathRound(b * 255)

    return {r, g, b}
}

export function hslToHsv(hsl: HSLColor): HSVColor {
    return rgbToHsv(hslToRgb(hsl))
}

export function hsvToHsl(hsv: HSVColor): HSLColor {
    return rgbToHsl(hsvToRgb(hsv))
}

/**
 * Generate 4 different color from color source:
 * - Color
 * - On Color
 * - Color Dark
 * - On Color Dark
*/
export function generateColor(hex: HEXColor): { color: HEXColor; onColor: HEXColor; colorDark: HEXColor; onColorDark: HEXColor }{
    testHexColor(hex)
    const hsl = {...hexToHSL(hex), s: 1}

    /**
     * `contrast` must be a value between `0 (bad) => 100 (best (high contrast))`.
     */
    function getLightness(hsl: HSLColor, contrast: number){
        let lightness = 0
        const brightness = YtoLstar(getLuminance(hslToRgb(hsl)))

        for (let i = 0; i < 101; i++){
            if (brightness > 50) lightness = i / 100
            else lightness = 1 - (i / 100)

            if (getContrastRatio(hslToRgb(hsl), hslToRgb({...hsl, l: lightness})) <= contrast) break
        }

        return mathMax(0, mathMin(1, lightness))
    }

    /**
     * @param hsl
     * @param contrast Range from `0` to `100` (`0`=darkest, `100`=lightest)
     */
    function getColor(hsl: HSLColor, contrast: number): HSLColor {
        const highToLow: boolean = contrast <= 50 ? true : false
        const brightness = (c: HSLColor) => YtoLstar(getLuminance(hslToRgb(c)))
        let lightness: number = 0

        for (let i = 0; i < 101; i++){
            if (highToLow) {
                lightness = 1 - (i / 100)
                hsl = {...hsl, l: lightness}
                if (brightness(hsl) <= contrast) break;
                continue
            }

            lightness = i / 100
            hsl = {...hsl, l: lightness}
            if (brightness(hsl) >= contrast) break
        }

        return hsl
    }

    const color = getColor(hsl, 88 - getContrastRatio(hslToRgb(hsl), {r: 255, g: 255, b: 255}))
    const onColor = {...color, l: getLightness(color, 100)}
    const colorDark = getColor(color, 72)
    const onColorDark = {...colorDark, l: getLightness(colorDark, 100)}

    return {
        color       : hslToHex(color       ),
        onColor     : hslToHex(onColor     ),
        colorDark   : hslToHex(colorDark   ),
        onColorDark : hslToHex(onColorDark )
    }
}