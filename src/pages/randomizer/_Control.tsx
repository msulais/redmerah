import { type Component, Match, Switch, type VoidComponent, createEffect, createMemo, createSignal } from "solid-js";
import type { SetStoreFunction } from "solid-js/store/types/store";

import { getBoundingClientRect } from "@/utils/element";
import { PopoverPosition } from "@/enums/position";
import { toggleAttribute } from "@/utils/attributes";
import { openPopover } from "@/utils/popover";
import type { ComponentEvent } from "@/types/event";
import { RandomizerType, ColorsRandomizerColorModel } from "./_enums";
import type { Settings } from "./_types";
import { _settings, _string, _numbers, _length, _push, _join, _width, _currentTarget, _CENTER_BOTTOM_TO_LEFT, _value, _characters, _symbols, _colors, _match, _max, _min, _replace, _range, _count, _colorModel, _hex, _hsl, _isNaN, _rgb } from "@/data/string";

import Icon from "@/components/Icon";
import Tooltip from "@/components/Tooltip";
import TextField, { NumberTextField, TextFieldTrailingButton, changeTextFieldValue } from "@/components/TextField";
import Menu, { MenuDivider, MenuHeader, MenuItem } from "@/components/Menu";
import CSS from './_Control.module.scss'

type Props = {
    randomizerType: RandomizerType
    settings: [Settings, SetStoreFunction<Settings>]
}

type $StringProps = {
    settings: [Settings, SetStoreFunction<Settings>]
}

type NumbersProps = {
    settings: [Settings, SetStoreFunction<Settings>]
}

type ColorsProps = {
    settings: [Settings, SetStoreFunction<Settings>]
}

