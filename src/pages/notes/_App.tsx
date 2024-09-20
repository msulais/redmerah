import { createStore } from "solid-js/store"
import { createSignal, onMount, Show, type VoidComponent } from "solid-js"

import type { Note } from "./_types"
import { _splash, _animate, _spring, _finished, _then, _remove, _new, _edit, _tonal, _trim, _filled, _contents, _value, _currentTarget, _map, _id, _sort, _localeCompare, _title, _notes } from "@/constants/string"
import { AnimationEffectTiming } from "@/enums/animation"
import { ElementIds } from "@/enums/ids"
import { getElementById } from "@/utils/element"
import { setTimeDelayed } from "@/utils/timeout"
import { Commands } from "./_enums"

import App from "@/components/App"
import AppBar from './_AppBar'
import Body from './_Body'
import SideNavigation from './_SideNavigation'
import Dialog, { closeDialog, openDialog } from "@/components/Dialog"
import TextField, { changeTextFieldValue, TextFieldButton } from "@/components/TextField"
import Icon from "@/components/Icon"
import EmojiPicker, { closeEmojiPicker, openEmojiPicker } from "@/components/EmojiPicker"
import Button, { ButtonVariant } from "@/components/Button"
import { preventDefault } from "@/utils/event"
import Emoji from "@/components/Emoji"
import { binarySearch } from "@/utils/data"
import { IDB } from "@/utils/indexeddb"
import { DatabaseNames } from "@/enums/storage"

const _: VoidComponent = () => {
    const db = new IDB(DatabaseNames[_notes])
    const [notes, setNotes] = createStore<Note[]>([])
    const [isSideNavigationExpanded, setIsSideNavigationExpanded] = createSignal<boolean>(true)
    const [selectedNoteId, setSelectedNoteId] = createSignal<number | null>(null)
    const [noteInputEmoji, setNoteInputEmoji] = createSignal<string | null>(null)
    const [noteInputTitle, setNoteInputTitle] = createSignal<string>('')
    const [is_emojiPicker_noteInput_open, setIs_emojiPicker_noteInput_open] = createSignal<boolean>(false)
    const [noteInputOption, setNoteInputOption] = createSignal<'new' | 'edit'>(_new)
    let dialog_noteInput_ref: HTMLDialogElement
    let emojiPicker_noteInput_ref: HTMLDialogElement
    let textField_noteInput_ref: HTMLInputElement

    function command(type: Commands, ...args: unknown[]): unknown { switch (type) {
        case Commands.add_note: {
            setNoteInputOption(_new)
            setNoteInputEmoji(null)
            setNoteInputTitle('')
            changeTextFieldValue(textField_noteInput_ref, '')
            openDialog(args[0] as Event, dialog_noteInput_ref, {
                important: true,
                inputAutoFocus: true
            })
            break
        }
        case Commands.change_note: {
            changeNote(args[0] as number)
            break
        }
        default: return
    }}

    function initDatabase(): void {
        // TODO: init database
    }

    function changeNote(id: number): void {
        setSelectedNoteId($id => $id == id? null : id)

        // TODO: save db
    }

    function addNote(): void {
        const ids: number[] = notes[_map](note => note[_id])
        ids[_sort]((a, b) => a - b)

        let id = 1
        while (binarySearch(ids, id) != null) ++id

        const note: Note = {
            id,
            emoji: noteInputEmoji(),
            title: noteInputTitle(),
            content: null,
        }

        changeNote(id)
        setNotes(notes => [...notes, note][_sort]((a, b) => a[_title][_localeCompare](b[_title])))

        // TODO: save db
    }

    function editNote(): void {
        // TODO: edit note
    }

    function removeSplashScreen(): void {
        setTimeDelayed(() => {
            const splash_ref = getElementById(ElementIds[_splash]) as HTMLDivElement
            splash_ref[_animate](
                {opacity: 0},
                {
                    duration: 1000,
                    easing: AnimationEffectTiming[_spring]
                }
            )[_finished][_then](() => splash_ref[_remove]())
        })
    }

    onMount(() => {
        initDatabase()
        removeSplashScreen()
    })

    const Dialogs: VoidComponent = () => (<>
        <Dialog
            ref={r => dialog_noteInput_ref = r}
            header={noteInputOption() == _new? "New note" : 'Edit note'}
            style={{width: '500px'}}
            actions={<>
                <Button
                    onClick={() => closeDialog(dialog_noteInput_ref)}
                    variant={ButtonVariant[_tonal]}>
                    Cancel
                </Button>
                <Button
                    onClick={() => {
                        closeDialog(dialog_noteInput_ref)
                        if (noteInputOption() == _new) return addNote()
                        editNote()
                    }}
                    disabled={noteInputTitle()[_trim]() == ''}
                    variant={ButtonVariant[_filled]}>
                    {noteInputOption() == _new? "Add" : 'Edit'}
                </Button>
            </>}>
            <form
                style={{display: _contents}}
                onSubmit={(ev) => {
                    preventDefault(ev)
                    if (noteInputTitle()[_trim]() == '') return;

                    closeDialog(dialog_noteInput_ref)
                    if (noteInputOption() == _new) return addNote()
                    editNote()
                }}>
                <TextField
                    placeholder="Title"
                    onInput={ev => setNoteInputTitle(ev[_currentTarget][_value])}
                    ref={r => textField_noteInput_ref = r}
                    trailing={<TextFieldButton
                        onClick={(ev) => openEmojiPicker(ev, emojiPicker_noteInput_ref)}
                        focused={is_emojiPicker_noteInput_open()}>
                        <Show
                            when={noteInputEmoji() == null}
                            fallback={<Emoji emoji={noteInputEmoji()!}/>}>
                            <Icon code={0xE747}/>
                        </Show>
                    </TextFieldButton>}
                />
            </form>
        </Dialog>
    </>)

    const Emojis: VoidComponent = () => (<>
        <EmojiPicker
            ref={r => emojiPicker_noteInput_ref = r}
            onSelectEmoji={emoji => setNoteInputEmoji(emoji)}
            onToggleOpen={isOpen => setIs_emojiPicker_noteInput_open(isOpen)}>
            <Show when={noteInputEmoji() != null}>
                <div style={{width: '100%', padding: '0 12px 12px 12px'}}>
                    <Button
                        style={{width: '100%'}}
                        variant={ButtonVariant[_tonal]}
                        onClick={() => {
                            setNoteInputEmoji(null)
                            closeEmojiPicker(emojiPicker_noteInput_ref)
                        }}>
                        <Icon code={0xE5E9}/>No emoji
                    </Button>
                </div>
            </Show>
        </EmojiPicker>
    </>)

    return (<App
        appBar={<AppBar command={command}/>}
        leftSideBar={<SideNavigation
            expand={isSideNavigationExpanded()}
            notes={notes}
            command={command}
        />}>
        <Body
            notes={notes}
            selectedNoteId={selectedNoteId()}
        />
        <Dialogs/>
        <Emojis/>
    </App>)
}

export default _