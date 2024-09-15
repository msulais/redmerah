import { _theme, _system, _light, _dark, _includes } from "@/constants/string"
import { getRoot } from "@/constants/window"
import { RootAttributes } from "@/enums/attributes"
import { LocalStorageKeys } from "@/enums/storage"
import { ThemeData } from "@/enums/theme"
import { getLocalStorageItem } from "@/utils/storage"
import { setAttribute } from "solid-js/web"

export function checkTheme(): void {
    const theme = getLocalStorageItem(LocalStorageKeys[_theme])

    if (theme && [ThemeData[_system], ThemeData[_light], ThemeData[_dark]][_includes](theme as ThemeData)) {
        setAttribute(getRoot(), RootAttributes[_theme], theme)
    }
}