const Colors: VoidComponent<ColorsProps> = (props) => {
    function getMinMax(value: string, maxValue: number, defaultValue: {min: number; max: number }): {min: number; max: number} {
        let min: number = defaultValue[_min]
        let max: number = defaultValue[_max]
        const unnecesaryChar = /[^\d-.]|(?<=\d)\.\d+|(?<!\d)\.(?=\d)/gs
        const rangeRegex = /([-+]?\d+?) ?- ?([-+]?\d+)/
        const r = value[_replace](unnecesaryChar, '')[_match](rangeRegex)
        if (r == null) return {min, max}

        min = parseInt(r[1])
        max = parseInt(r[2])

        if (Number[_isNaN](min)) min = defaultValue[_min]
        if (Number[_isNaN](max)) min = defaultValue[_max]
        if (min < 0) min = 0
        if (max < 0) max = 0
        if (min > maxValue) min = maxValue
        if (max > maxValue) max = maxValue

        if (min > max) min = max
        return {min, max}
    }

    return (<>
        <NumberTextField
            min={1}
            labelText="Count"
            value={props[_settings][0][_colors][_count]}
            onFinalValueChanged={(v) => props[_settings][1](_colors, _count, v)}
        />
        <Switch>
            <Match when={props[_settings][0][_colors][_colorModel] == ColorsRandomizerColorModel[_hex]}>
                <TextField
                    labelText="Hex"
                    placeholder="0-16777215 - 0-16777215"
                    onBlur={(ev) => {
                        const values = getMinMax(
                            ev[_currentTarget][_value],
                            0xffffff,
                            {
                                min: props[_settings][0][_colors][_range][_hex][_min],
                                max: props[_settings][0][_colors][_range][_hex][_max]
                            }
                        )
                        props[_settings][1](_colors, _range, _hex, values)
                        changeTextFieldValue(ev[_currentTarget], [values[_min], values[_max]][_join](' - '))
                    }}
                    value={[
                        props[_settings][0][_colors][_range][_hex][_min],
                        props[_settings][0][_colors][_range][_hex][_max]
                    ][_join](' - ')}
                />
            </Match>
            <Match when={props[_settings][0][_colors][_colorModel] == ColorsRandomizerColorModel[_hsl]}>
                <TextField
                    labelText="Hue"
                    placeholder="0-360 - 0-360"
                    onBlur={(ev) => {
                        const values = getMinMax(
                            ev[_currentTarget][_value],
                            360,
                            {
                                min: props[_settings][0][_colors][_range][_hsl].h[_min],
                                max: props[_settings][0][_colors][_range][_hsl].h[_max]
                            }
                        )
                        props[_settings][1](_colors, _range, _hsl, 'h', values)
                        changeTextFieldValue(ev[_currentTarget], [values[_min], values[_max]][_join](' - '))
                    }}
                    value={[
                        props[_settings][0][_colors][_range][_hsl].h[_min],
                        props[_settings][0][_colors][_range][_hsl].h[_max]
                    ][_join](' - ')}
                />
                <TextField
                    labelText="Saturation"
                    placeholder="0-100 - 0-100"
                    onBlur={(ev) => {
                        const values = getMinMax(
                            ev[_currentTarget][_value],
                            100,
                            {
                                min: props[_settings][0][_colors][_range][_hsl].s[_min],
                                max: props[_settings][0][_colors][_range][_hsl].s[_max]
                            }
                        )
                        props[_settings][1](_colors, _range, _hsl, 's', values)
                        changeTextFieldValue(ev[_currentTarget], [values[_min], values[_max]][_join](' - '))
                    }}
                    value={[
                        props[_settings][0][_colors][_range][_hsl].s[_min],
                        props[_settings][0][_colors][_range][_hsl].s[_max]
                    ][_join](' - ')}
                />
                <TextField
                    labelText="Lightness"
                    placeholder="0-100 - 0-100"
                    onBlur={(ev) => {
                        const values = getMinMax(
                            ev[_currentTarget][_value],
                            100,
                            {
                                min: props[_settings][0][_colors][_range][_hsl].l[_min],
                                max: props[_settings][0][_colors][_range][_hsl].l[_max]
                            }
                        )
                        props[_settings][1](_colors, _range, _hsl, 'l', values)
                        changeTextFieldValue(ev[_currentTarget], [values[_min], values[_max]][_join](' - '))
                    }}
                    value={[
                        props[_settings][0][_colors][_range][_hsl].l[_min],
                        props[_settings][0][_colors][_range][_hsl].l[_max]
                    ][_join](' - ')}
                />
            </Match>
            <Match when={props[_settings][0][_colors][_colorModel] == ColorsRandomizerColorModel[_rgb]}>
                <TextField
                    labelText="Red"
                    placeholder="0-225 - 0-255"
                    onBlur={(ev) => {
                        const values = getMinMax(
                            ev[_currentTarget][_value],
                            255,
                            {
                                min: props[_settings][0][_colors][_range][_rgb].r[_min],
                                max: props[_settings][0][_colors][_range][_rgb].r[_max]
                            }
                        )
                        props[_settings][1](_colors, _range, _rgb, 'r', values)
                        changeTextFieldValue(ev[_currentTarget], [values[_min], values[_max]][_join](' - '))
                    }}
                    value={[
                        props[_settings][0][_colors][_range][_rgb].r[_min],
                        props[_settings][0][_colors][_range][_rgb].r[_max]
                    ][_join](' - ')}
                />
                <TextField
                    labelText="Green"
                    placeholder="0-225 - 0-255"
                    onBlur={(ev) => {
                        const values = getMinMax(
                            ev[_currentTarget][_value],
                            255,
                            {
                                min: props[_settings][0][_colors][_range][_rgb].g[_min],
                                max: props[_settings][0][_colors][_range][_rgb].g[_max]
                            }
                        )
                        props[_settings][1](_colors, _range, _rgb, 'g', values)
                        changeTextFieldValue(ev[_currentTarget], [values[_min], values[_max]][_join](' - '))
                    }}
                    value={[
                        props[_settings][0][_colors][_range][_rgb].g[_min],
                        props[_settings][0][_colors][_range][_rgb].g[_max]
                    ][_join](' - ')}
                />
                <TextField
                    labelText="Blue"
                    placeholder="0-225 - 0-255"
                    onBlur={(ev) => {
                        const values = getMinMax(
                            ev[_currentTarget][_value],
                            255,
                            {
                                min: props[_settings][0][_colors][_range][_rgb].b[_min],
                                max: props[_settings][0][_colors][_range][_rgb].b[_max]
                            }
                        )
                        props[_settings][1](_colors, _range, _rgb, 'b', values)
                        changeTextFieldValue(ev[_currentTarget], [values[_min], values[_max]][_join](' - '))
                    }}
                    value={[
                        props[_settings][0][_colors][_range][_rgb].b[_min],
                        props[_settings][0][_colors][_range][_rgb].b[_max]
                    ][_join](' - ')}
                />
            </Match>
        </Switch>
    </>)
}

