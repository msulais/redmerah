import { createSignal, type VoidComponent } from "solid-js";

import { _string, _characters, _numbers, _symbols, _length, _floor, _range, _max, _min, _count, _repeat, _includes, _push, _sort, _ascending, _descending, _map, _prefix, _toString, _numberType, _padStart, _suffix, _join, _separator, _colors, _round, _colorModel, _hex, _rgb, _hsl, _words, _selection, _teams, _animation, _result, _settings, _decimal, _none } from "@/data/string";
import { rgbToHex, hslToHex } from "@/utils/color";
import { setTimeInterval, clearTimeInterval } from "@/utils/timeout";
import { createStore } from "solid-js/store";
import { RandomizerType, WordsRandomizerWordCase, NumbersRandomizerNumberType, NumbersRandomizerSort, ColorsRandomizerColorModel } from "./_enums";
import type { Result, Settings } from "./_types";
import { mathFloor, mathRandom } from "@/utils/math";

import AppBar from './_AppBar'
import SideNavigation from './_SideNavigation'
import Control from './_Control'
import ResultComponent from './_Result'
import CSS from './_index.module.scss'

export const App: VoidComponent = () => {
    const
        _minDecimalLength = 'minDecimalLength',
        _alphabetLowercase = 'alphabetLowercase',
        _alphabetUppercase = 'alphabetUppercase',
        _customCharacter = 'customCharacter'
    ;
    const [randomizerType, setRandomizerType] = createSignal<RandomizerType>(RandomizerType[_string])
    const [intervalId, setIntervaldId] = createSignal<number | null>(null)
    const [settings, setSettings] = createStore<Settings>({
        string: {
            animation: true,
            length: 8,
            characters: {
                alphabetLowercase: true,
                alphabetUppercase: true,
                numbers: true,
                symbols: false,
                customCharacter: '',
            }
        },
        words: {
            animation: true,
            count: 3,
            listId: '',
            prefix: '',
            repeat: true,
            separator: ' ',
            suffix: '',
            wordCase: WordsRandomizerWordCase[_none]
        },
        numbers: {
            animation: true,
            count: 3,
            minDecimalLength: 0,
            numberType: NumbersRandomizerNumberType[_decimal],
            prefix: '',
            range: {
                min: 0,
                max: 200
            },
            repeat: true,
            separator: ', ',
            sort: NumbersRandomizerSort[_none],
            suffix: '',
        },
        colors: {
            animation: true,
            colorModel: ColorsRandomizerColorModel[_rgb],
            count: 3,
            range: {
                hex: { min: 0, max: 0xffffff },
                hsl: {
                    h: { min: 0, max: 360 },
                    s: { min: 0, max: 100 },
                    l: { min: 0, max: 100 },
                },
                rgb: {
                    r: { min: 0, max: 255 },
                    g: { min: 0, max: 255 },
                    b: { min: 0, max: 255 },
                },
            }
        },
        selection: {
            animation: true,
            count: 3,
            listId: ''
        },
        teams: {
            animation: true,
            count: 3,
            membersListId: '',
            namesListId: ''
        }
    })
    const [result, setResult] = createStore<Result>({
        string: '',
        colors: [],
        numbers: '',
        selection: [],
        teams: [],
        words: ''
    })

    function generate(): void {
        if (randomizerType() == RandomizerType[_string]) {
            let text: string = ''
            let charList: string = ''
            const characters = settings[_string][_characters]

            if (characters[_alphabetLowercase]) {
                charList += 'abcdefghijklmnopqrstuvwxyz'
            }
            if (characters[_alphabetUppercase]) {
                charList += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
            }
            if (characters[_numbers]){
                charList += '0123456789'
            }
            if (characters[_symbols]){
                charList += "<({[!@#$%^&*_-+=~`\\|\"':;?/.,]})>"
            }
            if (characters[_customCharacter]){
                charList += characters[_customCharacter]
            }

            for (let i = 0; i < settings[_string][_length]; i++) {
                text += charList[mathFloor(mathRandom() * charList[_length])]
            }

            setResult(_string, text)

        } else if (randomizerType() == RandomizerType[_numbers]) {
            const numbers: number[] = []
            const range: number = settings[_numbers][_range][_max] - settings[_numbers][_range][_min]

            for (let i = 0; i < settings[_numbers][_count]; i++) {
                const v: number = settings[_numbers][_range][_min] + 1 + mathFloor(mathRandom() * range)

                if (!settings[_numbers][_repeat] && numbers[_includes](v)) continue

                numbers[_push](v)
            }

            let iteration = 0
            while (numbers[_length] < settings[_numbers][_count] && iteration < 255){
                const v: number = settings[_numbers][_range][_min] + 1 + mathFloor(mathRandom() * range)

                if (!settings[_numbers][_repeat] &&
                    numbers[_includes](v) &&
                    numbers[_length] < range) {
                    continue
                }

                numbers[_push](v)
                ++iteration
            }

            if (settings[_numbers][_sort] == NumbersRandomizerSort[_ascending]) {
                numbers[_sort]((a, b) => a - b)
            } else if (settings[_numbers][_sort] == NumbersRandomizerSort[_descending]){
                numbers[_sort]((a, b) => b - a)
            }

            setResult(_numbers, [...numbers][_map](v =>
                settings[_numbers][_prefix] +
                v[_toString](settings[_numbers][_numberType])[_padStart](settings[_numbers][_minDecimalLength], '0') +
                settings[_numbers][_suffix]
            )[_join](settings[_numbers][_separator]))

        } else if (randomizerType() == RandomizerType[_colors]) {
            const s = settings[_colors]
            let colors: string[] = []
            const randomNumber = (min: number, max: number): number => {
                const range = max - min
                let value = min + 1 + mathFloor(mathRandom() * range)
                return Math[_round](value)
            }

            if (s[_colorModel] == ColorsRandomizerColorModel[_hex]) {
                for (let i = 0; i < s[_count]; i++) {
                    const value = randomNumber(s[_range][_hex][_min], s[_range][_hex][_max])
                    colors[_push]('#' + value[_toString](16)[_padStart](6, '0'))
                }
            } else if (s[_colorModel] == ColorsRandomizerColorModel[_rgb]) {
                for (let i = 0; i < s[_count]; i++) {
                    const r = randomNumber(s[_range][_rgb].r[_min], s[_range][_rgb].r[_max])
                    const g = randomNumber(s[_range][_rgb].g[_min], s[_range][_rgb].g[_max])
                    const b = randomNumber(s[_range][_rgb].b[_min], s[_range][_rgb].b[_max])
                    colors[_push](rgbToHex({r, g, b}))
                }
            } else if (s[_colorModel] == ColorsRandomizerColorModel[_hsl]) {
                for (let i = 0; i < s[_count]; i++) {
                    const hue = randomNumber(s[_range][_hsl].h[_min], s[_range][_hsl].h[_max]) / 360
                    const saturation = randomNumber(s[_range][_hsl].s[_min], s[_range][_hsl].s[_max]) / 100
                    const lightness = randomNumber(s[_range][_hsl].l[_min], s[_range][_hsl].l[_max]) / 100
                    colors[_push](hslToHex({h: hue, s: saturation, l: lightness}))
                }
            }

            setResult(_colors, [...colors])

        } else if (randomizerType() == RandomizerType[_words]) {

        } else if (randomizerType() == RandomizerType[_selection]) {

        } else if (randomizerType() == RandomizerType[_teams]) {

        }
    }

    async function onGenerate(): Promise<void> { return new Promise((resolve) => {
        let type = _string
        if (randomizerType() == RandomizerType[_string]) type = _string
        else if (randomizerType() == RandomizerType[_numbers]) type = _numbers
        else if (randomizerType() == RandomizerType[_words]) type = _words
        else if (randomizerType() == RandomizerType[_selection]) type = _selection
        else if (randomizerType() == RandomizerType[_colors]) type = _colors
        else if (randomizerType() == RandomizerType[_teams]) type = _teams;

        if (settings[type as keyof Settings][_animation]){
            const duration = 3000
            const step = 250
            let i = 0
            const t = setTimeInterval(() => {

                // max duration: 3 seconds
                if (i >= duration / step) {
                    clearTimeInterval(intervalId()!)
                    addResultToDB()
                    resolve()
                }
                generate()
                ++i
            }, step)
            setIntervaldId(t)
        } else {
            generate()
            addResultToDB()
            resolve()
        }
    })}

    function onStopGenerate(): void {
        clearTimeInterval(intervalId()!)
        addResultToDB()
    }

    async function onCopyResult(): Promise<boolean> {
        // TODO: on copy result
        return false
    }

    async function onBookmarkResult(): Promise<boolean> {
        // TODO: on bookmark result
        return false
    }

    function onChangeRandomizer(type: RandomizerType): void {
        setRandomizerType(type)
        // TODO: save to db
    }

    function addResultToDB(): void {
        // TODO: add result to DB
    }

    return (<>
        <AppBar
            onGenerate={onGenerate}
            onStopGenerate={onStopGenerate}
            randomizerType={randomizerType()}
            onCopyResult={onCopyResult}
            onBookmarkResult={onBookmarkResult}
            settings={[settings, setSettings]}
        />
        <div class={ CSS.body }>
            <SideNavigation
                randomizerType={randomizerType()}
                onChangeRandomizer={onChangeRandomizer}
            />
            <main class={ CSS.main }>
                <Control
                    randomizerType={randomizerType()}
                    settings={[settings, setSettings]}
                />
                <ResultComponent
                    randomizerType={randomizerType()}
                    result={[result, setResult]}
                />
            </main>
        </div>
    </>)
}