const Numbers: VoidComponent<NumbersProps> = (props) => {
    function onBlurRange(ev: ComponentEvent<FocusEvent, HTMLInputElement>): void {
        const rangeRegex = /([-+]?\d+?) ?- ?([-+]?\d+)/
        const unnecesaryChar = /[^\d-.]|(?<=\d)\.\d+|(?<!\d)\.(?=\d)/gs
        const r = ev[_currentTarget][_value][_replace](unnecesaryChar, '')[_match](rangeRegex)
        if (r == null) return changeTextFieldValue(
            ev[_currentTarget],
            [
                props[_settings][0][_numbers][_range][_min],
                props[_settings][0][_numbers][_range][_max]
            ][_join](' - ')
        )

        const max = parseInt(r[2])
        let min = parseInt(r[1])

        if (min > max) min = max

        props[_settings][1](_numbers, _range, { min, max })
        changeTextFieldValue(ev[_currentTarget], [min, max][_join](' - '))
    }

    return (<>
        <TextField
            labelText="Range"
            onBlur={onBlurRange}
            labelElement={{ style: { width: 'min(100%, 164px)' } }}
            value={[props[_settings][0][_numbers][_range][_min], props[_settings][0][_numbers][_range][_max]][_join](' - ')}
        />
        <NumberTextField
            labelText="Count"
            min={1}
            onFinalValueChanged={(v) => props[_settings][1](_numbers, _count, v)}
            labelElement={{ style: { width: 'min(100%, 164px)' } }}
            value={props[_settings][0][_numbers][_count]}
        />
    </>)
}

const $String: Component<$StringProps> = (props) => {
    const
        _alphabetLowercase = 'alphabetLowercase',
        _alphabetUppercase = 'alphabetUppercase',
        _customCharacter = 'customCharacter'
    ;
    const [isCharactersMenuOpen, setIsCharactersMenuOpen] = createSignal<boolean>(false)
    const [charactersMenuWidth, setCharactersMenuWidth] = createSignal<number>(0)
    const [charactersBtnRef, setCharactersBtnRef] = createSignal<HTMLButtonElement | null>(null)
    const settings = createMemo(() => props[_settings][0][_string])
    let charactersLabelRef!: HTMLLabelElement
    let charactersInputRef!: HTMLInputElement
    let charactersMenuRef!: HTMLElement

    createEffect(() => {
        const s = settings()
        const lowercase = s[_characters][_alphabetLowercase]
        const uppercase = s[_characters][_alphabetUppercase]
        const numbers = s[_characters][_numbers]
        const symbols = s[_characters][_symbols]
        const customCharacter = s[_characters][_customCharacter]

        if (!lowercase && !uppercase && !numbers && !symbols && customCharacter[_length] == 0) {
            props[_settings][1](_string, _characters, c => {return {
                ...c,
                alphabetLowercase: true,
                alphabetUppercase: true,
                numbers: true,
            }})
        }

        const text: string[] = []
        if (uppercase) text[_push]('A-Z')
        if (lowercase) text[_push]('a-z')
        if (numbers) text[_push]('0-9')
        if (symbols) text[_push]('<({[!@#$%^&*_-+=~`\\|"\':;?/.,]})>')
        if (customCharacter[_length] > 0) text[_push](customCharacter)

        changeTextFieldValue(charactersInputRef, text[_join](', '))
    })

    return (<>
        <NumberTextField
            labelElement={{ style: { width: 'min(100%, 164px)' } }}
            value={settings()[_length]}
            onFinalValueChanged={(v) => props[_settings][1](_string, _length, v)}
            min={1}
            labelText="Length"
        />
        <TextField
            ref={r => charactersInputRef = r}
            focus={isCharactersMenuOpen()}
            readOnly
            labelElement={{
                ref: r => charactersLabelRef = r,
                style: { width: 'min(100%, 328px)' }
            }}
            value={8}
            labelText="Characters"
            trailing={<>
                <Tooltip text="More character options" anchor={charactersBtnRef()}/>
                <TextFieldTrailingButton ref={r => setCharactersBtnRef(r)} data-focus={toggleAttribute(isCharactersMenuOpen())} onClick={(ev) => {
                    setCharactersMenuWidth(getBoundingClientRect(charactersLabelRef!)[_width])
                    openPopover({
                        event: ev,
                        anchor: ev[_currentTarget],
                        popover: charactersMenuRef,
                        position: PopoverPosition[_CENTER_BOTTOM_TO_LEFT],
                        padding: 6.5,
                        gap: 8,
                    })
                }}><Icon filled code={0xE362}/></TextFieldTrailingButton>
            </>}
        />
        <Menu ref={(r) => charactersMenuRef = r} onToggle={(v) => setIsCharactersMenuOpen(v)} style={{"min-width": `${charactersMenuWidth()}px`}}>
            <MenuHeader>Alphabet</MenuHeader>
            <MenuItem
                checked={settings()[_characters][_alphabetUppercase]}
                trailing="A-Z"
                onClick={() => props[_settings][1](_string, _characters, _alphabetUppercase, s => !s)}>Uppercase</MenuItem>
            <MenuItem
                checked={settings()[_characters][_alphabetLowercase]}
                trailing="a-z"
                onClick={() => props[_settings][1](_string, _characters, _alphabetLowercase, s => !s)}>Lowercase</MenuItem>
            <MenuDivider />
            <MenuItem
                checked={settings()[_characters][_numbers]}
                trailing="0-9"
                onClick={() => props[_settings][1](_string, _characters, _numbers, s => !s)}>Numbers</MenuItem>
            <MenuDivider />
            <MenuItem
                checked={settings()[_characters][_symbols]}
                trailing={"<({[!@#$%^&*_-+=~`\\|\"':;?/.,]})>"}
                onClick={() => props[_settings][1](_string, _characters, _symbols, s => !s)}>Symbol</MenuItem>
            <MenuDivider />
            <div class={ CSS.string_custom_character}>
                <TextField
                    labelText="Custom characters"
                    placeholder="#d(23'[])sdf"
                    onInput={(ev) => props[_settings][1](_string, _characters, _customCharacter, ev[_currentTarget][_value])}
                    value={settings()[_characters][_customCharacter]}
                />
            </div>
        </Menu>
    </>)
}

const C: Component<Props> = (props) => {
    const
        _randomizerType = 'randomizerType'
    ;
    return (<div class={CSS.control} data-randomizer={props[_randomizerType]}>
        <Switch>
            <Match when={props[_randomizerType] == RandomizerType[_string]}>
                <$String settings={props[_settings]}/>
            </Match>
            <Match when={props[_randomizerType] == RandomizerType[_numbers]}>
                <Numbers settings={props[_settings]} />
            </Match>
            <Match when={props[_randomizerType] == RandomizerType[_colors]}>
                <Colors settings={props[_settings]} />
            </Match>
        </Switch>
    </div>)
}

export default C